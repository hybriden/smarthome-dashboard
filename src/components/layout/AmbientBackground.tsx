/**
 * Animated ambient background with gradient orbs and circuit traces.
 * Uses pure CSS/SVG animations — no JS overhead.
 */
export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Primary warm orb — top right, slow drift */}
      <div
        className="absolute h-[600px] w-[600px] rounded-full opacity-[0.08]"
        style={{
          background: "radial-gradient(circle, #c8943e 0%, transparent 70%)",
          top: "-10%",
          right: "-5%",
          animation: "ambientDrift1 25s ease-in-out infinite",
        }}
      />

      {/* Secondary cool orb — bottom left */}
      <div
        className="absolute h-[500px] w-[500px] rounded-full opacity-[0.07]"
        style={{
          background: "radial-gradient(circle, #3b6eb5 0%, transparent 70%)",
          bottom: "-8%",
          left: "-5%",
          animation: "ambientDrift2 30s ease-in-out infinite",
        }}
      />

      {/* Accent orb — center */}
      <div
        className="absolute h-[400px] w-[400px] rounded-full opacity-[0.06]"
        style={{
          background: "radial-gradient(circle, #c8943e 0%, #3b6eb5 50%, transparent 70%)",
          top: "40%",
          left: "30%",
          animation: "ambientDrift3 35s ease-in-out infinite",
        }}
      />

      {/* Circuit board traces */}
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Glowing pulse gradient */}
          <linearGradient id="pulse1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c8943e" stopOpacity="0" />
            <stop offset="40%" stopColor="#c8943e" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#e0b05e" stopOpacity="1" />
            <stop offset="100%" stopColor="#c8943e" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="pulse2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b6eb5" stopOpacity="0" />
            <stop offset="40%" stopColor="#3b6eb5" stopOpacity="0.7" />
            <stop offset="60%" stopColor="#5b8ed5" stopOpacity="1" />
            <stop offset="100%" stopColor="#3b6eb5" stopOpacity="0" />
          </linearGradient>
          {/* Glow filter for nodes */}
          <filter id="circuitGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Circuit trace network 1 — top area */}
        <g opacity="0.12">
          {/* Horizontal main line */}
          <path d="M-50 120 L200 120 L230 150 L400 150 L430 120 L650 120 L680 150 L900 150" stroke="#c8943e" strokeWidth="0.8" fill="none" />
          {/* Branch down */}
          <path d="M200 120 L200 200 L250 250" stroke="#c8943e" strokeWidth="0.8" fill="none" />
          {/* Branch up */}
          <path d="M430 120 L430 60 L500 60 L530 30" stroke="#c8943e" strokeWidth="0.8" fill="none" />
          {/* Short stub */}
          <path d="M650 120 L650 80" stroke="#c8943e" strokeWidth="0.8" fill="none" />
          {/* Nodes (connection points) */}
          <circle cx="200" cy="120" r="2.5" fill="#c8943e" opacity="0.6" filter="url(#circuitGlow)" />
          <circle cx="430" cy="120" r="2.5" fill="#c8943e" opacity="0.6" filter="url(#circuitGlow)" />
          <circle cx="650" cy="120" r="2" fill="#c8943e" opacity="0.5" />
          <circle cx="250" cy="250" r="2" fill="#c8943e" opacity="0.4" />
          <circle cx="530" cy="30" r="2" fill="#c8943e" opacity="0.4" />
          <circle cx="650" cy="80" r="1.5" fill="#c8943e" opacity="0.4" />
          {/* Animated pulse along main line */}
          <circle r="3" fill="#c8943e" opacity="0.9" filter="url(#circuitGlow)">
            <animateMotion dur="8s" repeatCount="indefinite" path="M-50 120 L200 120 L230 150 L400 150 L430 120 L650 120 L680 150 L900 150" />
          </circle>
          <circle r="2" fill="#e0b05e" opacity="0.6">
            <animateMotion dur="8s" repeatCount="indefinite" begin="3s" path="M-50 120 L200 120 L230 150 L400 150 L430 120 L650 120 L680 150 L900 150" />
          </circle>
          {/* Pulse down branch */}
          <circle r="2" fill="#c8943e" opacity="0.7">
            <animateMotion dur="5s" repeatCount="indefinite" begin="1.5s" path="M200 120 L200 200 L250 250" />
          </circle>
        </g>

        {/* Circuit trace network 2 — bottom right */}
        <g opacity="0.10">
          <path d="M1200 500 L900 500 L870 530 L700 530 L670 500 L500 500 L470 530 L300 530" stroke="#3b6eb5" strokeWidth="0.8" fill="none" />
          {/* Branch up */}
          <path d="M700 530 L700 450 L650 400" stroke="#3b6eb5" strokeWidth="0.8" fill="none" />
          {/* Branch down */}
          <path d="M500 500 L500 580 L450 630" stroke="#3b6eb5" strokeWidth="0.8" fill="none" />
          {/* Stub */}
          <path d="M870 530 L870 580 L920 610" stroke="#3b6eb5" strokeWidth="0.8" fill="none" />
          {/* Nodes */}
          <circle cx="700" cy="530" r="2.5" fill="#3b6eb5" opacity="0.6" filter="url(#circuitGlow)" />
          <circle cx="500" cy="500" r="2.5" fill="#3b6eb5" opacity="0.6" filter="url(#circuitGlow)" />
          <circle cx="870" cy="530" r="2" fill="#3b6eb5" opacity="0.5" />
          <circle cx="650" cy="400" r="2" fill="#3b6eb5" opacity="0.4" />
          <circle cx="450" cy="630" r="2" fill="#3b6eb5" opacity="0.4" />
          <circle cx="920" cy="610" r="1.5" fill="#3b6eb5" opacity="0.4" />
          {/* Animated pulses */}
          <circle r="3" fill="#3b6eb5" opacity="0.9" filter="url(#circuitGlow)">
            <animateMotion dur="9s" repeatCount="indefinite" path="M1200 500 L900 500 L870 530 L700 530 L670 500 L500 500 L470 530 L300 530" />
          </circle>
          <circle r="2" fill="#5b8ed5" opacity="0.6">
            <animateMotion dur="9s" repeatCount="indefinite" begin="4s" path="M1200 500 L900 500 L870 530 L700 530 L670 500 L500 500 L470 530 L300 530" />
          </circle>
          {/* Pulse up branch */}
          <circle r="2" fill="#3b6eb5" opacity="0.7">
            <animateMotion dur="4s" repeatCount="indefinite" begin="2s" path="M700 530 L700 450 L650 400" />
          </circle>
        </g>

        {/* Circuit trace network 3 — middle diagonal */}
        <g opacity="0.08">
          <path d="M-20 350 L150 350 L180 320 L350 320 L380 350 L550 350 L600 300 L750 300 L800 350 L1000 350" stroke="#c8943e" strokeWidth="0.6" fill="none" />
          {/* Short branches */}
          <path d="M350 320 L350 270 L390 240" stroke="#c8943e" strokeWidth="0.6" fill="none" />
          <path d="M600 300 L600 250" stroke="#c8943e" strokeWidth="0.6" fill="none" />
          {/* Nodes */}
          <circle cx="350" cy="320" r="2" fill="#c8943e" opacity="0.5" />
          <circle cx="600" cy="300" r="2" fill="#c8943e" opacity="0.5" />
          <circle cx="390" cy="240" r="1.5" fill="#c8943e" opacity="0.3" />
          {/* Pulse */}
          <circle r="2.5" fill="#c8943e" opacity="0.8" filter="url(#circuitGlow)">
            <animateMotion dur="12s" repeatCount="indefinite" path="M-20 350 L150 350 L180 320 L350 320 L380 350 L550 350 L600 300 L750 300 L800 350 L1000 350" />
          </circle>
        </g>

        {/* Scattered small circuit fragments for depth */}
        <g opacity="0.06">
          {/* Top right fragment */}
          <path d="M800 80 L900 80 L930 50 L1050 50" stroke="#c8943e" strokeWidth="0.5" fill="none" />
          <circle cx="900" cy="80" r="1.5" fill="#c8943e" opacity="0.4" />
          <circle r="1.5" fill="#c8943e" opacity="0.6">
            <animateMotion dur="6s" repeatCount="indefinite" path="M800 80 L900 80 L930 50 L1050 50" />
          </circle>

          {/* Bottom left fragment */}
          <path d="M50 600 L150 600 L180 630 L300 630" stroke="#3b6eb5" strokeWidth="0.5" fill="none" />
          <circle cx="150" cy="600" r="1.5" fill="#3b6eb5" opacity="0.4" />
          <circle r="1.5" fill="#3b6eb5" opacity="0.6">
            <animateMotion dur="7s" repeatCount="indefinite" begin="1s" path="M50 600 L150 600 L180 630 L300 630" />
          </circle>

          {/* Center right fragment */}
          <path d="M950 300 L1050 300 L1080 270 L1150 270" stroke="#3b6eb5" strokeWidth="0.5" fill="none" />
          <circle r="1.5" fill="#3b6eb5" opacity="0.5">
            <animateMotion dur="5s" repeatCount="indefinite" begin="2s" path="M950 300 L1050 300 L1080 270 L1150 270" />
          </circle>
        </g>

        {/* Pulsing node highlights — slow breathing effect */}
        <circle cx="200" cy="120" r="6" fill="none" stroke="#c8943e" strokeWidth="0.5" opacity="0.15">
          <animate attributeName="r" values="4;8;4" dur="4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.15;0.05;0.15" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="700" cy="530" r="6" fill="none" stroke="#3b6eb5" strokeWidth="0.5" opacity="0.12">
          <animate attributeName="r" values="4;8;4" dur="5s" repeatCount="indefinite" begin="1s" />
          <animate attributeName="opacity" values="0.12;0.04;0.12" dur="5s" repeatCount="indefinite" begin="1s" />
        </circle>
      </svg>

      {/* Fine grain noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />
    </div>
  );
}
