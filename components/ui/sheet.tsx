"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "left" | "right" | "top" | "bottom";
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function Sheet({
  open,
  onOpenChange,
  side = "right",
  children,
  className,
  title,
}: SheetProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpenChange]);

  const sidePos: Record<string, string> = {
    right: "inset-y-0 right-0 h-full w-full max-w-md border-l",
    left: "inset-y-0 left-0 h-full w-full max-w-md border-r",
    top: "inset-x-0 top-0 w-full border-b",
    bottom: "inset-x-0 bottom-0 w-full border-t",
  };
  const translate: Record<string, string> = {
    right: open ? "translate-x-0" : "translate-x-full",
    left: open ? "translate-x-0" : "-translate-x-full",
    top: open ? "translate-y-0" : "-translate-y-full",
    bottom: open ? "translate-y-0" : "translate-y-full",
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100]",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!open}
    >
      <div
        className={cn(
          "absolute inset-0 bg-black/50 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "absolute flex flex-col bg-background shadow-2xl transition-transform duration-300 ease-out",
          sidePos[side],
          translate[side],
          className
        )}
      >
        <div className="flex items-center justify-between border-b p-4">
          <span className="text-lg font-bold">{title}</span>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
