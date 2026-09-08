type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function HomeIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3.5 10.2 12 3.6l8.5 6.6" />
      <path d="M5.6 9v10.4h12.8V9" />
      <path d="M9.8 19.4v-5.2h4.4v5.2" />
    </svg>
  );
}

export function UserIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="8.2" r="3.6" />
      <path d="M4.8 19.6a7.2 7.2 0 0 1 14.4 0" />
    </svg>
  );
}

export function ResultsIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4.5 19.5V11" />
      <path d="M9.8 19.5V5.2" />
      <path d="M15.1 19.5v-6" />
      <path d="M20.4 19.5V8.4" />
    </svg>
  );
}

export function IndustryIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3.6 20.4V10.6l5.2 3.2v-3.2l5.2 3.2V6.2h6.4v14.2z" />
      <path d="M3.6 20.4h16.8" />
    </svg>
  );
}

export function SparkIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3.2 13.9 9l5.8 1.9-5.8 1.9L12 18.6 10.1 12.8 4.3 10.9 10.1 9z" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4.8 12h14" />
      <path d="M13.2 6.4 18.8 12l-5.6 5.6" />
    </svg>
  );
}

export function ChevronIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M8.4 5.6 15.2 12l-6.8 6.4" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6.2 6.2 17.8 17.8" />
      <path d="M17.8 6.2 6.2 17.8" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 5.2v13.6" />
      <path d="M5.2 12h13.6" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="10.8" cy="10.8" r="6.2" />
      <path d="M15.4 15.4 19.6 19.6" />
    </svg>
  );
}

export function AlertIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 4.4 21 19.6H3z" />
      <path d="M12 10v4.2" />
      <path d="M12 17.2h.01" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 12.6 9.6 17.2 19 7.8" />
    </svg>
  );
}

export function ChatIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M20.4 14.2a2.6 2.6 0 0 1-2.6 2.6H9.2L4.8 20.2V6.2a2.6 2.6 0 0 1 2.6-2.6h10.4a2.6 2.6 0 0 1 2.6 2.6z" />
      <path d="M9 8.9h7" />
      <path d="M9 12.2h4.6" />
    </svg>
  );
}

export function ExternalLinkIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M13.4 5.2h5.4v5.4" />
      <path d="M18.8 5.2 11 13" />
      <path d="M17.6 13.9v4.3a1.4 1.4 0 0 1-1.4 1.4H5.8a1.4 1.4 0 0 1-1.4-1.4V7.8a1.4 1.4 0 0 1 1.4-1.4h4.3" />
    </svg>
  );
}

export function PinIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 21c4.2-4.6 6.3-7.9 6.3-10.4a6.3 6.3 0 0 0-12.6 0C5.7 13.1 7.8 16.4 12 21z" />
      <circle cx="12" cy="10.4" r="2.4" />
    </svg>
  );
}
