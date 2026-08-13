"use client";

import { Star } from "lucide-react";
import { useState } from "react";

export function StarDisplay({ value, count }: { value: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-amber-500">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className="h-3.5 w-3.5"
          fill={n <= Math.round(value) ? "currentColor" : "none"}
          strokeWidth={1.5}
        />
      ))}
      {typeof count === "number" && (
        <span className="ml-1 text-xs font-medium text-slate-500">
          {value ? value.toFixed(1) : "New"} {count > 0 ? `(${count})` : ""}
        </span>
      )}
    </span>
  );
}

export function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-125"
        >
          <Star
            className="h-7 w-7 text-amber-500"
            fill={n <= (hover || value) ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}
