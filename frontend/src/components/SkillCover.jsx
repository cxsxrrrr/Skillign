function GridMotif({ c }) {
  return (
    <>
      <g stroke={c.ink} strokeWidth="1" opacity="0.22">
        {Array.from({ length: 7 }, (_, index) => {
          const x = 18 + (index + 1) * 23;
          return <line key={`v-${index}`} x1={x} y1="60" x2={x} y2="180" />;
        })}
        {Array.from({ length: 5 }, (_, index) => {
          const y = 60 + (index + 1) * 24;
          return <line key={`h-${index}`} x1="18" y1={y} x2="182" y2={y} />;
        })}
      </g>
      <circle cx="132" cy="108" r="38" fill={c.accent} />
      <text
        x="132"
        y="116"
        textAnchor="middle"
        fontFamily="'Space Mono', monospace"
        fontSize="18"
        fontWeight="700"
        fill="#141414"
      >
        {c.number}
      </text>
      <rect x="42" y="120" width="40" height="40" fill={c.ink} />
      <rect x="82" y="140" width="14" height="14" fill={c.accent} />
    </>
  );
}

function RingsMotif({ c }) {
  return (
    <>
      <circle cx="100" cy="116" r="70" fill="none" stroke={c.ink} strokeWidth="1.4" opacity="0.35" />
      <circle cx="100" cy="116" r="50" fill={c.accent} />
      <circle cx="100" cy="116" r="24" fill={c.ink} />
      <circle cx="100" cy="116" r="8" fill={c.accent} />
      <line x1="18" y1="116" x2="182" y2="116" stroke={c.ink} strokeWidth="1" opacity="0.3" />
      <rect x="152" y="58" width="14" height="14" fill={c.ink} />
      <rect x="30" y="162" width="22" height="8" fill={c.accent} />
    </>
  );
}

function StripesMotif({ c }) {
  return (
    <>
      <rect x="18" y="66" width="128" height="17" fill={c.accent} />
      <rect x="42" y="89" width="140" height="11" fill={c.ink} />
      <rect x="18" y="108" width="72" height="22" fill={c.ink} />
      <rect x="18" y="138" width="150" height="9" fill={c.accent} />
      <rect x="18" y="154" width="96" height="9" fill={c.ink} />
      <circle cx="152" cy="158" r="20" fill={c.accent} stroke={c.ink} strokeWidth="1.5" />
    </>
  );
}

function BlocksMotif({ c }) {
  return (
    <>
      <rect x="26" y="62" width="76" height="88" fill={c.accent} />
      <rect x="74" y="104" width="100" height="70" fill="none" stroke={c.ink} strokeWidth="1.8" />
      <rect x="126" y="58" width="36" height="36" fill={c.ink} />
      <line x1="26" y1="180" x2="174" y2="180" stroke={c.ink} strokeWidth="1" opacity="0.3" />
      <rect x="42" y="78" width="14" height="14" fill="#141414" />
      <rect x="66" y="78" width="14" height="14" fill={c.ink} />
      <rect x="42" y="102" width="44" height="6" fill={c.ink} />
    </>
  );
}

function ArchMotif({ c }) {
  return (
    <>
      <path d="M36 178 A64 64 0 0 1 164 178 Z" fill={c.accent} />
      <path d="M64 178 A36 36 0 0 1 136 178 Z" fill={c.ink} />
      <line x1="24" y1="178" x2="176" y2="178" stroke={c.ink} strokeWidth="1.6" />
      <circle cx="100" cy="70" r="9" fill={c.ink} />
      <line x1="100" y1="50" x2="100" y2="61" stroke={c.ink} strokeWidth="1.5" />
      <rect x="160" y="56" width="12" height="12" fill={c.accent} />
    </>
  );
}

function GlyphMotif({ c, initial }) {
  return (
    <>
      <circle cx="100" cy="116" r="62" fill="none" stroke={c.ink} strokeWidth="1.4" opacity="0.3" />
      <text
        x="100"
        y="148"
        textAnchor="middle"
        fontFamily="'Montserrat', sans-serif"
        fontSize="108"
        fontWeight="800"
        fill={c.accent}
        stroke={c.ink}
        strokeWidth="1.2"
      >
        {initial}
      </text>
      <line x1="38" y1="172" x2="162" y2="172" stroke={c.ink} strokeWidth="1" />
      <circle cx="164" cy="64" r="7" fill={c.ink} />
    </>
  );
}

export default function SkillCover({ skill, className = "nb-card__cover" }) {
  const cover = skill.cover;
  const initial = skill.name.charAt(0).toUpperCase();

  return (
    <svg
      className={className}
      viewBox="0 0 200 300"
      role="img"
      aria-label={`Portada de ${skill.name}`}
    >
      <rect width="200" height="300" fill={cover.bg} />
      <rect
        x="8"
        y="8"
        width="184"
        height="284"
        fill="none"
        stroke={cover.ink}
        strokeWidth="1.5"
      />

      <text
        x="18"
        y="29"
        fontFamily="'Space Mono', monospace"
        fontSize="7.5"
        letterSpacing="1.2"
        fill={cover.ink}
        opacity="0.7"
      >
        SKILL {cover.number}
      </text>
      <text
        x="18"
        y="42"
        fontFamily="'Space Mono', monospace"
        fontSize="6.4"
        letterSpacing="0.8"
        fill={cover.ink}
        opacity="0.55"
      >
        {cover.category}
      </text>

      {cover.motif === "grid" && <GridMotif c={cover} />}
      {cover.motif === "rings" && <RingsMotif c={cover} />}
      {cover.motif === "stripes" && <StripesMotif c={cover} />}
      {cover.motif === "blocks" && <BlocksMotif c={cover} />}
      {cover.motif === "arch" && <ArchMotif c={cover} />}
      {cover.motif === "glyph" && <GlyphMotif c={cover} initial={initial} />}

      <line x1="18" y1="194" x2="182" y2="194" stroke={cover.ink} strokeWidth="1.2" />
      <g
        fontFamily="'Montserrat', 'Inter', sans-serif"
        fontWeight="800"
        fill={cover.ink}
        letterSpacing="-0.4"
      >
        {cover.lines.map((line, index) => (
          <text
            key={`${line}-${index}`}
            x="18"
            y={cover.start_y + index * cover.line_height}
            fontSize={cover.font_size}
          >
            {line}
          </text>
        ))}
      </g>
      <rect x="18" y="258" width="38" height="5" fill={cover.accent} />
      <text
        x="18"
        y="282"
        fontFamily="'Space Mono', monospace"
        fontSize="6.4"
        letterSpacing="1"
        fill={cover.ink}
        opacity="0.62"
      >
        SKILLIGN / CATALOG
      </text>
      <rect x="176" y="274" width="8" height="8" fill={cover.accent} />
    </svg>
  );
}
