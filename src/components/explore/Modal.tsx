"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface Props {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}

export default function Modal({ title, subtitle, onClose, children, footer, wide = false }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Rendered into <body> so cards' hover effects can't affect its position.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[85vh] w-full ${wide ? "max-w-2xl" : "max-w-lg"} flex-col rounded-md border border-[var(--os-border)] bg-[var(--os-panel)] text-[var(--os-text)] shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--os-border)] px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            {subtitle && <p className="text-xs text-[var(--os-muted)]">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded px-1.5 text-lg leading-none text-[var(--os-muted)] hover:bg-[var(--os-border)] hover:text-[var(--os-text)]"
          >
            ×
          </button>
        </div>
        <div className="space-y-5 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-[var(--os-border)] px-5 py-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
