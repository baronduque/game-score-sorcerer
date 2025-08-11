import { useRef } from "react";

export default function Spotlight({ className = "", children }: { className?: string; children?: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty("--spotlight-x", `${x}px`);
    el.style.setProperty("--spotlight-y", `${y}px`);
  };

  return (
    <div ref={ref} onMouseMove={onMove} className={`relative ${className}`}>
      <div className="pointer-events-none absolute inset-0 bg-spotlight" />
      {children}
    </div>
  );
}
