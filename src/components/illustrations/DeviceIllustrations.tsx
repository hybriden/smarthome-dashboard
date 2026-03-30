interface IllustrationProps {
  className?: string;
  glow?: boolean;
}

export function LampIllustration({ className, glow }: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {glow && (
        <>
          <defs>
            <radialGradient id="lampGlow" cx="60" cy="50" r="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#c8943e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#c8943e" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="60" cy="50" r="50" fill="url(#lampGlow)" />
        </>
      )}
      {/* Cord */}
      <line x1="60" y1="0" x2="60" y2="22" stroke="#4a4440" strokeWidth="2" />
      {/* Canopy */}
      <ellipse cx="60" cy="24" rx="12" ry="3" fill="#2a2622" stroke="#4a4440" strokeWidth="1" />
      {/* Shade - pendant lamp */}
      <path d="M38 50 Q38 28 60 28 Q82 28 82 50 Z" fill="#1e1c19" stroke={glow ? "#c8943e" : "#4a4440"} strokeWidth="1.5" />
      <path d="M34 50 L86 50" stroke={glow ? "#c8943e" : "#4a4440"} strokeWidth="1.5" strokeLinecap="round" />
      {/* Inner glow */}
      {glow && (
        <>
          <path d="M42 50 L78 50 L72 68 Q60 74 48 68 Z" fill="#c8943e" fillOpacity="0.12" />
          <ellipse cx="60" cy="44" rx="14" ry="6" fill="#c8943e" fillOpacity="0.15" />
        </>
      )}
      {/* Light cone when on */}
      {glow && (
        <path d="M40 52 L20 95 L100 95 L80 52" fill="#c8943e" fillOpacity="0.04" />
      )}
      {/* Bulb hint */}
      <ellipse cx="60" cy="48" rx="5" ry="4" fill={glow ? "#e0b05e" : "#2a2622"} fillOpacity={glow ? "0.6" : "1"} />
    </svg>
  );
}

export function ThermostatIllustration({ className }: IllustrationProps & { temp?: number }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Outer ring */}
      <circle cx="60" cy="60" r="48" fill="#1a1816" stroke="#2a2622" strokeWidth="2" />
      <circle cx="60" cy="60" r="42" fill="#0c0b0a" stroke="#2a2622" strokeWidth="1" />
      {/* Temperature arc */}
      <path
        d="M30 75 A38 38 0 1 1 90 75"
        stroke="#2a2622"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M30 75 A38 38 0 1 1 78 88"
        stroke="url(#tempGrad)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <defs>
        <linearGradient id="tempGrad" x1="30" y1="60" x2="90" y2="60">
          <stop offset="0%" stopColor="#3b6eb5" />
          <stop offset="50%" stopColor="#c8943e" />
          <stop offset="100%" stopColor="#d9534f" />
        </linearGradient>
      </defs>
      {/* Tick marks */}
      {[...Array(12)].map((_, i) => {
        const angle = -210 + i * 24;
        const rad = (angle * Math.PI) / 180;
        const x1 = 60 + 36 * Math.cos(rad);
        const y1 = 60 + 36 * Math.sin(rad);
        const x2 = 60 + 39 * Math.cos(rad);
        const y2 = 60 + 39 * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4a4440" strokeWidth="1" />;
      })}
      {/* Center display area */}
      <circle cx="60" cy="56" r="20" fill="#1a1816" />
      {/* Snowflake / mode icon */}
      <circle cx="60" cy="80" r="6" fill="#1e1c19" stroke="#2a2622" strokeWidth="1" />
      <path d="M57 80 L63 80 M60 77 L60 83" stroke="#c8943e" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function SensorIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Base unit */}
      <rect x="35" y="25" width="50" height="70" rx="12" fill="#1e1c19" stroke="#2a2622" strokeWidth="1.5" />
      {/* Screen area */}
      <rect x="42" y="34" width="36" height="28" rx="4" fill="#0c0b0a" />
      {/* Screen content - wave lines */}
      <path d="M48 48 Q52 42 56 48 Q60 54 64 48 Q68 42 72 48" stroke="#c8943e" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M48 54 Q52 48 56 54 Q60 60 64 54 Q68 48 72 54" stroke="#5cb85c" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4" />
      {/* Indicator dots */}
      <circle cx="50" cy="72" r="2.5" fill="#c8943e" opacity="0.8" />
      <circle cx="60" cy="72" r="2.5" fill="#5cb85c" opacity="0.8" />
      <circle cx="70" cy="72" r="2.5" fill="#2a2622" />
      {/* Ventilation slits */}
      <line x1="48" y1="82" x2="72" y2="82" stroke="#2a2622" strokeWidth="1" />
      <line x1="50" y1="85" x2="70" y2="85" stroke="#2a2622" strokeWidth="1" />
    </svg>
  );
}

