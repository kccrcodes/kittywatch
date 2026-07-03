import Link from "next/link";
import { ArrowRight, SwatchBook } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CatWalkDoodle,
  LeafDoodle,
  PawDoodle,
} from "@/components/catwatch/doodles";

export default function Home() {
  return (
    <div className="relative isolate flex flex-1 flex-col items-center justify-center overflow-hidden bg-cream px-6 py-16 text-center">
      <div className="absolute -top-24 -left-24 size-72 rounded-full bg-pink-200/70 blur-2xl" />
      <div className="absolute -right-28 -bottom-28 size-80 rounded-full bg-pink-200/70 blur-2xl" />
      <LeafDoodle className="absolute left-[14%] top-[22%] size-7 -rotate-12 opacity-70" />
      <LeafDoodle className="absolute right-[16%] bottom-[26%] size-6 rotate-45 opacity-70" />
      <PawDoodle className="absolute right-[20%] top-[18%] size-5 rotate-12 text-pink-300/80" />
      <PawDoodle className="absolute left-[22%] bottom-[20%] size-5 -rotate-12 text-pink-300/80" />

      <CatWalkDoodle className="h-28 w-48" />
      <h1 className="mt-4 font-display text-5xl font-semibold text-cocoa">
        CatWatch
      </h1>
      <p className="mt-3 max-w-md text-balance text-cocoa-body">
        Every stray cat gets a digital heartbeat. If it flatlines, the
        neighbourhood knows.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          asChild
          size="lg"
          className="rounded-full bg-pink-500 px-6 font-bold text-white hover:bg-pink-600"
        >
          <Link href="/dashboard">
            Open the dashboard
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="secondary"
          className="rounded-full border border-border-soft px-6 font-bold"
        >
          <Link href="/ui-lab">
            <SwatchBook className="size-4" aria-hidden="true" />
            UI Lab
          </Link>
        </Button>
      </div>
    </div>
  );
}
