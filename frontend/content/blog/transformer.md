---
title: "Building a transformer, not quite from scratch"
description: "spoiler alert: used pytorch, numpy, and claude"
date: 2026-09-06
slug: "transformer"
---

## The Rules

Some people really love building projects with nothing but the most basic tools: building a neural network in C, writing `malloc` from scratch, etc. I do like this spirit: it gives you the strongest understanding of how something works under the hood, and improves raw implementation ability. However, doing some things are truly low ROI.

In this case, my goal is to give myself a solid understanding of how a transformer works, from a ML architecture perspective. So, I made the decision that building certain parts from scratch -- implementing backpropagation myself, writing an autograd engine, etc -- have low ROI and don't align with my goals.

"Raw implementation ability" is also a skill whose future is muddy, with coding agents clearly outperforming humans at writing boilerplate, at the very least. However, writing some parts by hand is arguably still useful for learning. But the tradeoffs of AI coding is a much bigger topic for a different time.

So, I outlined a few rules for this project:

- pytorch will be used for any ML boilerplate (backprop, autograd, data structures like `Tensor`, etc)
- My only reference will be [Attention Is All You Need](https://arxiv.org/abs/1706.03762), as practice for reading papers
- I can use Claude to explain and clarify concepts in the paper, but I have to write the transformer's forward pass myself, and without pytorch (ex. [torch.nn.MultiheadAttention](https://docs.pytorch.org/docs/2.14/generated/torch.nn.MultiheadAttention.html))
- Claude can handle general boilerplate, like `argparse`

## Reading the Paper

This turned out to be both easier and harder than expected.

The easy part: there was no advanced math like I imagined there might be, which I was originally a bit wary of. My first-year linear algebra course was more than enough.

The hard part: the paper is sometimes imprecise and hand-waves over some implied details. Or, it assumes readers have background knowledge about certain topics. Some examples:

- how cross-attention works (*Q comes from the decoder; K, V come from the encoder*)
- the purpose of LayerNorm (*stability; keeps mean 0 and variance 1*)
- the purpose of residual connections (*lets each layer learn a "refinement" - what to adjust relative to input; helps preserve information from earlier layers*)

## Implementation

I implemented required layer classes one by one -- `FeedForward`, `Attention`, `MultiHeadAttention`... eventually up to `Decoder`, `Encoder`, `Transformer`. 

examples of some interesting things I learned during the process:

- the necessity of using a good weight initalization (such as Xavier/Glorot init) as opposed to sampling from a naive normal or uniform distribution, to avoid exploding gradients/activations
- subtracting max before exp in softmax for numerical stability, works because softmax is shift-invariant
- the cleverness of positional encoding:

    $PE_{(pos, 2i)} = \sin(pos / 10000^{2i/d_{model}})$
    $PE_{(pos, 2i+1)} = \cos(pos / 10000^{2i/d_{model}})$

    not only because sinusoids are linear combinations of each other (as stated in the paper); but also, different frequencies can help capture position at different scales, and help encode position more uniquely.

## Training and eval

I trained this toy transformer on 3 tasks of increasing difficulty. 

### 1. reversing a sequence of fixed length

for example: passing a sequence like `[1, 4, 6, 2, 3, 5, 8, 7]` into the encoder, feeding that and `[<sos>]` into the decoder, and expecting the decoder to autoregressively generate `[7, 8, 5, 3, 2, 6, 4, 1, <eos>]`. 

This task was very easy for the model; very quickly the accuracy converged to ~100%, loss went to near-zero, only requiring about ~2,000 steps. 

```
n@Ns-MacBook-Air transformer % python reverse.py generate --name model 1 4 6 2 3 5 8 7
input:  tensor([1, 4, 6, 2, 3, 5, 8, 7])
output: tensor([7, 8, 5, 3, 2, 6, 4, 1])
```

since I only included sequences of a fixed length (8) in the training data, for sequences of different length the model would output garbage. which shows that the model never learned a generalized meaning of what it means to "reverse" a sequence.

### 2. sorting a sequence of tokens

This one turned out to be much more difficult than the previous one.

![bad sort](/blog/transformer/bad_sort.png)