export function PlugIllustration({ className, glow }: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Socket body */}
      <rect x="28" y="30" width="64" height="60" rx="14" fill="#1e1c19" stroke={glow ? "#c8943e" : "#2a2622"} strokeWidth="1.5" />
      {/* Inner circle */}
      <circle cx="60" cy="58" r="20" fill="#0c0b0a" stroke="#2a2622" strokeWidth="1" />
      {/* Plug holes - Schuko style */}
      <ellipse cx="52" cy="52" rx="3" ry="5" fill="#1a1816" stroke="#4a4440" strokeWidth="1" />
      <ellipse cx="68" cy="52" rx="3" ry="5" fill="#1a1816" stroke="#4a4440" strokeWidth="1" />
      {/* Ground pin */}
      <circle cx="60" cy="66" r="2" fill="#4a4440" />
      {/* Power indicator */}
      {glow && <circle cx="60" cy="38" r="3" fill="#c8943e" opacity="0.8" />}
      {!glow && <circle cx="60" cy="38" r="3" fill="#2a2622" />}
      {/* LED ring glow */}
      {glow && (
        <circle cx="60" cy="58" r="22" fill="none" stroke="#c8943e" strokeWidth="0.5" opacity="0.3" />
      )}
      {/* Cable coming from bottom */}
      <path d="M60 90 Q60 100 55 108" stroke="#4a4440" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function BlindsIllustration({ className, openPercent = 100 }: IllustrationProps & { openPercent?: number }) {
  const slats = 6;
  const closedSlats = Math.round((openPercent / 100) * slats);

  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Window frame */}
      <rect x="20" y="15" width="80" height="90" rx="4" fill="#0c0b0a" stroke="#2a2622" strokeWidth="1.5" />
      {/* Window glass - sky gradient */}
      <defs>
        <linearGradient id="skyGrad" x1="60" y1="15" x2="60" y2="105">
          <stop offset="0%" stopColor="#1a2a4a" />
          <stop offset="100%" stopColor="#0c1525" />
        </linearGradient>
      </defs>
      <rect x="24" y="19" width="72" height="82" rx="2" fill="url(#skyGrad)" />
      {/* Stars */}
      <circle cx="40" cy="30" r="1" fill="#c2c2c2" opacity="0.5" />
      <circle cx="70" cy="40" r="0.8" fill="#c2c2c2" opacity="0.3" />
      <circle cx="55" cy="25" r="1.2" fill="#c2c2c2" opacity="0.4" />
      {/* Blind roller */}
      <rect x="24" y="19" width="72" height="6" rx="2" fill="#2a2622" />
      {/* Blind slats */}
      {Array.from({ length: closedSlats }).map((_, i) => (
        <rect
          key={i}
          x="24"
          y={26 + i * 13}
          width="72"
          height="10"
          fill="#1e1c19"
          stroke="#2a2622"
          strokeWidth="0.5"
          opacity={0.9 - i * 0.05}
        />
      ))}
      {/* Pull cord */}
      <line x1="88" y1="22" x2="88" y2={32 + closedSlats * 13} stroke="#4a4440" strokeWidth="1" />
      <circle cx="88" cy={34 + closedSlats * 13} r="2" fill="#c8943e" opacity="0.6" />
    </svg>
  );
}

export function AlarmIllustration({ className, triggered }: IllustrationProps & { triggered?: boolean }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Pulse rings when triggered */}
      {triggered && (
        <>
          <circle cx="60" cy="55" r="45" fill="none" stroke="#d9534f" strokeWidth="0.5" opacity="0.2">
            <animate attributeName="r" from="35" to="50" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="60" cy="55" r="35" fill="none" stroke="#d9534f" strokeWidth="0.5" opacity="0.3">
            <animate attributeName="r" from="28" to="42" dur="2s" repeatCount="indefinite" begin="0.5s" />
            <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" begin="0.5s" />
          </circle>
        </>
      )}
      {/* Sensor body */}
      <circle cx="60" cy="55" r="28" fill="#1e1c19" stroke={triggered ? "#d9534f" : "#2a2622"} strokeWidth="1.5" />
      <circle cx="60" cy="55" r="22" fill="#0c0b0a" />
      {/* Motion/contact icon */}
      {triggered ? (
        <>
          {/* Alert icon */}
          <path d="M60 40 L60 56" stroke="#d9534f" strokeWidth="3" strokeLinecap="round" />
          <circle cx="60" cy="64" r="2" fill="#d9534f" />
        </>
      ) : (
        <>
          {/* Shield/check icon */}
          <path d="M60 38 L72 44 L72 56 Q72 66 60 72 Q48 66 48 56 L48 44 Z"
            fill="none" stroke="#5cb85c" strokeWidth="1.5" opacity="0.6" />
          <path d="M54 54 L58 58 L66 50" stroke="#5cb85c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        </>
      )}
      {/* Bottom mount */}
      <rect x="55" y="84" width="10" height="14" rx="2" fill="#1e1c19" stroke="#2a2622" strokeWidth="1" />
      <rect x="52" y="96" width="16" height="4" rx="2" fill="#2a2622" />
    </svg>
  );
}

export function EnergyIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Lightning bolt */}
      <path d="M65 15 L45 55 L58 55 L50 105 L80 50 L65 50 Z" fill="#c8943e" fillOpacity="0.15" stroke="#c8943e" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Inner bolt highlight */}
      <path d="M63 28 L52 52 L60 52 L55 85 L73 52 L64 52 Z" fill="#c8943e" fillOpacity="0.08" />
    </svg>
  );
}
