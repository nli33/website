---
title: "Building a transformer, not quite from scratch"
description: "spoiler alert: used pytorch, numpy, and claude"
date: 2026-09-06
slug: "transformer"
thumbnail: "blog/transformer/shkspr.png"
---

# The Rules

Some people really love building projects with nothing but the most basic tools: building a neural network in C, writing `malloc` from scratch, etc. I do like this spirit: it gives you the strongest understanding of how something works under the hood, and improves raw implementation ability. However, doing some things are truly low ROI.

In this case, my goal is to give myself a solid understanding of how a transformer works, from a ML architecture perspective. So, I made the decision that building certain parts from scratch -- implementing backpropagation myself, writing an autograd engine, etc -- have low ROI and don't align with my goals.

"Raw implementation ability" is also a skill whose future is muddy, with coding agents clearly outperforming humans at writing boilerplate, to say the very least. However, writing some parts by hand is arguably still useful for learning.... but the tradeoffs of AI coding is a much bigger topic for a different time.

So, I outlined a few rules for this project:

- pytorch will be used for any ML boilerplate (backprop, autograd, data structures like `Tensor`, etc)
- My only reference will be [Attention Is All You Need](https://arxiv.org/abs/1706.03762), as practice for reading papers
- I can use Claude to explain and clarify concepts in the paper, but I have to write the transformer's forward pass myself, and without pytorch (ex. [torch.nn.MultiheadAttention](https://docs.pytorch.org/docs/2.14/generated/torch.nn.MultiheadAttention.html))
- Claude can handle general boilerplate, like `argparse`

# Reading the Paper

This turned out to be both easier and harder than expected.

The easy part: there was no advanced math like I imagined there might be, which I was originally a bit wary of. My first-year linear algebra course was more than enough.

The hard part: the paper is sometimes imprecise and hand-waves over some implied details. Or, it assumes readers have background knowledge about certain topics. Some examples:

- how cross-attention works (*Q comes from the decoder; K, V come from the encoder*)
- the purpose of LayerNorm (*stability; keeps mean 0 and variance 1*)
- the purpose of residual connections (*lets each layer learn a "refinement" - what to adjust relative to input; helps preserve information from earlier layers*)

# Implementation

I implemented required layer classes one by one -- `FeedForward`, `Attention`, `MultiHeadAttention`... eventually up to `Decoder`, `Encoder`, `Transformer`. 

examples of some interesting things I learned during the process:

- the necessity of using a good weight initalization (such as Xavier/Glorot init) as opposed to sampling from a naive normal or uniform distribution, to avoid exploding gradients/activations
- subtracting max before exp in softmax for numerical stability, works because softmax is shift-invariant
- the cleverness of positional encoding:

    $PE_{(pos, 2i)} = \sin(pos / 10000^{2i/d_{model}})$

    $PE_{(pos, 2i+1)} = \cos(pos / 10000^{2i/d_{model}})$

    the paper's own justification is that this lets the model learn to attend by relative position: for any fixed offset `k`, `PE(pos+k)` can be written as a linear function of `PE(pos)`. on top of that, using many different frequencies lets the encoding capture position at multiple scales at once instead of just one.

# Training and eval

I trained this toy transformer on 3 tasks of increasing difficulty. 

## 1. reversing a sequence of fixed length

for example: passing a sequence of tokens like `[1, 4, 6, 2, 3, 5, 8, 7]` into the encoder, feeding that and `[<sos>]` into the decoder, and expecting the decoder to autoregressively generate `[7, 8, 5, 3, 2, 6, 4, 1, <eos>]`. 

This task was very easy for the model; very quickly the accuracy converged to ~100%, loss went to near-zero, only requiring about ~2,000 steps. 

For this, the model's hyperparameters were:
- `N=2` multi-head attention + FF layers
- 4 attention heads
- vector representations of dimension `d_model=64`
- FF hidden dim of 128

```
n@Ns-MacBook-Air transformer % python reverse.py generate --name model 1 4 6 2 3 5 8 7
input:  tensor([1, 4, 6, 2, 3, 5, 8, 7])
output: tensor([7, 8, 5, 3, 2, 6, 4, 1])
```

since I only included sequences of a fixed length (8) in the training data, for sequences of other lengths the model would output garbage. which shows that the model never learned a generalized meaning of what it means to "reverse" a sequence.

## 2. sorting a sequence of *arbitrary* length

This one turned out to be much more difficult than the previous one.

![bad sort](/blog/transformer/bad_sort.png)

After a ton of training, the loss and accuracy both fluctuated wildly. The model particularly struggled with sequences of varying length, since sorting a length-5 sequence is a far easier problem than a length 20+. 

What's more: since sorting is an algorithmic problem and not a pattern-matching one, it doesn't come naturally to a model this small and undertrained. In particular, the model doesn't even understand that `3` > `2`, since both of these tokens are merely vectors learned during training. Chain-of-thought might help with this problem, but for now my model only learned an incredibly fuzzy version of "sorting".

So, in order, the things I tried to improve:

- lowering the learning rate (`1e-3` to `1e-4`) fixed a decent amount of the instability.
- I tried various hyperparameter changes: making the model deeper (raising to `N=4`), varying `d_model`

These two helped somewhat, but the model still made mistakes on somewhat long sequences, or simply outputted garbage for them.

Finally, the best improvement I made was implementing batching. Without batching, only one training example is run at a time. A single training example's difficulty could vary wildly: length-2 might be trivial, length-20 hard. So, a single gradient step based on this would be noisy and unreliable to the overall improvement of the model.

With batching, the model sees a wider range of examples; each gradient is now from a mix of easy and hard examples, meaning the model more reliably improves for the whole task. 

I later tried to also make batching speed up training (vectorizing it so a batch runs as one matmul instead of looping over examples). It didn't immediately improve -- padding shorter sequences up to the batch's longest sequence ate most of the gain, and it took a couple more rounds of fixes (grouping similar-length examples together, then vectorizing attention itself) before it was actually faster than the simple version.

![good sort](/blog/transformer/good_sort.png)

With these changes, the model improved a lot on the sorting task, though the limitations from its small size remained. 

## 3. shakespeare "chatbot"

For the previous two examples, we had an objective measure of correctness. For real-world LLM pretraining, the task is often much evaluated much more subjectively (ex: code quality). 

so for the third task, I wanted something closer to that: real English text instead of a synthetic alphabet. I landed on a dialogue task using [tinyshakespeare.txt](https://github.com/karpathy/char-rnn/blob/master/data/tinyshakespeare/input.txt): given one speaker's line, predict the next speaker's line. 

Concretely, the data pipeline splits the play text into turns, keeps only the blocks that start with a speaker name (`"ROMEO:"`), and pairs up consecutive turns -- turn *i* becomes the input, turn *i+1* becomes the target. This is a step up from reverse/sort: there's no small synthetic alphabet or algorithmic ground truth to fall back on, just "however Shakespeare's characters actually talk to each other".

Architecturally I didn't change much -- same model, same hyperparameters that worked for sort. I also kept char-level tokenization instead of something fancier.

Most of the actual work here ended up being about data, not the model. I moved onto a cluster GPU and trained a bigger version of the model on `tinyshakespeare.txt`. The output was decent: real words, correct spacing, a bit of archaic English rhythm, but nowhere coherent. 

But meanwhile, the accuracy numbers were suspicious: they'd jump around a lot (ranging between 0.6 to 0.97), probably suggesting that the model was straight up memorizing a handful of lines while failing to generalize the rest. 

considering the numbers it makes sense: `tinyshakespeare.txt` is a pretty small dataset, and training for that long meant the model saw each line **over a hundred times**, which is probably a recipe for memorization.

I added a 90/10 train/validation split, so I could measure overfitting instead of just eyeballing noisy accuracy. And instead of `tinyshakespeare.txt`, I downloaded a file of Shakespeare's complete works, cleaned it up to fit the pipeline, and ended up with a few times more training data.

Here was probably the biggest lesson of the whole project:

I trained on both the small and the big corpus, same architecture, same hyperparameters, no other changes. They took a similar number of passes over their data, but the bigger, more varied dataset ended up noticeably better on validation than the smaller one. Same model, same setup, but better data led to a better result. 

In other words: for this project, throwing more/better data at the model, without touching the model itself at all, was enough to meaningfully improve it.

Beyond this project, this probably means that pretraining data is at least as important (if not more important) than model architecture, but that might be something i need to empirically verify on my own.

## one last slight wrinkle: temperature

A small problem once I started generating longer completions: the model kept getting stuck repeating itself: with phrases like "the so the so the so...". 

This turned out to be an inference problem: I was always picking the single most likely next character (always taking argmax from logits). once the model gets slightly attached to a short phrase, always picking the "best" option puts it in a loop. The fix was to sample from a distribution instead of always picking the top choice -- occasionally letting a slightly-less-likely token through, which breaks loops:

```
prompt: "What news from the north?"

always pick best:  "And shall the stay, and the shall the strands the desh a
                     shall the dester the dest a speed the shall the dought
                     the sould the shall and and a a spon the the sould..."
sample instead:     "What, epseles hear mears will thou comest allss his a
                     heade man a man buttines with han in off astur?"
```

# What's next

A few directions I'd like to try, beyond this "toy transformer", continuing on the llm roadmap:

- training something closer to GPT-2 quality, instead of a toy-scale model
- actually scaling up training -- adding infrastructure considerations
- reading the Kaplan et al. and Chinchilla scaling-laws papers, to understand systematically tradeoff between data, model size, and compute to make an LLM better
- implementing more complex architecture like mixture-of-experts (MoE)