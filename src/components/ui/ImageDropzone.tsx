"use client";

import { ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";

export function ImageDropzone({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  function handleFile(file: File | undefined) {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError("Image must be smaller than 3MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div>
      {value ? (
        <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="h-44 w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-2 top-2 rounded-full bg-slate-900/70 p-1.5 text-white transition hover:bg-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600"
        >
          <ImagePlus className="h-6 w-6" />
          <span className="text-sm font-medium">Click or drop a photo (optional)</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
