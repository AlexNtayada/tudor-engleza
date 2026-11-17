import { mascot } from '../mascots';
import { useEffect, useState } from "react";
import { UNITS } from "../content";
import { Mascot, type Mood } from '../components/Mascot';
import {
  buy,
  ITEMS,
  levelFor,
  levelProgress,
  STARS_PER_LEVEL,
  toggleWear,
  type Item, SLOTS, type Slot } from "../gamify";
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
  const mode = progress.settings.instructions;
  useEffect(() => {
    const t = setTimeout(
      () =>
        void speak(
          units.length === 0
            ? instruction(mode, "Termină prima lecție de pe hartă și aici se deschid jocurile!", "Finish the first lesson on the map to open the games!")
            : instruction(mode, "Alege un joc!", "Pick a game!"),
        ),
      300,
    );
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="page page-white">
      <h2 className="page-title">Locul de joacă</h2>
      {units.length === 0 ? (
        <div className="empty">
          <Mascot mood="talk" size={150} />
          <p>Termină prima lecție de pe hartă și aici se deschid jocurile!</p>
        </div>
      ) : (
        <>
          <div className="play-hello">
            <Mascot mood="talk" size={110} />
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

const WEEKDAYS = ["L", "Ma", "Mi", "J", "V", "S", "D"];

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Last week and this week, each starting on Monday. */
function twoWeeks(): { key: string; future: boolean; today: boolean }[] {
  const now = new Date();
  const todayKey = dayKey(now);
  const start = new Date(now);
  start.setDate(now.getDate() - ((now.getDay() + 6) % 7) - 7);
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = dayKey(d);
    return { key, future: key > todayKey, today: key === todayKey };
  });
}

/** The friend's room: level, wardrobe bought with stars, and sunny days. */
export function NinjaRoom({
  progress,
  onChange,
  onPickFriend,
}: {
  progress: Progress;
  onChange: (p: Progress) => void;
  onPickFriend: () => void;
}) {
  const [mood, setMood] = useState<Mood>("idle");
  const [slot, setSlot] = useState<Slot | "all">("all");
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
    if (item.setOf) {
      const unit = UNITS.find((u) => u.id === item.setOf);
      sfx.wrong();
      setMood("oops");
      setTimeout(() => setMood("idle"), 1200);
      void speak(
        instruction(
          mode,
          `Acesta e un cadou! Strânge toate abțibildurile de la ${unit?.title ?? ""}.`,
          "This one is a present! Collect all the stickers.",
        ),
      );
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
        <Mascot mood={mood} size={220} />
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
          <button className="friend-swap" onClick={onPickFriend}>
            🔄 Schimbă prietenul
          </button>
        </div>
      </div>

      <section className="panel panel-kid">
        <h3>Garderoba lui {mascot().name}</h3>
        <div className="ward-tabs" role="tablist">
          {[{ id: "all" as const, label: "Toate" }, ...SLOTS].map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={slot === t.id}
              className={`ward-tab ${slot === t.id ? "on" : ""}`}
              onClick={() => {
                sfx.tap();
                setSlot(t.id);
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="wardrobe">
          {ITEMS.filter((item) => slot === "all" || item.slot === slot).map((item) => {
            const owned = progress.owned.includes(item.id);
            const wearing = progress.outfit[item.slot] === item.id;
            const affordable = !item.setOf && progress.wallet >= item.price;
            const unit = item.setOf ? UNITS.find((u) => u.id === item.setOf) : undefined;
            return (
              <button
                key={item.id}
                className={`ward-item ${owned ? "owned" : ""} ${wearing ? "wearing" : ""} ${!owned && !affordable ? "locked" : ""} ${item.setOf ? "ward-gift" : ""}`}
                onClick={() => tapItem(item)}
                aria-label={item.name}
                title={item.name}
              >
                <Mascot size={92} outfit={{ [item.slot]: item.id }} />
                <span className="ward-tag">
                  {owned
                    ? wearing
                      ? "✓"
                      : "👕"
                    : unit
                      ? `🎁 ${unit.world.icon}`
                      : `⭐ ${item.price}`}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel panel-kid">
        <h3>Zilele mele cu soare</h3>
        <div className="suns">
          {WEEKDAYS.map((w) => (
            <span key={w} className="sun-head">
              {w}
            </span>
          ))}
          {twoWeeks().map((d) => {
            const played = progress.daysPlayed.includes(d.key);
            return (
              <div
                key={d.key}
                className={`sun-day ${d.future ? "future" : ""} ${d.today ? "today" : ""}`}
                title={d.key}
              >
                <span className={played ? "sun on" : "sun"}>{played ? "☀️" : d.future ? "·" : "☁️"}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
