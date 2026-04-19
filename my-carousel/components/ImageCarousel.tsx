"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { images, ImageItem } from "@/lib/images";
import { Lightbox } from "./Lightbox";
import { cn } from "@/lib/utils";

const CARD_WIDTH = 424; // 400px card + 24px gap

export function ImageCarousel() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(3);
  const dragStartTime = useRef(0);
  const hasDragged = useRef(false);

  // Calculate how many cards fit on screen
  useEffect(() => {
    const updateCardsPerPage = () => {
      if (carouselRef.current) {
        const containerWidth = carouselRef.current.offsetWidth - 64; // minus padding
        const count = Math.floor(containerWidth / CARD_WIDTH);
        setCardsPerPage(Math.max(1, count));
      }
    };
    
    updateCardsPerPage();
    window.addEventListener('resize', updateCardsPerPage);
    return () => window.removeEventListener('resize', updateCardsPerPage);
  }, []);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const handleCardMouseDown = () => {
    // Reset drag state when starting a fresh click on a card
    hasDragged.current = false;
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

  const scrollToPage = useCallback((pageIndex: number) => {
    if (carouselRef.current) {
      const targetIndex = Math.min(pageIndex * cardsPerPage, images.length - 1);
      const maxScroll = carouselRef.current.scrollWidth - carouselRef.current.offsetWidth;
      const targetScroll = Math.min(targetIndex * CARD_WIDTH, maxScroll);
      
      carouselRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
      setActiveIndex(targetIndex);
    }
  }, [cardsPerPage]);

  // For indicator dots - scroll to specific card
  const scrollToCard = (index: number) => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: index * CARD_WIDTH,
        behavior: "smooth",
      });
      setActiveIndex(index);
    }
  };

  // Mouse drag handlers - no snap, free scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    hasDragged.current = false;
    dragStartTime.current = Date.now();
    setStartX(e.pageX);
    setScrollLeft(carouselRef.current.scrollLeft);
    carouselRef.current.style.cursor = "grabbing";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX;
    const walk = (x - startX) * 1.2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
    // Mark as dragged if moved more than 5 pixels
    if (Math.abs(x - startX) > 5) {
      hasDragged.current = true;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (carouselRef.current) {
      carouselRef.current.style.cursor = "grab";
    }
  };

  // Update active index on scroll
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleScroll = () => {
      const newIndex = Math.round(carousel.scrollLeft / CARD_WIDTH);
      setActiveIndex(Math.max(0, Math.min(newIndex, images.length - 1)));
    };

    carousel.addEventListener("scroll", handleScroll, { passive: true });
    return () => carousel.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate current page for arrows
  const currentPage = Math.floor(activeIndex / cardsPerPage);
  const totalPages = Math.ceil(images.length / cardsPerPage);

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
          Delivered
        </h1>
        <p className="text-white/50 text-lg max-w-xl mx-auto">
          Key screens and features delivered
        </p>
      </motion.div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Navigation Arrows - Page based */}
        <motion.button
          onClick={() => scrollToPage(currentPage - 1)}
          disabled={currentPage === 0}
          whileHover={currentPage !== 0 ? { scale: 1.15, backgroundColor: "rgba(255,255,255,0.15)" } : {}}
          whileTap={currentPage !== 0 ? { scale: 0.9 } : {}}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full glass",
            "shadow-lg shadow-black/20",
            currentPage === 0
              ? "opacity-20 cursor-not-allowed"
              : "cursor-pointer hover:shadow-xl hover:shadow-white/10"
          )}
        >
          <ChevronLeft className="w-7 h-7 text-white" />
        </motion.button>

        <motion.button
          onClick={() => scrollToPage(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          whileHover={currentPage < totalPages - 1 ? { scale: 1.15, backgroundColor: "rgba(255,255,255,0.15)" } : {}}
          whileTap={currentPage < totalPages - 1 ? { scale: 0.9 } : {}}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className={cn(
            "absolute right-4 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full glass",
            "shadow-lg shadow-black/20",
            currentPage >= totalPages - 1
              ? "opacity-20 cursor-not-allowed"
              : "cursor-pointer hover:shadow-xl hover:shadow-white/10"
          )}
        >
          <ChevronRight className="w-7 h-7 text-white" />
        </motion.button>

        {/* Carousel */}
        <div
          ref={carouselRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={cn(
            "flex gap-6 overflow-x-auto px-8 py-4 hide-scrollbar cursor-grab no-select",
            isDragging && "cursor-grabbing"
          )}
          style={{
            scrollBehavior: "smooth",
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
              style={{ scrollSnapAlign: "start" }}
            >
              {/* Card */}
              <div
                onMouseDown={handleCardMouseDown}
                onClick={() => {
                  // Only open if not dragging (moved less than 5px)
                  if (!hasDragged.current) {
                    openLightbox(index);
                  }
                }}
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
