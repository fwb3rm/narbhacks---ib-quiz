"use client";

import { ConvexProvider as ConvexProviderBase } from "convex/react";
import { convex } from "@/lib/convex";

export function ConvexProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProviderBase client={convex}>
      {children}
    </ConvexProviderBase>
  );
} 