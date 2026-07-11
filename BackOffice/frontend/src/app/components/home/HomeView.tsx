"use client";

import React from "react";

export function HomeView() {
  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] items-center justify-center px-4">
      <div className="flex flex-col items-end gap-2 text-right select-none">
        <div className="text-5xl font-bold tracking-wide text-slate-400/30 sm:text-6xl md:text-7xl">
          digicon<span className="text-red-500/30">QMS</span>
        </div>
        <div className="text-xs tracking-wide text-slate-400/40 sm:text-sm">
          by TrackTy
        </div>
      </div>
    </div>
  );
}
