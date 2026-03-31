/**
 * Subtle animated ambient background with slow-moving gradient orbs.
 * Uses pure CSS animations — no JS overhead.
 */
export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Primary warm orb — top right, slow drift */}
      <div
        className="absolute h-[600px] w-[600px] rounded-full opacity-[0.03]"
        style={{
          background: "radial-gradient(circle, #c8943e 0%, transparent 70%)",
          top: "-10%",
          right: "-5%",
          animation: "ambientDrift1 25s ease-in-out infinite",
        }}
      />

      {/* Secondary cool orb — bottom left */}
      <div
        className="absolute h-[500px] w-[500px] rounded-full opacity-[0.025]"
        style={{
          background: "radial-gradient(circle, #3b6eb5 0%, transparent 70%)",
          bottom: "-8%",
          left: "-5%",
          animation: "ambientDrift2 30s ease-in-out infinite",
        }}
      />

      {/* Accent orb — center, very subtle */}
      <div
        className="absolute h-[400px] w-[400px] rounded-full opacity-[0.02]"
        style={{
          background: "radial-gradient(circle, #c8943e 0%, #3b6eb5 50%, transparent 70%)",
          top: "40%",
          left: "30%",
          animation: "ambientDrift3 35s ease-in-out infinite",
        }}
      />

      {/* Fine grain noise texture overlay for premium feel */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />
    </div>
  );
}
