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
      const cardWidth = 400 + 24; // card width + gap
      carouselRef.current.scrollTo({
        left: index * cardWidth,
        behavior: "smooth",
      });
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    setIsDragging(true);
    dragDistance.current = 0;
    startX.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeftRef.current = carouselRef.current.scrollLeft;
    lastX.current = e.pageX;
    lastT.current = performance.now();
    velX.current = 0;
    // Disable snap during drag for smooth feel
    carouselRef.current.style.scrollSnapType = "none";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = x - startX.current;
    dragDistance.current = Math.abs(walk);
    carouselRef.current.scrollLeft = scrollLeftRef.current - walk;

    const now = performance.now();
    const dt = now - lastT.current;
    if (dt > 0) velX.current = (e.pageX - lastX.current) / dt;
    lastX.current = e.pageX;
    lastT.current = now;
  };

  const handleMouseUp = () => {
    if (!carouselRef.current) return;
    setIsDragging(false);

    const carousel = carouselRef.current;
    const cardWidth = 400 + 24;
    const momentum = velX.current * 120; // project forward
    const targetScroll = carousel.scrollLeft - momentum;
    const newIndex = Math.max(0, Math.min(
      Math.round(targetScroll / cardWidth),
      images.length - 1
    ));

    // Re-enable snap then scroll
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
      const cardWidth = 400 + 24;
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
        className="text-center mb-12"
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
        <button
          onClick={() => scrollToCard(Math.max(0, activeIndex - 1))}
          disabled={activeIndex === 0}
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm shadow-lg shadow-black/50 transition-all",
            activeIndex === 0
              ? "opacity-40 cursor-not-allowed"
              : "hover:scale-110"
          )}
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        <button
          onClick={() => scrollToCard(Math.min(images.length - 1, activeIndex + 1))}
          disabled={activeIndex === images.length - 1}
          className={cn(
            "absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm shadow-lg shadow-black/50 transition-all",
            activeIndex === images.length - 1
              ? "opacity-40 cursor-not-allowed"
              : "hover:scale-110"
          )}
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        {/* Carousel */}
        <div
          ref={carouselRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={cn(
            "flex gap-6 overflow-x-auto px-8 py-4 hide-scrollbar cursor-grab",
            isDragging && "cursor-grabbing"
          )}
          style={{
            scrollSnapType: "x mandatory",
            userSelect: "none",
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
                onClick={() => !isDragging && dragDistance.current < 5 && openLightbox(index)}
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
