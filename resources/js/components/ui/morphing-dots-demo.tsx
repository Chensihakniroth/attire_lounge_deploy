"use client";

import { useState } from "react";
import MorphingPageDots from "@/components/ui/morphing-page-dots";

export default function DemoPagination() {
  const [page, setPage] = useState(0);
  return (
    <div className="flex flex-col items-center gap-4 mt-20">
      <MorphingPageDots total={5} activeIndex={page} onChange={setPage} />
    </div>
  );
}
