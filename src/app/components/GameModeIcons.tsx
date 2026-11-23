// Custom Barkle icon set for the game mode picker.
// Drawn in the logo's style: thick, rounded cream line art (set via `currentColor`).

type IconProps = { className?: string };

const base = {
  viewBox: "0 0 32 32",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/** Today's Barkle — floppy-eared pup face. */
export function DogFaceIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M10 13c0-4 2.7-6 6-6s6 2 6 6v5c0 4-2.7 7-6 7s-6-3-6-7z" />
      <path d="M10.5 10C7 8.5 4.5 10 5 14c.3 2.5 2 4 4.5 3.5" />
      <path d="M21.5 10c3.5-1.5 6 0 5.5 4-.3 2.5-2 4-4.5 3.5" />
      <circle cx="13.6" cy="14.2" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="18.4" cy="14.2" r="1.1" fill="currentColor" stroke="none" />
      <ellipse cx="16" cy="18.6" rx="1.9" ry="1.35" fill="currentColor" stroke="none" />
      <path d="M16 20v1.4M14.2 22.2c1 .8 2.6.8 3.6 0" />
    </svg>
  );
}

/** Pup Posts — speech bubble with a paw print. */
export function PawBubbleIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M9 5.5h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-8l-5 4.5v-4.5H9a3 3 0 0 1-3-3v-10a3 3 0 0 1 3-3z" />
      <ellipse cx="16" cy="15.8" rx="2.9" ry="2.2" fill="currentColor" stroke="none" />
      <circle cx="12.6" cy="12.6" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="14.8" cy="10.6" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="17.2" cy="10.6" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="19.4" cy="12.6" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Pawsistence — a bone (keep going!). */
export function BoneIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <g transform="rotate(-35 16 16)">
        <path d="M10.5 13.6h11a3 3 0 1 1 2.9 2.4 3 3 0 1 1-2.9 2.4h-11a3 3 0 1 1-2.9-2.4 3 3 0 1 1 2.9-2.4z" />
      </g>
    </svg>
  );
}

/** Pawpulation — a big paw and a small paw (higher or lower?). */
export function PawPairIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <g fill="currentColor" stroke="none">
        <ellipse cx="11.5" cy="22" rx="4" ry="3.1" />
        <circle cx="6.8" cy="17.6" r="1.7" />
        <circle cx="9.8" cy="14.9" r="1.7" />
        <circle cx="13.2" cy="14.9" r="1.7" />
        <circle cx="16.2" cy="17.6" r="1.7" />
        <ellipse cx="23" cy="11.6" rx="2.6" ry="2" />
        <circle cx="19.9" cy="8.8" r="1.1" />
        <circle cx="21.9" cy="7" r="1.1" />
        <circle cx="24.1" cy="7" r="1.1" />
        <circle cx="26.1" cy="8.8" r="1.1" />
      </g>
    </svg>
  );
}
