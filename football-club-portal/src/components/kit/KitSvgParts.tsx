import type { Kit, KitPattern } from '@/types';

type ShirtColors = Pick<Kit['shirt'], 'primaryColor' | 'secondaryColor' | 'sleeveColor' | 'pattern'>;

function ShirtPatternDefs({
  kitId,
  pattern,
  primaryColor,
  secondaryColor,
}: {
  kitId: string;
  pattern: KitPattern;
  primaryColor: string;
  secondaryColor?: string;
}) {
  if (pattern === 'solid') return null;

  const safeSecondary = secondaryColor || '#FFFFFF';

  return (
    <defs>
      <pattern id={`kit-pattern-${kitId}`} x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
        {pattern === 'vertical-stripes' && (
          <>
            <rect x="0" y="0" width="15" height="30" fill={primaryColor} />
            <rect x="15" y="0" width="15" height="30" fill={safeSecondary} />
          </>
        )}
        {pattern === 'horizontal-stripes' && (
          <>
            <rect x="0" y="0" width="30" height="15" fill={primaryColor} />
            <rect x="0" y="15" width="30" height="15" fill={safeSecondary} />
          </>
        )}
      </pattern>
    </defs>
  );
}

function getShirtFill({ kitId, pattern, primaryColor }: { kitId: string; pattern: KitPattern; primaryColor: string }) {
  return pattern === 'solid' ? primaryColor : `url(#kit-pattern-${kitId})`;
}

export function KitShirtSvg({
  kitId,
  shirt,
  className,
}: {
  kitId: string;
  shirt: ShirtColors;
  className?: string;
}) {
  // Extracted from the provided example SVG (shirt only).
  // Uses the original coordinate space so the silhouette stays accurate.
  return (
    <svg
      viewBox="470 60 470 470"
      className={className}
      role="img"
      aria-label="Shirt preview"
      preserveAspectRatio="xMidYMid meet"
    >
      <ShirtPatternDefs
        kitId={kitId}
        pattern={shirt.pattern}
        primaryColor={shirt.primaryColor}
        secondaryColor={shirt.secondaryColor}
      />

      <g stroke="currentColor" strokeWidth={10} strokeLinejoin="round" strokeLinecap="round">
        {/* Main shirt body */}
        <path
          d="M797.6,100.4c-22.6-9.7-47.4-24.8-51.7-31.2c0,0-15.1,25.9-49.6,26.9c-34.5-1.1-49.6-26.9-49.6-26.9c-4.3,6.5-29.1,21.6-51.7,31.2c-84.4,36.2-102.4,136.9-102.4,136.9c9.7,16.2,65.7,29.1,65.7,29.1l18.3-29.1c20.5,31.2,9.7,251.1,9.7,251.1c58.2,39.9,161.6,39.9,219.8,0c0,0-10.8-219.8,9.7-251.1l18.3,29.1c0,0,56-12.9,65.7-29.1C900,237.2,882,136.5,797.6,100.4z"
          fill={getShirtFill({ kitId, pattern: shirt.pattern, primaryColor: shirt.primaryColor })}
        />
      </g>
    </svg>
  );
}

export function KitShortsSvg({
  shortsColor,
  className,
}: {
  shortsColor: string;
  className?: string;
}) {
  // Extracted from the provided example SVG (shorts only).
  return (
    <svg
      viewBox="555 580 320 310"
      className={className}
      role="img"
      aria-label="Shorts preview"
      preserveAspectRatio="xMidYMid meet"
    >
      <g stroke="currentColor" strokeWidth={10} strokeLinejoin="round" strokeLinecap="round">
        <path
          d="M805.5,589.8c0,0-50.4,21.8-106.3,21.8c-50.7,0-106.3-21.8-106.3-21.8l-21.3,255.1c0,0,54.3,52,113.4,11.8l14.2-113.4l14.2,113.4c59.1,40.2,113.4-11.8,113.4-11.8L805.5,589.8z"
          fill={shortsColor}
        />
      </g>
    </svg>
  );
}

export function KitSocksSvg({
  socksColor,
  className,
}: {
  socksColor: string;
  className?: string;
}) {
  // Extracted from the provided example SVG (socks only) using the two sock shapes
  // like the one you referenced (paths starting at 112.3,622.7 and 207.6,622.7).
  return (
    <svg
      viewBox="85 330 290 370"
      className={className}
      role="img"
      aria-label="Socks preview"
      preserveAspectRatio="xMidYMax meet"
    >
      <g stroke="currentColor" strokeWidth={6} strokeLinejoin="round" strokeLinecap="round">
        <path
          d="M112.3,622.7c0,0-4.7-8,8-14.7c12.7-6.7,50-28,53.3-66.7c3.3-38.7-12-170-3.3-185.3c0,0,38-6,60-2.7c0,0,3.3,74-12.7,129.3s-6,76.7-3.3,80c2.7,3.3,15.3,31.3-10.7,38.7c-26,7.3-34.7,13.3-38,18C162.3,624.1,122.3,636.1,112.3,622.7z"
          fill={socksColor}
        />
        <path
          d="M207.6,622.7c0,0-4.7-8,8-14.7c12.7-6.7,50-28,53.3-66.7c3.3-38.7-12-170-3.3-185.3c0,0,38-6,60-2.7c0,0,3.3,74-12.7,129.3s-6,76.7-3.3,80c2.7,3.3,15.3,31.3-10.7,38.7c-26,7.3-34.7,13.3-38,18C257.6,624.1,217.6,636.1,207.6,622.7z"
          fill={socksColor}
        />
      </g>
    </svg>
  );
}
