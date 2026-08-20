"use client";

import { useEffect, useRef } from "react";
import { X, LucideIcon } from "lucide-react";
import { LucideIconByName } from "./lucide-icon";
import type { LegalSection } from "@/lib/token-data";

export function LegalModal({
  section,
  open,
  onClose,
}: {
  section: LegalSection | null;
  open: boolean;
  onClose: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Reset scroll on open
  useEffect(() => {
    if (open && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [open, section?.id]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !section) return null;

  const Icon = LucideIconByName.bind(null, {
    name: section.icon,
    className: "size-5 text-electric-bright",
  });

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={section.title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-background shadow-2xl">
        {/* Fixed header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-6 py-4">
          <span className="flex size-9 items-center justify-center rounded-lg bg-electric/10 ring-1 ring-electric/20">
            <LucideIconByName
              name={section.icon}
              className="size-4 text-electric-bright"
            />
          </span>
          <h2 className="text-base font-semibold text-foreground">
            {section.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="ml-auto rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          ref={contentRef}
          className="max-h-[70vh] overflow-y-auto overscroll-contain px-6 py-5"
        >
          <div className="space-y-6">
            {section.content.map((block, i) => (
              <div key={i}>
                {block.heading && (
                  <h3 className="text-sm font-semibold text-foreground">
                    {block.heading}
                  </h3>
                )}
                <div className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-muted-foreground">
                  {block.body}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fixed footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-white/[0.06] px-6 py-3">
          <p className="text-[10px] text-muted-foreground/60">
            Servitoken · {section.title}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
