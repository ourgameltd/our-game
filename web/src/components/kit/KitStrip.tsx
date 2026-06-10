import { useId } from 'react';

interface KitStripProps {
  shirtColor: string;
  shirtColor2?: string;
  stripType?: 'plain' | 'hooped' | 'striped' | 'sash' | 'half-and-half' | 'sleeves';
  shortsColor: string;
  socksColor: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeWidths = { sm: 40, md: 64, lg: 96 };

const SHIRT_PATH = 'M34,6 L28,8 L8,16 L12,30 L24,27 L25,57 L55,57 L56,27 L68,30 L72,16 L52,8 L46,6 Q40,13 34,6 Z';
const BODY_PATH  = 'M34,6 L28,8 L24,27 L25,57 L55,57 L56,27 L52,8 L46,6 Q40,13 34,6 Z';
const SLEEVE_L   = 'M28,8 L8,16 L12,30 L24,27 Z';
const SLEEVE_R   = 'M52,8 L56,27 L68,30 L72,16 Z';

export default function KitStrip({
  shirtColor,
  shirtColor2 = '#FFFFFF',
  stripType = 'plain',
  shortsColor,
  socksColor,
  size = 'md',
}: KitStripProps) {
  const uid = useId().replace(/:/g, '');
  const clipId = `shirt-clip-${uid}`;
  const width = sizeWidths[size];
  const stroke = 'rgba(0,0,0,0.18)';

  function renderShirt() {
    if (stripType === 'sleeves') {
      return (
        <>
          <path d={BODY_PATH}  fill={shirtColor}  stroke={stroke} strokeWidth="1" strokeLinejoin="round" />
          <path d={SLEEVE_L}   fill={shirtColor2} stroke={stroke} strokeWidth="1" strokeLinejoin="round" />
          <path d={SLEEVE_R}   fill={shirtColor2} stroke={stroke} strokeWidth="1" strokeLinejoin="round" />
        </>
      );
    }

    const overlay = (() => {
      switch (stripType) {
        case 'hooped':
          return (
            <>
              <rect x="0"  y="17" width="80" height="6" fill={shirtColor2} />
              <rect x="0"  y="31" width="80" height="6" fill={shirtColor2} />
              <rect x="0"  y="45" width="80" height="6" fill={shirtColor2} />
            </>
          );
        case 'striped':
          return (
            <>
              <rect x="20" y="0" width="7" height="110" fill={shirtColor2} />
              <rect x="37" y="0" width="7" height="110" fill={shirtColor2} />
              <rect x="54" y="0" width="7" height="110" fill={shirtColor2} />
            </>
          );
        case 'sash':
          // diagonal band from left-shoulder area to right-hip area
          return <polygon points="20,6 45,6 60,57 35,57" fill={shirtColor2} />;
        case 'half-and-half':
          return <rect x="40" y="0" width="40" height="110" fill={shirtColor2} />;
        default:
          return null;
      }
    })();

    return (
      <>
        <defs>
          <clipPath id={clipId}>
            <path d={SHIRT_PATH} />
          </clipPath>
        </defs>
        {/* Base shirt fill */}
        <path d={SHIRT_PATH} fill={shirtColor} stroke={stroke} strokeWidth="1" strokeLinejoin="round" />
        {/* Pattern overlay clipped to shirt shape */}
        {overlay && (
          <g clipPath={`url(#${clipId})`}>
            {overlay}
          </g>
        )}
        {/* Re-draw stroke on top so the outline is clean */}
        <path d={SHIRT_PATH} fill="none" stroke={stroke} strokeWidth="1" strokeLinejoin="round" />
      </>
    );
  }

  return (
    <svg
      width={width}
      viewBox="0 0 80 110"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden="true"
    >
      {renderShirt()}

      {/* Shorts */}
      <path
        d="M25,59 L55,59 L54,80 L43,80 L40,67 L37,80 L26,80 Z"
        fill={shortsColor}
        stroke={stroke}
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* Left sock */}
      <rect x="26" y="82" width="10" height="24" rx="3" fill={socksColor} stroke={stroke} strokeWidth="1" />
      {/* Right sock */}
      <rect x="44" y="82" width="10" height="24" rx="3" fill={socksColor} stroke={stroke} strokeWidth="1" />
    </svg>
  );
}
