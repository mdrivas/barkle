export function PartyHat() {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className="absolute inset-0"
    >
      <path 
        d="M50 10 L30 50 L70 50 Z" 
        fill="#FF6B6B"  // Festive red color
        stroke="#FFD93D"  // Gold trim
        strokeWidth="2"
      />
      <circle 
        cx="50" 
        cy="15" 
        r="4" 
        fill="#FFD93D"  // Gold pom-pom
      />
    </svg>
  );
} 