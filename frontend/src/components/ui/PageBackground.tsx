type PageBackgroundProps = {
  image: string;
  tint: string;
  opacity?: number;
};

export const PageBackground = ({ image, tint, opacity = 0.9 }: PageBackgroundProps) => (
  <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
    {/* Colored radial glow — ambient light source */}
    <div
      className="absolute inset-0"
      style={{
        background: `radial-gradient(ellipse 80% 60% at 50% 100%, ${tint} 0%, transparent 90%)`,
      }}
    />
    {/* SVG illustration at bottom center */}
    <img
      src={image}
      alt=""
      draggable={false}
      className="absolute bottom-10 left-1/2 h-auto w-[min(75%,520px)] -translate-x-1/2 translate-y-[8%] select-none"
      style={{ opacity, filter: `drop-shadow(0 0 60px ${tint})` }}
    />
    {/* Top fade to surface for seamless blending */}
    <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface/70 to-transparent" />
  </div>
);
