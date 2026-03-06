"use client";

export interface ClubCrestProps {
  teamName: string;
  primaryColor: string;
  secondaryColor: string;
  /** Width in pixels. Default 120. */
  width?: number;
  /** Height in pixels. Default 140. */
  height?: number;
  className?: string;
}

export function ClubCrest({
  primaryColor,
  secondaryColor,
  width = 120,
  height = 140,
  className = "",
}: ClubCrestProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 120"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Shield base */}
      <path
        d="M10 10 L90 10 L90 60 Q90 100 50 115 Q10 100 10 60 Z"
        fill={primaryColor}
        stroke={secondaryColor}
        strokeWidth="4"
      />
      {/* Horizontal stripe */}
      <rect x="10" y="45" width="80" height="20" fill={secondaryColor} />
    </svg>
  );
}
