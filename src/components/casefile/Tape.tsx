/**
 * One strip of tape with torn edges (jagged clip-path, never a clean
 * rectangle). Used once per exhibit, off-centre, at whatever angle and size
 * the caller passes. Always vary them: no two exhibits get the same strip.
 */
export function Tape({
  width = 110,
  height = 28,
  top = -14,
  left,
  right,
  rotate = -6,
  opacity = 0.82,
}: {
  width?: number;
  height?: number;
  top?: number;
  left?: number;
  right?: number;
  rotate?: number;
  opacity?: number;
}) {
  return (
    <span
      aria-hidden="true"
      className="cf-tape"
      style={{
        width,
        height,
        top,
        left,
        right,
        transform: `rotate(${rotate}deg)`,
        opacity,
      }}
    />
  );
}
