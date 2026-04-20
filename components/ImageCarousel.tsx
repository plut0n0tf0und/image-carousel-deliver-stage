"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { images } from "@/lib/images";
import { Lightbox } from "./Lightbox";
import { cn } from "@/lib/utils";

// Lerp for silky deceleration
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function ImageCarousel() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // DOM refs
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // All drag/animation state in refs — zero re-renders during motion
  const isPointerDown = useRef(false);
  const dragActive = useRef(false);
  const dragDistance = useRef(0);
  const pointerStartX = useRef(0);
  const trackStartX = useRef(0);   // translateX at drag start
  const currentX = useRef(0);      // live translateX (GPU)
  const targetX = useRef(0);       // where we're lerping toward
  const velX = useRef(0);
  const lastPointerX = useRef(0);
  const lastT = useRef(0);
  const rafId = useRef<number | null>(null);
  const cardWidth = useRef(424);

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  // Apply transform directly — bypasses React render, runs on compositor
  const applyTransform = useCallback((x: number) => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${x}px)`;
    }
    currentX.current = x;
  }, []);

  const getMaxX = useCallback(() => {
    const vw = viewportRef.current?.offsetWidth ?? 0;
    const total = images.length * cardWidth.current;
    return Math.max(0, total - vw + 64); // 64 = px padding
  }, []);

  const snapToIndex = useCallback((index: number, animate = true) => {
    const clamped = clamp(index, 0, images.length - 1);
    const dest = -(clamped * cardWidth.current);
    targetX.current = dest;
    setActiveIndex(clamped);

    if (!animate) {
      applyTransform(dest);
      currentX.current = dest;
      return;
    }

    // Smooth lerp animation via rAF
    if (rafId.current) cancelAnimationFrame(rafId.current);
    const animate_ = () => {
      const next = lerp(currentX.current, targetX.current, 0.1);
      applyTransform(next);
      if (Math.abs(next - targetX.current) > 0.5) {
        rafId.current = requestAnimationFrame(animate_);
      } else {
        applyTransform(targetX.current);
      }
    };
    rafId.current = requestAnimationFrame(animate_);
  }, [applyTransform, getMaxX]);

  // Measure card width after mount
  useEffect(() => {
    const measure = () => {
      if (trackRef.current) {
        const first = trackRef.current.children[0] as HTMLElement;
        if (first) cardWidth.current = first.offsetWidth + 24;
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Pointer handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    isPointerDown.current = true;
    dragActive.current = false;
    dragDistance.current = 0;
    pointerStartX.current = e.clientX;
    trackStartX.current = currentX.current;
    lastPointerX.current = e.clientX;
    lastT.current = performance.now();
    velX.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDown.current) return;
    const walk = e.clientX - pointerStartX.current;
    if (!dragActive.current && Math.abs(walk) < 4) return;

    if (!dragActive.current) {
      dragActive.current = true;
      setIsDragging(true);
    }

    e.preventDefault();
    dragDistance.current = Math.abs(walk);

    // Clamp with rubber-band resistance at edges
    const raw = trackStartX.current + walk;
    const maxX = getMaxX();
    let clamped: number;
    if (raw > 0) {
      clamped = raw * 0.2; // rubber-band left edge
    } else if (raw < -maxX) {
      clamped = -maxX + (raw + maxX) * 0.2; // rubber-band right edge
    } else {
      clamped = raw;
    }

    // Direct transform — no layout, pure GPU
    applyTransform(clamped);

    const now = performance.now();
    const dt = now - lastT.current;
    if (dt > 0) velX.current = (e.clientX - lastPointerX.current) / dt;
    lastPointerX.current = e.clientX;
    lastT.current = now;
  };

  const handlePointerUp = () => {
    if (!isPointerDown.current) return;
    isPointerDown.current = false;
    if (!dragActive.current) return;
    dragActive.current = false;
    setIsDragging(false);

    // Project with momentum, snap to nearest card
    const momentum = velX.current * 80;
    const projected = currentX.current + momentum;
    const nearestIndex = clamp(
      Math.round(-projected / cardWidth.current),
      0,
      images.length - 1
    );
    snapToIndex(nearestIndex);
    velX.current = 0;
  };

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);
  const goToPrev = () => selectedIndex !== null && selectedIndex > 0 && setSelectedIndex(selectedIndex - 1);
  const goToNext = () => selectedIndex !== null && selectedIndex < images.length - 1 && setSelectedIndex(selectedIndex + 1);

  return (
    <div className="w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-6"
      >
        <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
          Delivered Screens
        </h1>
        <p className="text-white/50 text-lg max-w-xl mx-auto">
          A visual journey through the key screens and features delivered
        </p>
      </motion.div>

      {/* Carousel Container */}
      <div className="relative">
        {activeIndex > 0 && (
          <button
            onClick={() => snapToIndex(activeIndex - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm shadow-lg shadow-black/50 transition-all hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}
        {activeIndex < images.length - 1 && (
          <button
            onClick={() => snapToIndex(activeIndex + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm shadow-lg shadow-black/50 transition-all hover:scale-110"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Viewport — clips the track */}
        <div
          ref={viewportRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={cn(
            "overflow-hidden px-8 py-4",
            isDragging ? "cursor-grabbing" : "cursor-grab"
          )}
          style={{ userSelect: "none", WebkitUserSelect: "none", touchAction: "pan-y" }}
        >
          {/* Track — moved via translateX on GPU, never scrollLeft */}
          <div
            ref={trackRef}
            className="flex gap-6"
            style={{ willChange: "transform", transform: "translateX(0px)" }}
          >
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="flex-shrink-0 w-[340px] md:w-[400px] group"
              >
                <div
                  onClick={() => dragDistance.current < 4 && openLightbox(index)}
                  className="relative rounded-2xl overflow-hidden glass transition-smooth hover:scale-[1.02] hover:shadow-2xl hover:shadow-white/5"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.caption}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-4 right-4 p-2 rounded-full bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-smooth transform translate-y-2 group-hover:translate-y-0">
                      <Maximize2 className="w-4 h-4 text-white" />
                    </div>
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm">
                      <span className="text-xs font-medium text-white/80">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-1">{image.caption}</h3>
                    <p className="text-sm text-white/50 line-clamp-2">{image.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Track Indicator */}
      <div className="flex justify-center mt-6 px-8">
        <div className="w-48 h-[3px] rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-white/70"
            animate={{ width: `${((activeIndex + 1) / images.length) * 100}%` }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
          />
        </div>
      </div>

      <Lightbox
        image={selectedIndex !== null ? images[selectedIndex] : null}
        isOpen={selectedIndex !== null}
        onClose={closeLightbox}
        onPrev={goToPrev}
        onNext={goToNext}
        hasPrev={selectedIndex !== null && selectedIndex > 0}
        hasNext={selectedIndex !== null && selectedIndex < images.length - 1}
      />
    </div>
  );
}
