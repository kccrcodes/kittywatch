import { cn } from "@/lib/utils";

/**
 * Hand-drawn style SVG doodles (design.md §10). Line art uses the
 * `line-brown` token; fills come from pastel tokens or props.
 */

export function CatWalkDoodle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 140"
      fill="none"
      aria-hidden="true"
      className={cn("text-cocoa-line", className)}
    >
      <g stroke="currentColor" strokeWidth="5" strokeLinecap="round">
        {/* head */}
        <circle cx="60" cy="60" r="26" fill="none" />
        {/* ears — left one is a filled patch, like the reference */}
        <path d="M40 44 L35 16 L60 34" fill="currentColor" strokeLinejoin="round" />
        <path d="M66 33 L78 12 L86 40" fill="none" strokeLinejoin="round" />
        {/* whiskers */}
        <g strokeWidth="3">
          <path d="M36 60 H22" />
          <path d="M37 67 L24 72" />
          <path d="M84 60 H98" />
          <path d="M83 67 L96 72" />
        </g>
        {/* mouth */}
        <g strokeWidth="3" fill="none">
          <path d="M60 66 q-3 5 -7 2" />
          <path d="M60 66 q3 5 7 2" />
        </g>
        {/* body */}
        <path d="M85 48 C 120 34, 158 36, 178 54" fill="none" />
        <path d="M80 78 C 112 90, 148 90, 170 80" fill="none" />
        <path d="M178 54 C 187 62, 185 73, 172 79" fill="none" />
        {/* legs */}
        <path d="M92 84 L88 114" />
        <path d="M106 87 L106 116" />
        <path d="M152 87 L155 116" />
        <path d="M168 82 L174 110" />
        {/* tail up */}
        <path d="M179 55 C 202 44, 208 24, 194 10" fill="none" />
      </g>
      {/* eyes + nose */}
      <circle cx="51" cy="55" r="3" fill="currentColor" />
      <circle cx="70" cy="55" r="3" fill="currentColor" />
      <path d="M57 62 L63 62 L60 66 Z" fill="currentColor" />
    </svg>
  );
}

export function CatFaceDoodle({
  tint = "var(--pink-200)",
  className,
}: {
  /** Pastel fill for the face; pass any CSS color. */
  tint?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 44"
      aria-hidden="true"
      className={cn("text-cocoa-line", className)}
    >
      <g stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path d="M12 16 L7 4 L21 10 Z" fill={tint} />
        <path d="M36 16 L41 4 L27 10 Z" fill={tint} />
        <ellipse cx="24" cy="26" rx="16" ry="14" fill={tint} />
      </g>
      <circle cx="18" cy="24" r="1.8" fill="currentColor" />
      <circle cx="30" cy="24" r="1.8" fill="currentColor" />
      <path d="M22.5 29 L25.5 29 L24 31 Z" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none">
        <path d="M24 31 q-2 3 -4.5 1.5" />
        <path d="M24 31 q2 3 4.5 1.5" />
        <path d="M8 26 H3" />
        <path d="M8.5 30 L4 32" />
        <path d="M40 26 H45" />
        <path d="M39.5 30 L44 32" />
      </g>
    </svg>
  );
}

export function LeafDoodle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className={cn("text-green-400", className)}
    >
      <path
        d="M5 23 C5 11 13 4 24 4 C24 15 16 23 5 23 Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M8 20 C12 15 17 10 21 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PawDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <g fill="currentColor">
        <ellipse cx="7" cy="7.5" rx="2.4" ry="3" />
        <ellipse cx="17" cy="7.5" rx="2.4" ry="3" />
        <ellipse cx="2.8" cy="12.5" rx="2.1" ry="2.6" />
        <ellipse cx="21.2" cy="12.5" rx="2.1" ry="2.6" />
        <path d="M12 11 c3.6 0 6.4 2.6 6.4 5.6 c0 2.4 -1.8 3.9 -3.5 3.4 c-1.2 -0.35 -1.9 -0.6 -2.9 -0.6 c-1 0 -1.7 0.25 -2.9 0.6 c-1.7 0.5 -3.5 -1 -3.5 -3.4 c0 -3 2.8 -5.6 6.4 -5.6 Z" />
      </g>
    </svg>
  );
}
