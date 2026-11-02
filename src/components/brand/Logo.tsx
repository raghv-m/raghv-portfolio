/**
 * The site mark: a case-file folder with RM initials and the red YEG tag.
 * Single source of truth for the logo on the web. The folder and initials use
 * currentColor, so the mark follows the theme (ink on paper, cream on
 * charcoal); the tag stays brand red. The same artwork lives in
 * public/logo.svg (favicon, manifest, OG image, email PNGs derive from it).
 * To change the logo site-wide, replace this artwork and public/logo.svg.
 */
export function Logo({
  size = 28,
  className = "",
  style,
}: {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 150 150"
      role="img"
      aria-label="Raghav Mahajan, case file logo"
      className={className}
      style={style}
    >
      <path
        d="M14 42 L58 42 L70 58 L136 58 L136 128 L14 128 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinejoin="round"
      />
      <text
        x="34"
        y="112"
        fontFamily="var(--font-jetbrains), 'JetBrains Mono', ui-monospace, monospace"
        fontWeight="700"
        fontSize="40"
        fill="currentColor"
      >
        RM
      </text>
      <g transform="rotate(3 115 30)">
        <rect x="92" y="20" width="46" height="20" fill="#2C3480" />
        <text
          x="115"
          y="35"
          textAnchor="middle"
          fontFamily="var(--font-jetbrains), 'JetBrains Mono', ui-monospace, monospace"
          fontWeight="700"
          fontSize="13"
          fill="#ffffff"
        >
          YEG
        </text>
      </g>
    </svg>
  );
}
