interface KitStripProps {
  shirtColor: string;
  shortsColor: string;
  socksColor: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeWidths = { sm: 40, md: 64, lg: 96 };

export default function KitStrip({ shirtColor, shortsColor, socksColor, size = 'md' }: KitStripProps) {
  const width = sizeWidths[size];
  const stroke = 'rgba(0,0,0,0.18)';

  return (
    <svg
      width={width}
      viewBox="0 0 80 110"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden="true"
    >
      {/* Shirt: scooped neck, short sleeves, torso tapering in at the waist */}
      <path
        d="M34,6 L28,8 L8,16 L12,30 L24,27 L25,57 L55,57 L56,27 L68,30 L72,16 L52,8 L46,6 Q40,13 34,6 Z"
        fill={shirtColor}
        stroke={stroke}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* Shorts: waistband splitting into two legs with a centre notch */}
      <path
        d="M25,59 L55,59 L54,80 L43,80 L40,67 L37,80 L26,80 Z"
        fill={shortsColor}
        stroke={stroke}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* Left sock */}
      <rect
        x="26" y="82" width="10" height="24" rx="3"
        fill={socksColor}
        stroke={stroke}
        strokeWidth="1"
      />
      {/* Right sock */}
      <rect
        x="44" y="82" width="10" height="24" rx="3"
        fill={socksColor}
        stroke={stroke}
        strokeWidth="1"
      />
    </svg>
  );
}
