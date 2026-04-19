"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { images, ImageItem } from "@/lib/images";
import { Lightbox } from "./Lightbox";
import { cn } from "@/lib/utils";

export function ImageCarousel() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragActive = useRef(false);       // ref copy — no re-render lag
  const isPointerDown = useRef(false);    // tracks if mouse button is held
  const dragDistance = useRef(0);
  const startX = useRef(0);
  const scrollLeftRef = useRef(0);
  const velX = useRef(0);
  const lastX = useRef(0);
  const lastT = useRef(0);
  const rafId = useRef<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const goToPrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < images.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const scrollToCard = (index: number) => {
    if (carouselRef.current) {
      const firstCard = carouselRef.current.children[0] as HTMLElement;
      const cardWidth = firstCard ? firstCard.offsetWidth + 24 : 424;
      carouselRef.current.scrollTo({
        left: index * cardWidth,
        behavior: "smooth",
      });
    }
  };

  // Drag handlers — pointer events work for mouse + touch, all logic in refs (no re-render during drag)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!carouselRef.current) return;
    if (e.button !== 0) return;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    isPointerDown.current = true;
    dragActive.current = false;
    dragDistance.current = 0;
    startX.current = e.clientX;
    scrollLeftRef.current = carouselRef.current.scrollLeft;
    lastX.current = e.clientX;
    lastT.current = performance.now();
    velX.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDown.current || !carouselRef.current) return;
    const walk = e.clientX - startX.current;
    if (!dragActive.current && Math.abs(walk) < 4) return;
    if (!dragActive.current) {
      dragActive.current = true;
      setIsDragging(true);
      carouselRef.current.style.scrollSnapType = "none";
    }
    e.preventDefault();
    dragDistance.current = Math.abs(walk);
    carouselRef.current.scrollLeft = scrollLeftRef.current - walk;

    const now = performance.now();
    const dt = now - lastT.current;
    if (dt > 0) velX.current = (e.clientX - lastX.current) / dt;
    lastX.current = e.clientX;
    lastT.current = now;
  };

  const handlePointerUp = () => {
    if (!isPointerDown.current || !carouselRef.current) return;
    isPointerDown.current = false;
    if (!dragActive.current) return;
    dragActive.current = false;
    setIsDragging(false);

    const carousel = carouselRef.current;
    const firstCard = carousel.children[0] as HTMLElement;
    const cardWidth = firstCard ? firstCard.offsetWidth + 24 : 424;
    const momentum = velX.current * 100;
    const targetScroll = carousel.scrollLeft - momentum;
    const newIndex = Math.max(0, Math.min(
      Math.round(targetScroll / cardWidth),
      images.length - 1
    ));

    carousel.style.scrollSnapType = "x mandatory";
    setActiveIndex(newIndex);
    scrollToCard(newIndex);
    velX.current = 0;
  };

  // Update active index on scroll
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleScroll = () => {
      const firstCard = carousel.children[0] as HTMLElement;
      const cardWidth = firstCard ? firstCard.offsetWidth + 24 : 424;
      const newIndex = Math.round(carousel.scrollLeft / cardWidth);
      setActiveIndex(Math.max(0, Math.min(newIndex, images.length - 1)));
    };

    carousel.addEventListener("scroll", handleScroll, { passive: true });
    return () => carousel.removeEventListener("scroll", handleScroll);
  }, []);

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
        {/* Navigation Arrows */}
        {activeIndex > 0 && (
          <button
            onClick={() => scrollToCard(activeIndex - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm shadow-lg shadow-black/50 transition-all hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}

        {activeIndex < images.length - 1 && (
          <button
            onClick={() => scrollToCard(activeIndex + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm shadow-lg shadow-black/50 transition-all hover:scale-110"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Carousel */}
        <div
          ref={carouselRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={cn(
            "flex gap-6 overflow-x-auto px-8 py-4 hide-scrollbar",
            isDragging ? "cursor-grabbing" : "cursor-grab"
          )}
          style={{
            scrollSnapType: "x mandatory",
            userSelect: "none",
            WebkitUserSelect: "none",
            touchAction: "pan-y",
          }}
        >
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={cn(
                "flex-shrink-0 w-[340px] md:w-[400px] group",
                "scroll-snap-align-center"
              )}
              style={{ scrollSnapAlign: "center" }}
            >
              {/* Card */}
              <div
                onClick={() => dragDistance.current < 4 && openLightbox(index)}
                className={cn(
                  "relative rounded-2xl overflow-hidden glass transition-smooth",
                  "hover:scale-[1.02] hover:shadow-2xl hover:shadow-white/5"
                )}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.caption}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    draggable={false}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Expand Icon */}
                  <div className="absolute top-4 right-4 p-2 rounded-full bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-smooth transform translate-y-2 group-hover:translate-y-0">
                    <Maximize2 className="w-4 h-4 text-white" />
                  </div>

                  {/* Number Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm">
                    <span className="text-xs font-medium text-white/80">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* Caption */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {image.caption}
                  </h3>
                  <p className="text-sm text-white/50 line-clamp-2">
                    {image.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Indicators */}
      <div className="flex justify-center gap-2 mt-8">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToCard(index)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              activeIndex === index
                ? "w-8 bg-white"
                : "w-1.5 bg-white/30 hover:bg-white/50"
            )}
          />
        ))}
      </div>

      {/* Lightbox */}
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
