---
title: "Building a chess engine"
description: "a reflection on debugging, testing, and ai coding"
date: 2026-09-10
slug: "chess-engine"
---

[Silverfish](https://github.com/nli33/silverfish) is a chess engine I wrote in Golang. Despite the seemingly simple premise of a chess engine -- finding the best move in a position -- this might be my biggest project in terms of engineering time and pure "lines of code written".

I won't go through the whole development story since it's pretty long, but here are some of my reflections.

# debugging

DAMN, debugging a chess engine is hard. 

when your engine is making bad moves (sometimes straight up blunders), it is incredibly difficult to tell where the bug actually originates from. 

i mean, in this example of "playing bad moves", most likely the bug is in search. That's because other components like the NNUE or move-generation are a lot more testable and can be ruled out quickly. 

But still, search is a decently complicated recursive function (negamax), with many considerations like alpha/beta cutoffs, search time limits, [quiescence search](https://en.wikipedia.org/wiki/Quiescence_search), move ordering, etc. Any of those components being incorrect would surface in the exact same way (playing bad moves), impossible to distinguish which is the culprit.

Often times I would pull up the Lichess board editor, build a tactical position, watch my engine get it wrong, and just sit back and *think* about what could possibly be causing the issue. Maybe the engine was hungry to get checks? Maybe it wasn't actually searching deep enough and the broadcasted UCI messages are wrong? 

Or, I could put my face up to the screen and scrutinize the search code line by line... but tunnel vision is a killer.

If you're wondering why I didn't "just ask AI to fix it", at this time I didn't have a claude code subscription or whatever, & was coding everything myself. Even when I tried pasting a function or a file into an LLM, I'd get garbage suggestions back. 

# testing

**about a quarter (~2200 lines) of the whole codebase was comprised of tests.** at some point, it was probably close to half.

these tests covered position representation, move generation, bitboard math, zobrist hashing, the transposition table... 

Especially early on in development (position representation & move-gen), I often tried to go "overboard" with tests, since I knew that mistakes in earlier, fundamental sections of the codebase would compound dramatically later on.

As mentioned earlier, search is quite difficult to test in an informative way, so I could only test search at a very high level (ex: whether the agent can find a mate-in-2 tactic). A lot of the time, the only thing this could signal is "SOMETHING IS WRONG". 

## strength testing

one *easy* part about developing a chess engine is that the goal being worked towards is incredibly objective. 

if you ever wonder *"does this new feature actually help the engine's strength?"* the answer is very simple. 

Can the new version of the engine w/ the feature *beat* the previous version?

If so, you can be almost completely confident it's a good change, even if it comes with tradeoffs (ex: search speed being slower, for a strength increase elsewhere)

I say *almost completely* because in a different game, like rock-paper-scissors, player A beating player B, & player B beating player C doesn't necessarily mean player A beats player C by transitive property. actually quite the opposite in rock-paper-scissors. But chess is a sufficiently complex game, so we can be reasonably certain strength is transitive.

Anyways enough yapping: strength testing is done via a statistical test called SPRT (sequential probability ratio test), where two versions of the engine play many games against each other. At some point, the test stops when one version is found to be "probably stronger than the other, within a certain degree of confidence". 

For me, the test's conclusion usually requires ~thousands of games. For a stronger engine, often hundreds of thousands of games. As chess engine development gets further, often small amounts of strength improvement are being squeezed out, so the difference between two versions of an engine will be very small.

## elo testing

The first thing people want to know about you as a chess player is your ELO. However, ELO is a number that is only meaningful against a pool of other players.

I had no way to upload my engine onto Chess.com and have thousands of people play against it, to estimate its true ELO rating (probably a tos violation). 

However, stockfish has a control that allows users to vary the approximate ELO of the engine, probably by internally limiting the search depth, or just artificially sprinkling in some bad moves.

This ELO is calibrated against CCRL (Computer Chess Rating Lists), a pool of different chess engines who play each other to estimate their relative strengths. So, it's unclear how a CCRL-calibrated rating compares to FIDE rating or Chess.com rating. However, some sources say that CCRL rating is "deflated" -- meaning a 2000 CCRL ELO engine could readily beat a 2000-rated (FIDE or Chess.com) player.

At its peak, my engine reached ~2400 CCRL-calibrated rating. This is approximate and only came out of playing stockfish at different rating settings until games were roughly mostly tied, since I never uploaded my own engine to CCRL.

Future improvements might involve a better NNUE architecture, more aggressive search tree pruning, more self-play training, or even leveraging SIMD to accelerate raw search speed. However, I feel the project has mostly run its course; as it stands it has already been very rewarding.

# ai coding

Until March 2026 I worked on this project solely by hand, with a friend (he handled the UCI protocol, I handled core engine functionality)

At that point, the engine had a working search and NNUE evaluation, but still had some minor problems that were detrimental for strength. I hadn't ran the "elo sweep" against stockfish at that point, but from having various friends play the engine I knew it was *probably* somewhere between 1500-1800 range (which is a big range i know)

During Summer 2026 I finally got a claude subscription to help with some of my co-op work, so I revisited this project, to see how much claude code could improve the engine.

and it very much did! Many chess engine techniques have been known for decades, so claude was probably well-trained on that. 

It was pretty mindblowing to see it improve the engine by a decent margin time after time, especially because, when I took a step back from "coding by hand", I had been struggling with some subtle bugs which were tricky to fix, because my attempted fixes would often result in a performance regression elsewhere.

# Conclusions

- This project was an extreme exercise in debugging
- I did learn a lot:
    + multithreading (mutexes, lock striping, async UCI communication)
    + NN training (pytorch, data labelling, "fine-tuning" with self-play based on game outcome)
    + taking advantage of bitwise operations, a kind of "baby SIMD"
    + the importance of writing tools to make it easier for a coding agent to interact with the "application", which helps it implement, debug, etc

**Final engine specs and features:**

~2400 *estimated* CCRL-calibrated rating (w/ multithreading)

- Hybrid bitboard & mailbox board representation
- Magic bitboard move generation
- Negamax search with alpha-beta pruning
- Iterative deepening
- Quiescence search
- Transposition table (Zobrist hashing)
- Late move reductions
- Null-move pruning
- Futility pruning
- Killer moves & history heuristic move ordering
- multi-threaded search, globally shared transposition table with lock-striped concurrent access
- NNUE Evaluation, (768->256)x2->1 architecture, trained with PyTorch
    - Self-play data generation for iterative fine-tuning