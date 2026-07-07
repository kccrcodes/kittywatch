/**
 * Source art for `public/maps/campus-map-illustrated.png` — the schematic
 * campus illustration (design.md §6): parks lightly green, roads warm
 * beige, water pale blue. The Leaflet map renders the PNG as a CRS.Simple
 * ImageOverlay; its coordinate system is this SVG's 800×600 viewBox.
 *
 * To change the base map: edit this SVG, re-render it at 800×600 (2x) in
 * the app (so tokens/fonts resolve), and replace the PNG.
 */
export function IllustratedMapArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={className}
    >
      <rect width="800" height="600" fill="#f3eae0" />

      {/* water */}
      <path
        d="M690 40 C 780 60, 800 160, 770 240 C 745 300, 690 290, 660 230 C 630 170, 620 70, 690 40 Z"
        fill="var(--blue-soft)"
        opacity="0.5"
      />
      <ellipse cx="90" cy="470" rx="80" ry="55" fill="var(--blue-soft)" opacity="0.45" />

      {/* parks */}
      <path
        d="M40 380 C 120 320, 260 340, 300 420 C 330 490, 240 560, 140 550 C 60 540, 0 440, 40 380 Z"
        fill="var(--green-200)"
        opacity="0.9"
      />
      <path
        d="M470 60 C 560 30, 640 70, 630 150 C 620 220, 520 240, 460 190 C 410 145, 410 85, 470 60 Z"
        fill="var(--green-200)"
        opacity="0.8"
      />
      <ellipse cx="380" cy="330" rx="90" ry="60" fill="var(--green-100)" />
      <ellipse cx="620" cy="430" rx="100" ry="70" fill="var(--green-100)" />

      {/* roads */}
      <g fill="none" stroke="#e9d7c2" strokeLinecap="round">
        <path d="M-20 260 C 150 230, 300 260, 420 230 C 540 200, 660 220, 820 180" strokeWidth="16" />
        <path d="M200 620 C 230 480, 300 380, 380 300 C 450 230, 520 180, 560 40" strokeWidth="14" />
        <path d="M-20 430 C 120 420, 260 440, 360 480 C 460 520, 600 500, 820 540" strokeWidth="12" />
        <path d="M520 620 C 560 520, 640 470, 780 450" strokeWidth="10" />
        <path d="M80 40 C 130 120, 160 200, 150 300" strokeWidth="10" />
      </g>

      {/* buildings */}
      <g fill="#f0e2d1" stroke="#e4d0ba" strokeWidth="2">
        <rect x="300" y="120" width="70" height="44" rx="10" transform="rotate(-8 335 142)" />
        <rect x="420" y="330" width="80" height="50" rx="10" transform="rotate(5 460 355)" />
        <rect x="250" y="250" width="56" height="40" rx="10" />
        <rect x="540" y="300" width="64" height="42" rx="10" transform="rotate(-6 572 321)" />
        <rect x="180" y="150" width="52" height="38" rx="10" transform="rotate(6 206 169)" />
        <rect x="620" y="330" width="52" height="36" rx="10" />
      </g>

      {/* sports track */}
      <ellipse
        cx="680"
        cy="120"
        rx="52"
        ry="30"
        fill="none"
        stroke="var(--pink-300)"
        strokeWidth="8"
        opacity="0.8"
      />

      {/* trees */}
      <g fill="var(--green-300)" opacity="0.85">
        <circle cx="120" cy="420" r="9" />
        <circle cx="180" cy="480" r="7" />
        <circle cx="250" cy="440" r="8" />
        <circle cx="520" cy="110" r="8" />
        <circle cx="560" cy="160" r="6" />
        <circle cx="360" cy="300" r="7" />
        <circle cx="640" cy="460" r="8" />
        <circle cx="590" cy="410" r="6" />
        <circle cx="90" cy="350" r="7" />
      </g>

      {/* paw trail */}
      <path
        d="M180 520 C 260 470, 300 420, 370 400 C 440 380, 480 330, 500 280"
        fill="none"
        stroke="var(--pink-300)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="1 16"
      />

      {/* labels */}
      <g
        fill="#a08b7c"
        fontSize="14"
        fontWeight="600"
        fontFamily="var(--font-nunito), sans-serif"
      >
        <text x="110" y="395">Kent Ridge Park</text>
        <text x="480" y="140">University Town</text>
        <text x="330" y="270">Central Library</text>
        <text x="190" y="230">Faculty of Science</text>
        <text x="560" y="470">Prince George&apos;s Park</text>
        <text x="655" y="270">Kent Vale</text>
      </g>
    </svg>
  );
}
