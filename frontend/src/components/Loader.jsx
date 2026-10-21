import { useEffect, useState } from "react";

const WORDS = ["ill", "lil", "lli"];

export function PageLoader({ label = "Cargando…" }) {
  const [wordIndex, setWordIndex] = useState(0);
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduceMotion) return undefined;
    const timer = window.setInterval(() => {
      setWordIndex((current) => (current + 1) % WORDS.length);
    }, 950);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  const word = reduceMotion ? "lli" : WORDS[wordIndex];

  return (
    <div className="nb-logo-loader" role="status">
      <span className="nb-logo-loader__stage" aria-hidden="true">
        <span key={word} className="nb-logo-loader__word">
          {word.split("").map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className="nb-logo-loader__letter"
              style={{ animationDelay: `${index * 45}ms` }}
            >
              {letter}
            </span>
          ))}
        </span>
      </span>
      <span className="nb-logo-loader__label">{label}</span>
    </div>
  );
}

export function BootScreen() {
  return (
    <div className="nb-boot">
      <PageLoader label="Cargando Skillign" />
    </div>
  );
}
