"use client";

import { useState } from "react";
import { CountryLite } from "@/lib/types";
import { GameContinent, pickCountries, shuffle } from "@/lib/data";
import { MemorySetup } from "@/components/memory/MemorySetup";
import { MemoryGame } from "@/components/memory/MemoryGame";
import { BoardCard } from "@/components/memory/MemoryCard";
import { Difficulty, DIFFICULTIES, DifficultyConfig } from "@/components/memory/config";

interface GameState {
  key: number;
  config: DifficultyConfig;
  cards: BoardCard[];
}

// Build a shuffled deck: each country appears twice. Called from a user action
// (never during render), so the impure shuffle is hydration-safe.
function buildDeck(countries: CountryLite[]): BoardCard[] {
  const cards: BoardCard[] = countries.flatMap((country, i) => [
    { id: i * 2, code: country.code, country, matched: false, matchedBy: null },
    { id: i * 2 + 1, code: country.code, country, matched: false, matchedBy: null },
  ]);
  return shuffle(cards);
}

export default function MemoryPage() {
  const [game, setGame] = useState<GameState | null>(null);

  function start(difficulty: Difficulty, continent: GameContinent) {
    const config = DIFFICULTIES[difficulty];
    const pool = pickCountries(config.pairs, continent);
    setGame({ key: Date.now(), config, cards: buildDeck(pool) });
  }

  if (game) {
    return (
      <div className="flex flex-col gap-5">
        <h1 className="text-[28px] font-bold text-foreground">Меморина</h1>
        <MemoryGame
          key={game.key}
          initialCards={game.cards}
          config={game.config}
          onReplay={() => setGame(null)}
        />
      </div>
    );
  }

  return <MemorySetup onStart={start} />;
}
