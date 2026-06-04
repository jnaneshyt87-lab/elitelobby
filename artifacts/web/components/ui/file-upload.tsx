"use client";
import { useState, useRef, useCallback } from "react";
import { Upload, X, ImageIcon, CheckCircle2, FileImage } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
}

export function FileUpload({
  onFileSelect,
  accept = "image/*",
  maxSizeMB = 10,
  label = "Upload Payment Screenshot",
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (f: File) => {
      setError(null);
      if (f.size > maxSizeMB * 1024 * 1024) {
        setError(`File must be under ${maxSizeMB}MB`);
        return;
      }
      setFile(f);
      onFileSelect(f);
      if (f.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(f);
      } else {
        setPreview(null);
      }
    },
    [maxSizeMB, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) processFile(dropped);
    },
    [processFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked) processFile(picked);
  };

  const remove = () => {
    setFile(null);
    setPreview(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <label className="font-heading font-semibold text-xs tracking-widest text-slate-300 uppercase block">
        {label}
      </label>

      <AnimatePresence mode="wait">
        {file ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-xl overflow-hidden border border-purple/40 bg-black/30"
          >
            {preview ? (
              <img
                src={preview}
                alt="Payment proof preview"
                className="w-full max-h-64 object-contain"
              />
            ) : (
              <div className="flex items-center justify-center gap-3 p-8">
                <FileImage className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="font-heading font-semibold text-white text-sm">{file.name}</p>
                  <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            )}
            {/* Success overlay */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-green-500/20 border border-green-500/40 rounded-full px-2.5 py-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs text-green-400 font-heading font-semibold">Uploaded</span>
            </div>
            <button
              type="button"
              onClick={remove}
              className="absolute top-3 right-3 w-7 h-7 bg-black/60 border border-white/20 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:border-red-500/40 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200",
              dragging
                ? "border-purple-500 bg-purple/10 scale-[1.01]"
                : "border-purple/25 bg-black/20 hover:border-purple/50 hover:bg-purple/5"
            )}
          >
            <div className={cn("w-14 h-14 rounded-xl border flex items-center justify-center transition-all", dragging ? "border-purple-500 bg-purple/20" : "border-purple/30 bg-black/30")}>
              <Upload className={cn("w-6 h-6 transition-colors", dragging ? "text-purple-400" : "text-slate-500")} />
            </div>
            <div className="text-center">
              <p className="font-heading font-semibold text-white text-sm mb-1">
                {dragging ? "Drop it here!" : "Drop screenshot or click to browse"}
              </p>
              <p className="text-xs text-slate-500 font-heading">PNG, JPG, JPEG up to {maxSizeMB}MB</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              onChange={handleChange}
              className="hidden"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-xs text-red-400 font-heading flex items-center gap-1.5">
          <X className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}
