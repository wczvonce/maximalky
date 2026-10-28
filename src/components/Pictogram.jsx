import React from 'react';

// Schematic line pictograms, one per built-in exercise (from CvikIkona.dc.html in the design).
const A = 'var(--color-accent)';
const plate = (x, y, w, h) => <rect x={x} y={y} width={w} height={h} fill={A} stroke="none" />;

const ICONS = {
  bench: <>
    <rect x="16" y="30" width="32" height="4" /><path d="M20 34v10M44 34v10" /><path d="M6 18h52" />
    {plate(8, 10, 5, 16)}{plate(51, 10, 5, 16)}<path d="M24 30V20M40 30V20" />
  </>,
  dbinc: <>
    <path d="M12 42 42 20" /><path d="M14 42v4M40 24v8" /><path d="M44 10h12M44 24h12" />
    {plate(43, 5, 4, 10)}{plate(55, 5, 4, 10)}{plate(43, 19, 4, 10)}{plate(55, 19, 4, 10)}
  </>,
  dipy: <>
    <path d="M14 10v34M50 10v34" /><path d="M14 12h10M40 12h10" stroke={A} />
    <circle cx="32" cy="18" r="4" /><path d="M32 22v12M26 14l6 10M38 14l-6 10M32 34l-5 8M32 34l5 8" />
  </>,
  ohp: <>
    <path d="M8 10h48" />{plate(6, 4, 5, 12)}{plate(53, 4, 5, 12)}
    <circle cx="32" cy="24" r="4" /><path d="M26 26 22 10M38 26l4-16M32 28v10M32 38l-5 8M32 38l5 8" />
  </>,
  zhyby: <>
    <path d="M6 8h52" /><path d="M24 8v8M40 8v8" stroke={A} />
    <circle cx="32" cy="22" r="4" /><path d="M24 16l8 6M40 16l-8 6M32 26v10M32 36l-6 8M32 36l6 8" />
  </>,
  pritahy: <>
    <path d="M12 16 38 24" /><circle cx="8" cy="15" r="4" /><path d="M38 24v18M30 20v12" />
    <path d="M18 32h26" />{plate(16, 26, 4, 12)}{plate(44, 26, 4, 12)}
  </>,
  drep: <>
    <path d="M8 14h48" />{plate(6, 8, 5, 12)}{plate(53, 8, 5, 12)}
    <circle cx="32" cy="22" r="4" /><path d="M32 26v6M32 32l-8 6 2 6M32 32l8 6-2 6" />
  </>,
  legpress: <>
    <path d="M8 44 56 12" /><path d="M34 28l10 14" stroke={A} />{plate(38, 12, 16, 10)}
    <path d="M8 44h20" /><circle cx="14" cy="38" r="4" />
  </>,
  bulhar: <>
    <rect x="40" y="26" width="18" height="4" /><path d="M44 30v12M54 30v12" />
    <circle cx="18" cy="12" r="4" /><path d="M18 16v8M18 24l-4 12M18 24l16 4" /><path d="M14 36h-6" stroke={A} />
  </>,
  vypady: <>
    <circle cx="30" cy="10" r="4" /><path d="M30 14v12M30 26l-12 8-2 8M30 26l12 10 4 6" /><path d="M8 44h48" stroke={A} />
  </>,
  mrtvy: <>
    <path d="M6 44h52" /><path d="M12 32h40" />{plate(8, 22, 6, 20)}{plate(50, 22, 6, 20)}
    <circle cx="32" cy="10" r="4" /><path d="M32 14v10M32 24v8M26 24h12" />
  </>,
  rdl: <>
    <path d="M6 44h52" /><circle cx="16" cy="12" r="4" /><path d="M20 14 34 22M34 22v22" />
    <path d="M18 28h32" />{plate(14, 20, 5, 16)}{plate(48, 20, 5, 16)}
  </>,
  hip: <>
    <rect x="6" y="14" width="18" height="4" /><path d="M10 18v10M20 18v10" /><path d="M24 20 42 26M42 26l6 18" />
    <path d="M30 16h24" />{plate(34, 10, 5, 14)}{plate(48, 10, 5, 14)}<path d="M8 44h48" />
  </>,
  lytka: <>
    <rect x="10" y="34" width="24" height="10" /><path d="M18 34l12-4M28 30V12" /><circle cx="28" cy="8" r="4" />
    <path d="M48 42V14" stroke={A} /><path d="M42 20l6-6 6 6" stroke={A} />
  </>,
  clean: <>
    <path d="M10 42Q22 4 50 14" stroke={A} strokeDasharray="4 4" /><path d="M6 42h20" /><path d="M40 18h20" />
    {plate(38, 12, 5, 14)}{plate(57, 12, 5, 14)}<circle cx="18" cy="30" r="4" />
  </>,
  vyskok: <>
    <path d="M6 44h36" /><circle cx="24" cy="16" r="4" /><path d="M24 20v10M24 30l-6 8M24 30l6 8M18 18l-6-6M30 18l6-6" />
    <path d="M54 44V12" stroke={A} /><path d="M48 18l6-6 6 6" stroke={A} />
  </>,
  generic: <>
    <path d="M10 24h44" />{plate(8, 14, 5, 20)}{plate(51, 14, 5, 20)}<path d="M18 18v12M46 18v12" />
  </>,
};

export function Pictogram({ which }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6 }}>
      <svg viewBox="0 0 64 48" style={{ width: '100%', height: '100%', display: 'block' }} preserveAspectRatio="xMidYMid meet"
        fill="none" stroke="var(--color-text)" strokeWidth="2" aria-hidden="true">
        {ICONS[which] || ICONS.generic}
      </svg>
    </div>
  );
}

// Thumbnail for an exercise: its pictogram, else the first technique photo, else the generic barbell.
export function ExerciseThumb({ ex, images, w, h, fit = 'cover' }) {
  const first = ex.steps && ex.steps[0];
  const src = !ex.icon && first ? (first.img ? images[first.img] : first.src) : null;
  return (
    <span style={{ width: w, height: h, flex: 'none', overflow: 'hidden', display: 'block' }}>
      {src
        ? <img src={src} alt="" className="grayscale" style={{ width: '100%', height: '100%', objectFit: fit }} />
        : <Pictogram which={ex.icon || 'generic'} />}
    </span>
  );
}
