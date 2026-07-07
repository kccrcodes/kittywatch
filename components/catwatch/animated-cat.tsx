import { cn } from "@/lib/utils";

/**
 * The hand-drawn loading cat, assembled from the Figma-exported SVG parts in
 * `public/cat-parts/` (copies of `references/cat-*.svg` — never redrawn).
 *
 * The parts recompose the original 249×152 `cat-full.svg` canvas exactly:
 *   cat-head.svg (115×105) at (0, 10.95)     — head, ears, face
 *   cat-leg.svg  (174×94)  at (47.52, 58.28) — body outline + legs (one file)
 *   cat-tail.svg (43×83)   at (206.70, 0)    — tail, base at ≈(10, 80) local
 *
 * Offsets below are those numbers as percentages of the 249×152 canvas.
 * Animation is pure CSS: the wrapper floats, the head bobs with a small phase
 * delay, the tail wags from its base, and an oval shadow breathes opposite
 * the float. Legs stay static — the body outline lives in the leg file, so
 * bouncing them would wobble the whole torso. All loops carry `cw-motion`
 * and stop under prefers-reduced-motion, leaving a static cat.
 */
export function AnimatedCat({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none relative select-none", className)}
      style={{ aspectRatio: "249 / 152" }}
    >
      {/* floating group: everything above the shadow moves together */}
      <div className="cw-motion cw-cat-float relative h-full w-full">
        {/* eslint-disable @next/next/no-img-element -- tiny local SVGs, no optimizer needed */}
        <img
          src="/cat-parts/cat-head.svg"
          alt=""
          className="cw-motion cw-head-bob absolute"
          style={{ left: "0%", top: "7.2%", width: "46.18%" }}
        />
        <img
          src="/cat-parts/cat-leg.svg"
          alt=""
          className="absolute"
          style={{ left: "19.08%", top: "38.34%", width: "69.88%" }}
        />
        <img
          src="/cat-parts/cat-tail.svg"
          alt=""
          className="cw-motion cw-tail-wag absolute"
          style={{
            left: "83.01%",
            top: "0%",
            width: "17.27%",
            transformOrigin: "24% 94%",
          }}
        />
        {/* eslint-enable @next/next/no-img-element */}
      </div>

      {/* soft ground shadow, breathing opposite the float */}
      <div
        className="cw-motion cw-cat-shadow absolute -bottom-2 left-[22%] h-2.5 w-[52%] rounded-full bg-cocoa-line/15 blur-[2px]"
      />
    </div>
  );
}
