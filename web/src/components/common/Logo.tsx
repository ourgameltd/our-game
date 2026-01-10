interface LogoProps {
  size?: number;
}

export default function Logo({ size = 128 }: LogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 512 512" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="text-gray-800 dark:text-white"
    >
      {/* Tactics Board Background */}
      <rect x="64" y="88" width="384" height="336" rx="32" fill="currentColor" fillOpacity="0.1" className="stroke-current" strokeWidth="20"/>
      
      {/* Pitch outline */}
      <rect x="104" y="128" width="304" height="256" rx="4" fill="none" className="stroke-current" strokeWidth="10"/>
      
      {/* Halfway line */}
      <line x1="256" y1="128" x2="256" y2="384" className="stroke-current" strokeWidth="8" strokeLinecap="round"/>
      
      {/* Centre circle */}
      <circle cx="256" cy="256" r="40" fill="none" className="stroke-current" strokeWidth="8"/>
      
      {/* Centre spot */}
      <circle cx="256" cy="256" r="6" className="fill-current"/>
      
      {/* Penalty areas */}
      <rect x="104" y="176" width="72" height="160" fill="none" className="stroke-current" strokeWidth="8"/>
      <rect x="336" y="176" width="72" height="160" fill="none" className="stroke-current" strokeWidth="8"/>
      
      {/* Six-yard boxes */}
      <rect x="104" y="216" width="32" height="80" fill="none" className="stroke-current" strokeWidth="8"/>
      <rect x="376" y="216" width="32" height="80" fill="none" className="stroke-current" strokeWidth="8"/>
      
      {/* Penalty spots */}
      <circle cx="168" cy="256" r="5" className="fill-current"/>
      <circle cx="344" cy="256" r="5" className="fill-current"/>
      
      {/* Tactical markers: home team (filled circles) */}
      <circle cx="196" cy="196" r="10" className="fill-current"/>
      <circle cx="196" cy="256" r="10" className="fill-current"/>
      <circle cx="196" cy="316" r="10" className="fill-current"/>
      <circle cx="236" cy="226" r="10" className="fill-current"/>
      <circle cx="236" cy="286" r="10" className="fill-current"/>
      
      {/* Tactical markers: away team (outlined circles) */}
      <circle cx="316" cy="196" r="10" fill="none" className="stroke-current" strokeWidth="4"/>
      <circle cx="316" cy="256" r="10" fill="none" className="stroke-current" strokeWidth="4"/>
      <circle cx="316" cy="316" r="10" fill="none" className="stroke-current" strokeWidth="4"/>
      <circle cx="276" cy="226" r="10" fill="none" className="stroke-current" strokeWidth="4"/>
      <circle cx="276" cy="286" r="10" fill="none" className="stroke-current" strokeWidth="4"/>
    </svg>
  );
}
