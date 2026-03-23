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
  const [stockfish, setStockfish] = useState<Worker | null>(null);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  // Load Stockfish
  useEffect(() => {
    const sf = new Worker("https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js");
    sf.postMessage("uci");
    sf.postMessage("setoption name Skill Level value 5");
    setStockfish(sf);
    return () => sf.terminate();
  }, []);

  const updateStatus = useCallback((g: Chess) => {
    if (g.isCheckmate()) setStatus(g.turn() === "w" ? "Checkmate! Engine wins." : "Checkmate! You win!");
    else if (g.isDraw()) setStatus("Draw!");
    else if (g.isCheck()) setStatus(g.turn() === "w" ? "You are in check!" : "Engine is in check!");
    else setStatus(g.turn() === "w" ? "Your turn (White)" : "Engine thinking...");
  }, []);

  const makeEngineMove = useCallback((g: Chess, sf: Worker) => {
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
    sf.postMessage("go movetime 500");
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
          if (!newGame.isGameOver() && stockfish) {
            setTimeout(() => makeEngineMove(newGame, stockfish), 100);
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
  }, [game, selected, legalMoves, thinking, stockfish, makeEngineMove, updateStatus]);

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
      <p className="mb-4 text-sm text-gray-500">You play as White. The engine plays as Black.</p>

      <div className="mb-3 flex items-center justify-between">
        <span className={`text-sm font-medium ${game.isGameOver() ? "text-red-600" : "text-gray-700"}`}>
          {status}
        </span>
        <button
          onClick={resetGame}
          className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:border-gray-500 hover:text-gray-900"
        >
          New Game
        </button>
      </div>

      <div className="inline-block rounded border border-gray-300 overflow-hidden">
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
                  className={`relative flex h-10 w-10 cursor-pointer items-center justify-center text-2xl select-none sm:h-14 sm:w-14 ${bg}`}
                >
                  {isLegal && (
                    <div className={`absolute inset-0 flex items-center justify-center`}>
                      <div className={`rounded-full ${piece ? "h-full w-full border-4 border-black/20 opacity-40" : "h-3 w-3 bg-black/20 sm:h-4 sm:w-4"}`} />
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

      <div className="mt-2 flex gap-6 text-xs text-gray-400">
        {FILES.map((f) => <span key={f} className="w-10 text-center sm:w-14">{f}</span>)}
      </div>
    </div>
  );
}
