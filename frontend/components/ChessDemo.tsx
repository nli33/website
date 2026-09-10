"use client";

import { useState, useEffect, useCallback } from "react";
import { Chess } from "chess.js";

const PIECES: Record<string, string> = {
  wK: "♔", wQ: "♕", wR: "♖", wB: "♗", wN: "♘", wP: "♙",
  bK: "♚", bQ: "♛", bR: "♜", bB: "♝", bN: "♞", bP: "♟",
};

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];

export default function ChessDemo() {
  const [game, setGame] = useState(new Chess());
  const [selected, setSelected] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [status, setStatus] = useState("Your turn (White)");
  const [thinking, setThinking] = useState(false);
  const [engineWorker, setEngineWorker] = useState<Worker | null>(null);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [thinkTimeMs, setThinkTimeMs] = useState(1000);

  // Load Silverfish
  useEffect(() => {
    const sf = new Worker("/engine/worker.js");
    sf.postMessage("uci");
    setEngineWorker(sf);
    return () => sf.terminate();
  }, []);

  const updateStatus = useCallback((g: Chess) => {
    if (g.isCheckmate()) setStatus(g.turn() === "w" ? "Checkmate! Engine wins." : "Checkmate! You win!");
    else if (g.isDraw()) setStatus("Draw!");
    else if (g.isCheck()) setStatus(g.turn() === "w" ? "You are in check!" : "Engine is in check!");
    else setStatus(g.turn() === "w" ? "Your turn (White)" : "Engine thinking...");
  }, []);

  const makeEngineMove = useCallback((g: Chess, sf: Worker, movetime: number) => {
    setThinking(true);
    sf.onmessage = (e: MessageEvent) => {
      const line: string = e.data;
      if (line.startsWith("bestmove")) {
        const move = line.split(" ")[1];
        if (move && move !== "(none)") {
          const newGame = new Chess(g.fen());
          const result = newGame.move({ from: move.slice(0, 2), to: move.slice(2, 4), promotion: "q" });
          if (result) {
            setLastMove({ from: result.from, to: result.to });
            setGame(newGame);
            updateStatus(newGame);
          }
        }
        setThinking(false);
      }
    };
    sf.postMessage(`position fen ${g.fen()}`);
    sf.postMessage(`go movetime ${movetime}`);
  }, [updateStatus]);

  const handleSquareClick = useCallback((square: string) => {
    if (thinking || game.turn() !== "w") return;

    if (selected) {
      if (legalMoves.includes(square)) {
        const newGame = new Chess(game.fen());
        const result = newGame.move({ from: selected, to: square, promotion: "q" });
        if (result) {
          setLastMove({ from: result.from, to: result.to });
          setSelected(null);
          setLegalMoves([]);
          setGame(newGame);
          updateStatus(newGame);
          if (!newGame.isGameOver() && engineWorker) {
            setTimeout(() => makeEngineMove(newGame, engineWorker, thinkTimeMs), 100);
          }
          return;
        }
      }
      setSelected(null);
      setLegalMoves([]);
    }

    const moves = game.moves({ square: square as any, verbose: true });
    if (moves.length > 0) {
      setSelected(square);
      setLegalMoves(moves.map((m) => m.to));
    }
  }, [game, selected, legalMoves, thinking, engineWorker, thinkTimeMs, makeEngineMove, updateStatus]);

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setSelected(null);
    setLegalMoves([]);
    setLastMove(null);
    setStatus("Your turn (White)");
    setThinking(false);
  };

  const board = game.board();

  return (
    <div className="mt-4">
      <h2 className="mb-3 text-xl font-semibold">Play vs Silverfish</h2>
      <p className="mb-4 text-sm text-ink/60">You play as White. The engine plays as Black.</p>

      <div className="mb-3 flex items-center justify-between">
        <span className={`text-sm font-medium ${game.isGameOver() ? "text-red-600" : "text-ink/70"}`}>
          {status}
        </span>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-ink/60">
            Engine thinks for
            <select
              value={thinkTimeMs}
              onChange={(e) => setThinkTimeMs(Number(e.target.value))}
              className="rounded border border-line px-2 py-1 text-sm text-ink/80"
            >
              <option value={200}>0.2s</option>
              <option value={500}>0.5s</option>
              <option value={1000}>1s</option>
              <option value={2000}>2s</option>
              <option value={5000}>5s</option>
            </select>
          </label>
          <button
            onClick={resetGame}
            className="rounded border border-line px-3 py-1 text-sm text-ink/60 hover:border-accent-400 hover:text-ink"
          >
            New Game
          </button>
        </div>
      </div>

      <div className="inline-block rounded border border-line overflow-hidden">
        {RANKS.map((rank, ri) => (
          <div key={rank} className="flex">
            {FILES.map((file, fi) => {
              const square = `${file}${rank}`;
              const piece = board[ri][fi];
              const isLight = (ri + fi) % 2 === 0;
              const isSelected = selected === square;
              const isLegal = legalMoves.includes(square);
              const isLastMove = lastMove?.from === square || lastMove?.to === square;

              let bg = isLight ? "bg-amber-100" : "bg-amber-700";
              if (isSelected) bg = "bg-yellow-400";
              else if (isLastMove) bg = isLight ? "bg-yellow-200" : "bg-yellow-500";

              return (
                <div
                  key={square}
                  onClick={() => handleSquareClick(square)}
                  className={`relative flex h-14 w-14 cursor-pointer items-center justify-center text-4xl select-none sm:h-20 sm:w-20 sm:text-6xl ${bg}`}
                >
                  {isLegal && (
                    <div className={`absolute inset-0 flex items-center justify-center`}>
                      <div className={`rounded-full ${piece ? "h-full w-full border-4 border-black/20 opacity-40" : "h-4 w-4 bg-black/20 sm:h-5 sm:w-5"}`} />
                    </div>
                  )}
                  {piece && (
                    <span className={`relative z-10 leading-none ${piece.color === "w" ? "drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]" : ""}`}>
                      {PIECES[`${piece.color}${piece.type.toUpperCase()}`]}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-2 flex gap-6 text-xs text-ink/40">
        {FILES.map((f) => <span key={f} className="w-14 text-center sm:w-20">{f}</span>)}
      </div>
    </div>
  );
}
