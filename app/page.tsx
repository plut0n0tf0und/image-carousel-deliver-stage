import { ImageCarousel } from "@/components/ImageCarousel";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0A0A0A] via-[#0D0D0D] to-[#0A0A0A]">
      {/* Subtle grid pattern */}
      <div 
        className="fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '100px 100px'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 px-4 py-16 md:py-24">
        <div className="max-w-[1600px] mx-auto">
          <ImageCarousel />
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none" />
    </main>
  );
}
