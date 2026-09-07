import React from "react";

interface BusIllustrationProps {
  operatorType?: "ALL" | "SLTB" | "PRIVATE";
  className?: string;
}

export const BusIllustration: React.FC<BusIllustrationProps> = ({
  operatorType = "ALL",
  className = "w-40 h-24 md:w-52 md:h-28",
}) => {
  const isSltb = operatorType === "SLTB";
  const isPrivate = operatorType === "PRIVATE";

  // Color mappings
  const bodyColor = isSltb
    ? "#e94b50" // SLTB Iconic Red
    : isPrivate
      ? "#f8f3e6" // Private Ivory
      : "#3b82f6"; // Transit Blue / Modern Coach

  const accentColor = isSltb
    ? "#ffffff" // White stripe for SLTB
    : isPrivate
      ? "#ead57b" // Warm Gold for Private
      : "#60a5fa"; // Light Blue

  const secondaryAccent = isSltb
    ? "#b91c1c"
    : isPrivate
      ? "#c9a838"
      : "#1d4ed8";

  const windowTint = isSltb ? "#1e293b" : isPrivate ? "#1e293b" : "#0f172a";

  const destinationText = isSltb
    ? "SLTB · CENTRAL"
    : isPrivate
      ? "PRIVATE INTERCITY"
      : "YBiL EXPRESS";

  return (
    <svg
      viewBox="0 0 240 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Stylized transit bus"
    >
      <defs>
        {/* Soft ground shadow */}
        <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        {/* Windshield glare gradient */}
        <linearGradient id="windshieldGlare" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.8" />
        </linearGradient>

        {/* Headlight beam */}
        <linearGradient id="headlightGlow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="120" cy="110" rx="105" ry="7" fill="url(#groundShadow)" />

      {/* Forward Headlight Glow */}
      <polygon
        points="215,92 240,88 240,98 215,95"
        fill="url(#headlightGlow)"
        opacity="0.6"
      />

      {/* Main Bus Body */}
      <path
        d="M25 36C25 31.58 28.58 28 33 28H195C208 28 218 37 220 50L223 84C223.5 90 219 95 213 95H25C20.58 95 17 91.42 17 87V44C17 39.58 20.58 36 25 36Z"
        fill={bodyColor}
      />

      {/* Bus Roof Aerodynamic Curve / AC Unit */}
      <rect
        x="75"
        y="24"
        width="70"
        height="5"
        rx="2.5"
        fill={secondaryAccent}
      />
      <rect
        x="90"
        y="22"
        width="40"
        height="3"
        rx="1.5"
        fill="#94a3b8"
        opacity="0.6"
      />

      {/* Contrast Livery Stripe */}
      <path
        d="M17 76H222L221 82H17V76Z"
        fill={accentColor}
        opacity={isPrivate ? "1" : "0.9"}
      />
      {isPrivate && (
        <path d="M17 84H220L219 86H17V84Z" fill={secondaryAccent} />
      )}

      {/* Destination LED Board Box */}
      <rect x="160" y="32" width="50" height="11" rx="2" fill="#090d10" />
      <text
        x="185"
        y="40"
        fill="#facc15"
        fontSize="5.5"
        fontFamily="'Space Grotesk', monospace"
        fontWeight="700"
        textAnchor="middle"
        letterSpacing="0.5"
      >
        {destinationText}
      </text>

      {/* Windows Section (Frame) */}
      <rect x="25" y="45" width="186" height="26" rx="4" fill={windowTint} />

      {/* Individual Passenger Windows */}
      <rect x="29" y="48" width="22" height="20" rx="2" fill="#334155" />
      <rect x="55" y="48" width="22" height="20" rx="2" fill="#334155" />
      <rect x="81" y="48" width="22" height="20" rx="2" fill="#334155" />
      <rect x="107" y="48" width="22" height="20" rx="2" fill="#334155" />
      <rect x="133" y="48" width="22" height="20" rx="2" fill="#334155" />

      {/* Front Windshield with Glare */}
      <path
        d="M160 48H204C208 48 210 52 209 56L206 68H160V48Z"
        fill="url(#windshieldGlare)"
      />
      {/* Driver Window Divider */}
      <line
        x1="160"
        y1="48"
        x2="160"
        y2="68"
        stroke="#0f172a"
        strokeWidth="2"
      />

      {/* Passenger Window Glass Sheen */}
      <line
        x1="33"
        y1="50"
        x2="43"
        y2="66"
        stroke="#ffffff"
        strokeWidth="1"
        strokeOpacity="0.2"
      />
      <line
        x1="59"
        y1="50"
        x2="69"
        y2="66"
        stroke="#ffffff"
        strokeWidth="1"
        strokeOpacity="0.2"
      />
      <line
        x1="85"
        y1="50"
        x2="95"
        y2="66"
        stroke="#ffffff"
        strokeWidth="1"
        strokeOpacity="0.2"
      />
      <line
        x1="111"
        y1="50"
        x2="121"
        y2="66"
        stroke="#ffffff"
        strokeWidth="1"
        strokeOpacity="0.2"
      />
      <line
        x1="137"
        y1="50"
        x2="147"
        y2="66"
        stroke="#ffffff"
        strokeWidth="1"
        strokeOpacity="0.2"
      />

      {/* Front Headlight Cluster */}
      <rect x="217" y="88" width="5" height="5" rx="1.5" fill="#fef08a" />
      <circle cx="219.5" cy="90.5" r="1.5" fill="#ffffff" />
      {/* Front Indicator */}
      <circle cx="214" cy="90.5" r="1.5" fill="#f97316" />

      {/* Rear Taillight */}
      <rect x="17" y="82" width="2" height="7" rx="1" fill="#ef4444" />

      {/* Front Bumper */}
      <rect x="210" y="93" width="13" height="4" rx="2" fill="#1e293b" />

      {/* Rear Wheel Well */}
      <circle cx="60" cy="95" r="16" fill="#0f172a" />
      {/* Rear Outer Tire */}
      <circle cx="60" cy="95" r="13" fill="#1e293b" />
      {/* Rear Rim */}
      <circle cx="60" cy="95" r="8" fill="#94a3b8" />
      <circle cx="60" cy="95" r="4" fill="#475569" />
      <circle cx="60" cy="95" r="1.5" fill="#f8fafc" />

      {/* Front Wheel Well */}
      <circle cx="178" cy="95" r="16" fill="#0f172a" />
      {/* Front Outer Tire */}
      <circle cx="178" cy="95" r="13" fill="#1e293b" />
      {/* Front Rim */}
      <circle cx="178" cy="95" r="8" fill="#94a3b8" />
      <circle cx="178" cy="95" r="4" fill="#475569" />
      <circle cx="178" cy="95" r="1.5" fill="#f8fafc" />

      {/* Underbody Line */}
      <line
        x1="76"
        y1="95"
        x2="162"
        y2="95"
        stroke="#090d10"
        strokeWidth="2.5"
      />
    </svg>
  );
};
