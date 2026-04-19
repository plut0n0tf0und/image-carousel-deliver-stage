"use client";

import { useEffect, useCallback, useState, useRef } from "react";
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
  const [zoomed, setZoomed] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (zoomed) { setZoomed(false); setPan({ x: 0, y: 0 }); }
        else onClose();
      }
      if (e.key === "ArrowLeft" && hasPrev && !zoomed) onPrev();
      if (e.key === "ArrowRight" && hasNext && !zoomed) onNext();
    },
    [onClose, onPrev, onNext, hasPrev, hasNext, zoomed]
  );

  // Reset zoom + pan when image changes
  useEffect(() => {
    setZoomed(false);
    setPan({ x: 0, y: 0 });
  }, [image]);

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

  // Pan handlers — only active when zoomed
  const onPanMouseDown = (e: React.MouseEvent) => {
    if (!zoomed) return;
    e.preventDefault();
    e.stopPropagation();
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY };
    panOrigin.current = { ...pan };
  };

  const onPanMouseMove = (e: React.MouseEvent) => {
    if (!isPanning.current || !zoomed) return;
    e.preventDefault();
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    setPan({ x: panOrigin.current.x + dx, y: panOrigin.current.y + dy });
  };

  const onPanMouseUp = (e: React.MouseEvent) => {
    isPanning.current = false;
  };

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
          onClick={() => zoomed ? (setZoomed(false), setPan({ x: 0, y: 0 })) : onClose()}
          onMouseMove={onPanMouseMove}
          onMouseUp={onPanMouseUp}
          onMouseLeave={onPanMouseUp}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" />

          {/* Close button */}
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-6 right-6 z-50 p-3 rounded-full glass hover:bg-white/10 transition-smooth group"
          >
            <X className="w-6 h-6 text-white/80 group-hover:text-white" />
          </button>

          {/* Navigation - Previous */}
          {hasPrev && !zoomed && (
            <button
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm shadow-lg shadow-black/50 transition-all"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>
          )}

          {/* Navigation - Next */}
          {hasNext && !zoomed && (
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
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
            <motion.img
              src={image.url}
              alt={image.caption}
              animate={{
                scale: zoomed ? 2 : 1,
                x: zoomed ? pan.x : 0,
                y: zoomed ? pan.y : 0,
              }}
              transition={
                isPanning.current
                  ? { duration: 0 }
                  : { type: "spring", damping: 20, stiffness: 200 }
              }
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (zoomed) setPan({ x: 0, y: 0 });
                setZoomed((z) => !z);
              }}
              onMouseDown={onPanMouseDown}
              className={cn(
                "max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl select-none",
                zoomed
                  ? isPanning.current ? "cursor-grabbing" : "cursor-grab"
                  : "cursor-zoom-in"
              )}
              draggable={false}
            />

            {/* Caption */}
            <motion.div
              animate={{ opacity: zoomed ? 0 : 1 }}
              transition={{ duration: 0.2 }}
              className="mt-6 text-center pointer-events-none"
            >
              <h3 className="text-xl font-semibold text-white mb-2">
                {image.caption}
              </h3>
              <p className="text-white/60 text-sm max-w-md">
                {image.description}
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
