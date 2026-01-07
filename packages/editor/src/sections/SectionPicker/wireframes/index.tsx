interface WireframeProps {
  className?: string
}

export function CenteredWireframe({ className }: WireframeProps) {
  return (
    <svg className={className} viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="12" width="48" height="36" rx="3" />
    </svg>
  );
}

export function SplitWireframe({ className }: WireframeProps) {
  return (
    <svg className={className} viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="8" width="32" height="44" rx="3" />
      <rect x="42" y="8" width="32" height="44" rx="3" />
    </svg>
  );
}

export function GridWireframe({ className }: WireframeProps) {
  return (
    <svg className={className} viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="28" height="20" rx="3" />
      <rect x="44" y="8" width="28" height="20" rx="3" />
      <rect x="8" y="32" width="28" height="20" rx="3" />
      <rect x="44" y="32" width="28" height="20" rx="3" />
    </svg>
  );
}

export function CardsWireframe({ className }: WireframeProps) {
  return (
    <svg className={className} viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="8" width="20" height="44" rx="3" />
      <line x1="6" y1="48" x2="26" y2="48" strokeWidth="2" opacity="0.3" />
      <rect x="30" y="8" width="20" height="44" rx="3" />
      <line x1="30" y1="48" x2="50" y2="48" strokeWidth="2" opacity="0.3" />
      <rect x="54" y="8" width="20" height="44" rx="3" />
      <line x1="54" y1="48" x2="74" y2="48" strokeWidth="2" opacity="0.3" />
    </svg>
  );
}

export function CarouselWireframe({ className }: WireframeProps) {
  return (
    <svg className={className} viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="28" height="38" rx="3" opacity="0.3" />
      <rect x="26" y="8" width="28" height="38" rx="3" />
      <rect x="48" y="8" width="28" height="38" rx="3" opacity="0.3" />
      <circle cx="32" cy="52" r="2" fill="currentColor" />
      <circle cx="40" cy="52" r="2" fill="currentColor" opacity="0.3" />
      <circle cx="48" cy="52" r="2" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

export function MasonryWireframe({ className }: WireframeProps) {
  return (
    <svg className={className} viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="20" height="24" rx="3" />
      <rect x="30" y="6" width="20" height="32" rx="3" />
      <rect x="54" y="6" width="20" height="28" rx="3" />
      <rect x="6" y="34" width="20" height="20" rx="3" />
      <rect x="30" y="42" width="20" height="12" rx="3" />
      <rect x="54" y="38" width="20" height="16" rx="3" />
    </svg>
  );
}

export function AlternatingWireframe({ className }: WireframeProps) {
  return (
    <svg className={className} viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="8" width="26" height="18" rx="3" />
      <line x1="38" y1="12" x2="74" y2="12" strokeWidth="1" opacity="0.5" />
      <line x1="38" y1="18" x2="68" y2="18" strokeWidth="1" opacity="0.5" />
      <line x1="6" y1="38" x2="42" y2="38" strokeWidth="1" opacity="0.5" />
      <line x1="6" y1="44" x2="36" y2="44" strokeWidth="1" opacity="0.5" />
      <rect x="48" y="34" width="26" height="18" rx="3" />
    </svg>
  );
}

export function AccordionWireframe({ className }: WireframeProps) {
  return (
    <svg className={className} viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="10" width="64" height="10" rx="2" />
      <path d="M66 13 L68 15 L70 13" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="8" y="25" width="64" height="10" rx="2" />
      <path d="M66 28 L68 30 L70 28" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="8" y="40" width="64" height="10" rx="2" />
      <path d="M66 43 L68 45 L70 43" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BannerWireframe({ className }: WireframeProps) {
  return (
    <svg className={className} viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="22" width="72" height="16" rx="3" />
    </svg>
  );
}

export function OverlayWireframe({ className }: WireframeProps) {
  return (
    <svg className={className} viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="72" height="52" rx="3" opacity="0.3" />
      <rect x="20" y="16" width="40" height="28" rx="3" fill="white" fillOpacity="0.1" />
    </svg>
  );
}

export function ListWireframe({ className }: WireframeProps) {
  return (
    <svg className={className} viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="64" height="9" rx="2" />
      <rect x="8" y="21" width="64" height="9" rx="2" />
      <rect x="8" y="34" width="64" height="9" rx="2" />
      <rect x="8" y="47" width="64" height="9" rx="2" />
    </svg>
  );
}

export function TableWireframe({ className }: WireframeProps) {
  return (
    <svg className={className} viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="64" height="10" rx="2" strokeWidth="2" />
      <line x1="32" y1="8" x2="32" y2="52" strokeWidth="1" opacity="0.3" />
      <line x1="56" y1="8" x2="56" y2="52" strokeWidth="1" opacity="0.3" />
      <rect x="8" y="22" width="64" height="10" rx="2" />
      <rect x="8" y="36" width="64" height="10" rx="2" />
    </svg>
  );
}
