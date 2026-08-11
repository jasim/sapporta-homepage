import type { ReactNode } from "react";

export function GridMessage({ children }: { children: ReactNode }) {
  return (
    <div className="homepage-grid-message flex h-64 items-center justify-center gap-3 border border-sap-border bg-sap-surface p-4 text-[0.92rem] text-sap-soft max-[760px]:min-h-56 max-[760px]:flex-col max-[760px]:items-start">
      {children}
    </div>
  );
}
