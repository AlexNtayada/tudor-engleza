import { useState } from "react";
import { UNITS } from "../content";
import { Dino, type Mood } from "../components/Dino";
import {
  buy,
  ITEMS,
  levelFor,
  levelProgress,
  STARS_PER_LEVEL,
  toggleWear,
  type Item,
} from "../gamify";
import { learnedWordIds, type Progress } from "../progress";
import { instruction, speak } from "../speech";
import { sfx } from "../sfx";

/** Playground: free practice over everything learned, or one world at a time. */
export function Playground({
  progress,
  onPlay,
}: {
  progress: Progress;
  onPlay: (unitId?: string) => void;
}) {
  const learned = learnedWordIds(progress);
  const units = UNITS.filter((u) => u.words.some((w) => learned.has(w.id)));
  return (
    <div className="page page-white">
      <h2 className="page-title">Locul de joacă</h2>
      {units.length === 0 ? (
        <div className="empty">
          <Dino mood="talk" size={150} />
          <p>Termină prima lecție de pe hartă și aici se deschid jocurile!</p>
        </div>
      ) : (
        <>
          <div className="play-hello">
            <Dino mood="talk" size={110} />
            <span className="bubble">Alege un joc!</span>
          </div>
          <div className="play-grid">
            <button
              className="play-card play-card-big"
              onClick={() => onPlay()}
            >
              <span className="play-emoji">🎲</span>
              <span>Amestecă tot</span>
            </button>
            {units.map((u) => (
              <button
                key={u.id}
                className="play-card"
                style={{ background: u.color }}
                onClick={() => onPlay(u.id)}
              >
                <span className="play-emoji">{u.world.icon}</span>
                <span>{u.title}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function lastDays(n: number): { key: string; label: string }[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { key, label: d.toLocaleDateString("ro-RO", { weekday: "narrow" }) };
  });
}

/** Dino's room: level, wardrobe bought with stars, and sunny days. */
export function DinoRoom({
  progress,
  onChange,
}: {
  progress: Progress;
  onChange: (p: Progress) => void;
}) {
  const [mood, setMood] = useState<Mood>("idle");
  const level = levelFor(progress.earned);
  const toNext = STARS_PER_LEVEL - (progress.earned % STARS_PER_LEVEL);
  const mode = progress.settings.instructions;

  const celebrate = () => {
    setMood("dance");
    setTimeout(() => setMood("idle"), 1800);
  };

  const tapItem = (item: Item) => {
    if (progress.owned.includes(item.id)) {
      sfx.tap();
      onChange(toggleWear(progress, item));
      celebrate();
      return;
    }
    if (progress.wallet >= item.price) {
      sfx.fanfare();
      onChange(buy(progress, item));
      celebrate();
      void speak([{ text: "Wow! Thank you!", lang: "en" }]);
      return;
    }
    sfx.wrong();
    setMood("oops");
    setTimeout(() => setMood("idle"), 1200);
    void speak(
      instruction(
        mode,
        `Mai adună ${item.price - progress.wallet} stele!`,
        "Collect more stars!",
      ),
    );
  };

  return (
    <div className="page page-white">
      <div className="room-hero room-stage">
        <Dino mood={mood} size={220} />
        <div className="room-level">
          <span className="level-badge">Nivelul {level}</span>
          <div className="level-bar">
            <div
              className="level-fill"
              style={{ width: `${levelProgress(progress.earned) * 100}%` }}
            />
          </div>
          <span className="level-hint">
            încă {toNext} ⭐ până la nivelul {level + 1}
          </span>
        </div>
      </div>

      <section className="panel panel-kid">
        <h3>Garderoba lui Dino</h3>
        <div className="wardrobe">
          {ITEMS.map((item) => {
            const owned = progress.owned.includes(item.id);
            const wearing = progress.outfit[item.slot] === item.id;
            const affordable = progress.wallet >= item.price;
            return (
              <button
                key={item.id}
                className={`ward-item ${owned ? "owned" : ""} ${wearing ? "wearing" : ""} ${!owned && !affordable ? "locked" : ""}`}
                onClick={() => tapItem(item)}
                aria-label={item.name}
              >
                <Dino size={92} outfit={{ [item.slot]: item.id }} />
                <span className="ward-tag">
                  {owned ? (wearing ? "✓" : "👕") : `⭐ ${item.price}`}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel panel-kid">
        <h3>Zilele mele cu soare</h3>
        <div className="suns">
          {lastDays(14).map((d) => (
            <div key={d.key} className="sun-day">
              <span
                className={
                  progress.daysPlayed.includes(d.key) ? "sun on" : "sun"
                }
              >
                {progress.daysPlayed.includes(d.key) ? "☀️" : "☁️"}
              </span>
              <span className="sun-label">{d.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
