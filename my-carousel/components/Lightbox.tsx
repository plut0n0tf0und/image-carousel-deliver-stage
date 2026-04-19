"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { ImageItem } from "@/lib/images";
import { cn } from "@/lib/utils";

interface LightboxProps {
  image: ImageItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export function Lightbox({
  image,
  isOpen,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: LightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext) onNext();
    },
    [onClose, onPrev, onNext, hasPrev, hasNext]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleKeyDown]);

  if (!image) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-50 p-3 rounded-full glass hover:bg-white/10 transition-smooth group"
          >
            <X className="w-6 h-6 text-white/80 group-hover:text-white" />
          </button>

          {/* Navigation - Previous */}
          {hasPrev && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm shadow-lg shadow-black/50 transition-all"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>
          )}

          {/* Navigation - Next */}
          {hasNext && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm shadow-lg shadow-black/50 transition-all"
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>
          )}

          {/* Image Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 max-w-[90vw] max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={image.url}
              alt={image.caption}
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
            />

            {/* Caption */}
            <div className="mt-6 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">
                {image.caption}
              </h3>
              <p className="text-white/60 text-sm max-w-md">
                {image.description}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
