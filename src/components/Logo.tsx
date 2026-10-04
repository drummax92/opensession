/** OpenSession mark, redrawn as SVG from the brand logo. */
const STRIPES = [30, 41.5, 53, 64.5];
const stripe = (y: number) => `M14 ${y} H35 C45 ${y} 46 ${y + 16} 57 ${y + 16} H80`;

export default function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="OpenSession logo">
      <defs>
        <clipPath id="os-logo-circle">
          <circle cx="68" cy="45" r="27" />
        </clipPath>
      </defs>
      <rect x="2" y="2" width="96" height="96" rx="22" fill="#f2ec6a" />
      <circle cx="68" cy="45" r="27" fill="#0d1117" />
      <g fill="none" strokeLinecap="round">
        {STRIPES.map((y) => (
          <path key={y} d={stripe(y)} stroke="#0d1117" strokeWidth="5" />
        ))}
        <g clipPath="url(#os-logo-circle)">
          {STRIPES.map((y) => (
            <path key={y} d={stripe(y)} stroke="#f2ec6a" strokeWidth="5.4" />
          ))}
        </g>
      </g>
    </svg>
  );
}
