---
title: "Building a decent visual document retriever"
description: "architecture explanation + development process"
date: 2026-09-13
slug: "dsocr-retriever"
---

This is going to be a somewhat terse/long post describing the *end-to-end* architecture of a [visual document retriever](https://huggingface.co/docs/transformers/en/tasks/visual_document_retrieval), which I adapted myself based on [DeepSeek-OCR](https://github.com/deepseek-ai/DeepSeek-OCR). 

Some background knowledge about language models & general ML is assumed.

I'll also mention the development process, failed vs. succeeded experiments, and next steps.

# 0. Background 

**What is retrieval?**
- the process of identifying/ranking documents that are relevant to a query
- methods include formulas like [BM25](https://en.wikipedia.org/wiki/Okapi_BM25) or vector-similarity to calculate relevance between documents and queries

**What is visual document retrieval?**
- A form of retrieval that uses images/"screenshots" of pages as documents. Example: a PDF scan of a paper
- The "screenshot" itself is encoded into a single vector, without explicitly parsing the text present in the screenshot

**What is DeepSeek-OCR?**
- A model that encodes an image down to a **relatively small** set of *vision tokens*, which contain the page's content
- **Motivation:** since LLMs have trouble with long context, DeepSeek-OCR is an exploration of using "vision" as a medium for **compression**: a big document is turned into an image, the image is encoded into a small number of useful vision tokens 
- In the original work, these vision tokens are converted into OCR'd text, but this is only a "proxy task" that demonstrates the accuracy of the "compression into vision tokens"

**What was the work I did?**
- *at a high level*, DeepSeek-OCR was designed for generating text from an image. It was not designed for retrieval (ie. page/query vectors produced should be similar if their meaning is relevant to each other), so some parts of the model needed to be **finetuned**. Which parts specifically? I will mention later.
- DeepSeek-OCR only has one API for "image in -> generated text out". there's no API for "return page vector given page" or any helpful intermediate steps, so some engineering work into DS-OCR's internal code had to be done.
- To actually make the retriever somewhat good, many **experiments** had to be done tweaking its architecture, data, and training process. (More on this later)

# 1. Architecture of DS-OCR

If you're not interested in the end-to-end architecture details you can skip this part.

DeepSeek-OCR consists of the following components:

- **"vision tower"** (`DeepEncoder`): this is the part that turns an image into vision tokens, and is the more novel part of the architecture.
  - an image goes through: SAM -> CLIP -> projector
- **decoder** (DeepSeek3B-MoE-A570M): a mixture-of-experts decoder based on deepseek v2, made specifically for DS-OCR. This model takes in the vision tokens and autoregressively generates text.
  - this is the step with the actual "OCR", decoding the vision tokens back to text (specifically markdown)

Another note, the entire model has a "resolution" setting that decides how much of the page's detail to preserve. Later on we will see that this setting controls the # of vision tokens and thus the OCR/compression accuracy.
- The settings are `tiny`/`small`/`base`/`large`/`gundam`, more later on what they precisely mean.

## 1.1. The image

We begin with an image of a page, which is a grid of (R, G, B) pixels. This is turned into a **fixed-size** tensor via resizing and padding. 

We will assume we are using the `base` setting, which means the image is resized to 1024x1024. The pixel values are normalized to [-1, 1], and the result is a tensor of shape [1, 3, H=1024, W=1024] (3 channels for R/G/B)

## 1.2. The resolution setting

`tiny/small/base/large` resizes the whole image down to 512/640/1024/1280 px.

`gundam` is a special setting which crops the original image into several tiles. TL;DR:
- several tiles at full *resolution*, over different regions of the image. These tiles are always 640x640
- one downsampled (blurry) tile of 1024x1024 of the whole image

An example of `gundam`'s tiling: if we have an 1000x1300 image, the width/height ratio is ~0.769. The closest whole number ratio that is small enough* is 2:3 = 0.667. So, a version of the image is first stretched to 640x2=1280 by 640x3=1920, then cut down into a 2x3 grid of 640x640 tiles.

The TL;DR for this section is that the image is cut into tiles. The **tradeoff** is that (more tiles & higher resolution) = finer detail = more vision tokens = more compute required later on.

\*2-9 tiles along each axis are produced.

## 1.3. SAM

SAM = Segment Anything Model, and is the first stage of the vision tower.

- originally built by Meta for [image segmentation](https://en.wikipedia.org/wiki/Image_segmentation): drawing precise pixel masks around objects.
- DS-OCR uses SAM to extract **local** detail from images.
- SAM internally uses windowed attention (more on this in a sec) to process high-resolution images efficiently 

The [batch, 3, H, W] tensor (batch=N tiles for gundam and batch=1 otherwise) is inputted into SAM. 

Recall that we are using the `base` setting as an example, so our original image is 1024x1024. 

1. each H x W image is carved into a [h, w] grid of 16x16-size cells. In our example, h=w=64 since 1024 / 16px = 64 cells.
2. each 16x16 px cell is reshaped into a 768-dim vector (16 x 16 x 3 color channels), and multiplied by a learned matrix for a new dim-768 vector (\*\*\*\* purpose?). 
    - Note that each vector contains **local visual detail** corresponding to the 16x16 region of the original tile, which plays into the whole purpose of SAM.
3. the set of vectors goes through several transformer blocks.
    - **windowed** self-attention is applied. In terms of the original image's geometry as a [64, 64] grid of cells: each cell attends to other cells in a [14, 14] window in the grid.
4. several convolutional layers are applied, reshaping the tensor from 64x64x768 -> 64x64x256 -> 32x32x512 -> 16x16x1024, with stride-1 and stride-2 kernels.
5. the final output is a [1024, 16, 16] tensor.

TL;DR: the purpose of SAM is to capture fine-grained local visual detail. It inputs a 1028x1028 image (for the `base` setting) and outputs a [1024, 16, 16] tensor
- image sliced into [16, 16] grid of cells
- each cell encoded into 1024-dim vector that encodes local detail (1024 channels)

## 1.4. CLIP

CLIP = Contrastive Language-Image Pre-training (OpenAI, 2021)

This is an image encoder + text encoder trained on ~400M pairs of (image, caption), so that matching pairs' vectors are close together.

1. SAM's [batch, 1024, 16, 16] output grid is fed into CLIP. 
2. It is flattened/transposed into [batch, 256, 1024]
3. A `CLS` token is appended to the sequence:
    - this is a learned vector that is a fixed, trainable parameter for the whole model
    - original purpose in CLIP: the final vector at that position after attention is taken to represent the whole input
4. position tokens (via learned position embeddings) are added to each of the 257 tokens
5. bidirectional self-attention with 24 transformer blocks
    - **notice the difference from SAM:** SAM uses windowed attention (finegrained per-region detail) but CLIP lets all 257 tokens attend to each other, which is expensive but adds global context.
6. `CLS` token is actually discarded
7. Output shape remains [batch, 256, 1024]

Finally: SAM's output is **concatenated** with CLIP's output, for a 2048-dim vector for each grid patch. 

TL;DR: CLIP takes SAM's vector representations, performs bidirectional attention over the whole sequence for global context. Its output is concatencated with SAM's vectors for a sequence of 2048-dim vectors for each 16x16 patch on the grid.

## 1.5. assembling vision tokens

This is the final step for turning the original image into vision tokens. It's done with one single learned linear layer, 2048 -> 1280. The layer's only job is dimension reduction. 

As a note, the "projector" in the vision tower is just the step of concatencating SAM + CLIP outputs, then reducing it to 1280-dim with this linear layer.

The number `1280` is important because it is the width (dimension of vector representations) of the DeepSeek-based decoder mentioned earlier.

We now have the 256 vision tokens! `256` is indeed the budget for the `base` setting. For `tiny/small/base/large/gundam`, 64 / 100 / 256 / 400 / 100n+256 vision tokens are produced respectively, where `n` is the number of full-resolution tiles for gundam.

### 1.5.1 Assembling gundam's tiles

Recall that for gundam, 1 page is broken down into several images: the lower-resolution global image and full-resolution crops (I've been calling them tiles/crops interchangably). 

All of the vision tokens from the different crops need to be assembled into one flat sequence.

The vectors are laid out row-by-row, tile-by-tile, starting with the local tiles and ending with the global image's vectors.

```
content = [local tile 1 row1, ..., local tile1 row2, ..., ... local tiles done ...,
   glob row1, ..., glob row2, ..., ... glob done]
```

Another sequence `full` is constructed alongside, with two kinds of marker tokens added:
- `image_newline`: after each row of a grid, mimicking how a human would read text line by line
- `view_separator`: one single token after all other image/crop tokens, marks "the end of the block of vision-tokens" for the decoder

```
full = [local tile 1 row1, ..., newline, local tile1 row2, ..., newline, ... local tiles done ...,
   glob row1, ..., newline, glob row2, ..., newline, ... glob done ...,
   view_separator]
```

## 1.6 The decoder + query tower

recall the decoder used in DS-OCR is DeepSeek3B-MoE-A570M, a DeepSeek-v2-based model.

The "query tower" -- the sequence of layers which turn a text query into vectors -- is very simple:

1. the query text is tokenized into 1280-dim vectors
2. passed into the decoder (causal self-attention + MoE Feedforward layers), and another sequence of 1280-dim vectors is produced
3. last-token pooling -- the one vector at the last position is used to represent the whole query
4. L2-normalized

A single 1280-dim vector is produced.

-----

After all that, we are left with 2 things: 

A **sequence** of 1280-dim vectors that represent the page's content, from the vision tower (SAM -> CLIP -> projector). These are the "vision tokens" we've been talking about, and the specific length depends on the resolution setting.

A single 1280-dim vector that represent's the query's content, from the query tower / decoder.

**Everything so far is the original DeepSeek-OCR model.** At this point, in the original use case, the vision tokens are decoded into text, to finish OCR-ing the text present in the original image.

However, for our purpose (retrieval) there is an additional step needed: We need a way to turn the page into a single vector, in a way that meaningfully retains content. Only after that, we can compare the single page vector with the query vector to compute similarity between the document and the query.

# 2. Turning a page into one vector

Now, I had to make some design decisions, none of which were immediately obvious whether they'd work, so I had to run a lot of experiments.

I will mention the results of these designs later.

## Design A: vision-tower only, no decoder

The more obvious design choice. Since we already have meaningful vision tokens from SAM -> CLIP -> projector, just pool those vectors directly into one vector, and avoid applying the decoder to the vision tokens.
- This preserves one of the original intents of this retriever, which was **efficiency**. 
- With this design, the decoder would never see the documents/pages at all; its only purpose would be for the queries

Only using mean pooling (averaging all the vision tokens) throws away a lot of detail, so we need to add 2 learned components:

AttentionPool:
- basically an attention layer, except we only use one single Q vector, which is a single constant learned parameter
- K/V: the vision tokens themselves
- softmax and summed
- collapsed down to one 1280-dim vector 

RetrievalHeads:
- page_head: a Linear(1280, proj_dim) layer applied to the page vector from AttentionPool
- query_head: a similar linear layer applied to the query vector

Why can't we directly compare a pooled page vector and the query vector? It seems like we can - they are both conveniently dim-1280 so it seems "intended", but those vectors currently are not in the same representation space. That is, they are not necessarily mathematically close (via dot product/cosine sim) if they have a similar meaning yet, which is required for similarity comparison. So, we need these learned components to "bridge" these two representation spaces.

## Design B: decoder over both towers

In Design A we avoided feeding the vision tokens into the decoder. With this design, we do.

we append an EOS token at the end, and use last-token pooling like earlier with the query tower.

After we get a single page vector from pooling, it can now be directly compared to the query vector, since the same decoder was applied to both the page and query vectors, leading them to share the same representation space.
- How? Because the deepseek-based decoder was already trained by the authors end-to-end specifically on this task: taking vision tokens then producing accurate transcriptions of the image. So the decoder has already learned how to "take a sequence of vision tokens, produce hidden states that reflect page content"

## Design C: head-less

We remove the page_head and query_head from RetrievalHeads, only keeping AttentionPool. We are still pooling the set of 1280-dim vectors down to one via attention pooling. 

- This was tried because this design was validated on Qwen2-VL (took it from nDCG 0.062 -> 0.551).
- This had worked for Qwen because for Qwen-vl, both vision/query towers are computed by the same transformer, so the "bridging head" was redundant.
- On the other hand, for us, DS-OCR's towers are separate (SAM+CLIP+projector vs. deepseek decoder, which happen to share a width of 1280), so we still need a way to bridge these two spaces... so as it turns out this design **failed**, which I'll go into more later.

## Cost tradeoff between designs

Design B is more expensive because it runs the decoder over every page's vision tokens. However, as we'll see in a bit, it turns out to be necessary to unify the vectors' representation space, which is reflected in the experiments I ran.

# 3. Training

## 3.1 LoRA

I did not fine-tune the whole model for this project; the deepseek decoder alone is many billions of parameters. Fine-tuning all of that is very expensive and risks [catastrophic forgetting](https://en.wikipedia.org/wiki/Catastrophic_interference)

A brief explanation of what LoRA does: it's a technique for fine-tuning a model.
- If I want to update a weight matrix W, instead of training all of the weights, we **freeze W entirely**, and we add two small matrices `A[in_dim, r]` and `B[r, out_dim]` where r is the "rank", which is a small number (r=8 in this project). Hence the name low-rank adaptation (LoRA).
- The layer becomes `input @ W + input @ A @ B`
- only A and B are tuned during training.
- In general, LoRA can be used on any layer involving a matrix multiplication (?)

In our case, A and B together only have (1280x8)x2 = ~20k parameters.

Here is the list of components that were adjusted during training:
- ❌ SAM: fully frozen, no LoRA
- ❌ decoder's MoE FF layers: fully frozen, no LoRA
- ✅ decoder's attention sublayers: LoRA-adapted
- ✅ CLIP: LoRA-adapted
- ✅ (2048, 1280) projector: trained fully

## 3.2 Training data & Objective

I used [ColPali's](https://arxiv.org/abs/2407.01449) [training data](https://huggingface.co/datasets/Tevatron/colpali). The data contains a bunch of queries and documents.

Each query comes with:
- one positive page (the page that answers the query)
- a list of negative pages (pages that don't match the query)
    - "hard negatives": pages that were similar-looking but not relevant. These are trickier for the model to grasp & are good to include in training
    - \+ every other query's positive page (being irrelevant) can also be included in negatives

As we've been covering, the queries go into the query tower, pages go through whichever page tower we are using (Designs A/B/C). Similarity is computed with a dot-product between them. Recall that both the page and query vectors are L2-normalized, so dot product == cosine similarity. We want to maximize the positive page's similarity value while minimizing the negative pages'.

## 3.3 GradCache

Generally, more negatives during contrastive training are better (while considering negatives' quality/hardness). However, more negatives = more images that need to run through the page tower, which is expensive. Every intermediate value during forward has to stay in memory for backprop. 

GradCache avoids this *somehow*, and I haven't gone through the specifics of how GradCache works -- would probably be an interesting read for another time -- but the effect is that after using GradCache, we use 2x the page-encoding compute, but encoding becomes **independent** of GPU memory.

# 4. Eval

Obviously eval queries and corpus are both separate from training. Each query has a qrel (an ID of a known-correct page, established by dataset author).

For an eval query, the query vector is compared against every other page vector (as computed by our towers), and the pages are sorted by similarity score. 

There are several metrics used for Eval (this is turning into a crash course in information retrieval but ok):

Recall@k: 
- what fraction of correct page(s) appear **somewhere** in the top-k documents
- ex: Recall@10 = 1 if the correct page is in positions 1-10, otherwise = 0. 
- averaged over all data samples

MRR@k: 
- gives a score of $1/rank$ if the correct page's rank is within the top-k, otherwise score of 0

nDCG@k:
- similar to MRR, but each page contributes a "gain", and all pages in the top-k are considered. 
- in our case, there might be several correct documents, so each correct document's gain is considered.
- Instead of discounting with $rank$ in the denominator as in MRR, $\log_2(rank + 1)$ is used. 

# 5. Experiment history

Here are the most of the experiments that I had to run during the development process. These took on the order of hours-days on a good GPU. 

## 5.1 Design A

- small batch size (4 queries / step)
- didn't know to use ColPali's hard negatives
- due to GPU's memory ceiling, only 12-20 pages contrasted against each other per sample (haven't used GradCache yet)
- **Near-perfect in-batch accuracy** (amongst the 12-20 pages it can find the relevant page), but hasn't generalized enough to be able to "find the right one out of 4000 docs" during eval
- Final: 0.052 nDCG@10
- Conclusion: possibly too few negatives per step?

## 5.2 Negative-count fixes
- Tried GradCache, increased pool size (total contrastive documents, both +/-) to 24
- Final, 0.0911 nDCG, +47% improvement but still garbage

## 5.3 reproduced another retriever

At this point, I'd tried several things which didn't work, so I decided to reproduce an experiment that already has been shown to work. 

- Reproduced [DSE's](https://arxiv.org/abs/2406.11251) training recipe and backbone (Qwen2-vl-2b)
- Architecture: no projection head, vision tower is frozen, eos pooling
- Final: 0.5506 nDCG

## 5.4 tried to naively use same recipe

- no "bridge" heads, freeze CLIP and SAM, fixed temperature of 0.02
- Regressed from 0.052 to 0.0225

As an ablation, I tried keeping the heads, but didn't improve.

- Conclusion: freezing CLIP was harmful; removed many trainable vision-side parameters

## 5.5 Design A but up pool size

- keeping original heads, using GradCache, increased pool size to 48
- Final: 0.110 nDCG, still nowhere near Qwen/DSE

## 5.6 Design B

This was a good fix, basically running the decoder over the vision tower as well. 

- nDCG = 0.4142, a major improvement
- adding GradCache with a pool of 24: 0.429, small improvement
- This confirmed that when the page/query vectors are actually in the same representation space, a few number of negatives (~9-13) are **sufficient**

## 5.7 Token-budget tiers

With the so-far-best run of 0.429 (decoder after vision tower + GradCache), I ran a full experiment at all resolution settings to obtain a curve of token budget vs. retrieval quality (nDCG).

Results:

![token budget vs. retrieval quality curve](/blog/dsocr-retriever/5.7.png)

This answers one of the original research questions, which was **"how much does visual detail matter for retrieval quality"**. 

It was a bit concerning that steep gains occur over tiny->small->base but are almost flat in base->large->gundam, despite far more decoder compute.

## 5.8 Scaling training data

The last run only used 3000 queries from the dataset, and each query was seen ~3.2 times. So, I built a larger 8000-query training set and trained for ~1.2 epochs. 

This produced 0.5467 at gundam (+9.1%) and the gain held at every tier, and the retrieval quality matched Qwen2-vl. 

Apparently retrieval quality scales up with increase in training data. So, I did some extra runs with even more data: one run with 32,000 queries at `base` and `gundam`, and another run with 118,000 queries (almost all data samples in ColPali training data) at `gundam`. Both of these improved retrieval quality by varying degrees.

![all comparison](/blog/dsocr-retriever/5.9.png)

## 5.9 Eval on external benchmark

Using the best `gundam` run trained on 118k queries, I evaluated the model on ViDoRe, a benchmark for visual document retrieval. I evaluated on both ViDoRe v1 and v3 and the results differed dramatically:

- ViDoRe v1: 0.759 nDCG, 10 English datasets. A decently strong result, but the caveat is that several datasets are the same source datasets that were seen in training (no leakage / identical data samples, but there is a heavy topic overlap with training).
- ViDoRe v3: 0.191 nDCG. v3 of the dataset has much more diverse topics like finance, pharma, physics, etc. The lowest dataset was finance at 0.066, the highest computer_science at ~0.4. 

## 5.10 Cheap adjustments

Aside from data scaling, I also tried some small tweaks to the architecture:

- Using LoRA rank 32
- Using LoRA rank 16
- query max length 128 instead of 64
- query mean-pooling instead of last-token pooling

All 4 barely moved the needle, and the last change actively resulted in a regression. 

## 5.11 MaxSim

Finally, I was tinkering with slightly different architectures. 

I tried adding an intermediate step in the vision tower: splitting each page into 8 "bands" (rows). Each of these bands are then scored individually, and the whole document's score is taken as the maximum of the bands' scores. In other words taking the max similarity between a query and any of a document's 8 "chunk" vectors.

This didn't work and resulted in a slight regression, probably because it allows a single deceptively-similar chunk inflate the whole document's score.

The motivation behind this was to try a multi-vector variant; the ViDoRe leaderboards are generally dominated by multi-vector retrievers (only looking at retrieval quality). 

# 6. Conclusion + next steps

The 0.759 number on ViDoRe v1 is a decently strong number, but in general the ViDoRe leaderboards are dominated by multi-vector retrieval models: using multiple vectors per document instead of only one. Multi-vector models have higher retrieval quality at the expense of compute, while single-vector models encode less detail in their sole page vector, but have less overhead.

One future direction is to formulate a "middle-ground" architecture between multi-vector and single-vector, combining some of the fine-grained detail of multi-vector with the higher computational/storage efficiency of single-vector. A very similar work is [Multi-Prefix Embedding](https://arxiv.org/pdf/2606.23642), but this was originally for text documents and needs to be adapted for visual documents.

# 7. Meta-comment

**"Why did you write such a long post."**

DeepSeek-OCR is a decently complex model. Writing this post helped me: 
1. document my development/experiment process somewhere
2. practice understanding a complex model architecture end-to-end
3. learn or review interesting concepts along the way: LoRA, GradCache, convolutions

# 8. Relevant materials

[Document Screenshot Embedding](https://arxiv.org/abs/2406.11251) (DSE) - Ma et al., 2024

[ColPali](https://arxiv.org/abs/2407.01449) - Faysse et al., 2024

These were published basically at the same time in 2024, and were basically co-founding-papers (?) of visual document retrieval.

I had the privilege of working with Dr. Ma on my research co-op -- actually, he put me on to this whole DeepSeek-OCR thing \:^)