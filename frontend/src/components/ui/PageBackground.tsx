type PageBackgroundProps = {
  image: string;
  tint: string;
  opacity?: number;
};

export const PageBackground = ({ image, tint, opacity = 0.4 }: PageBackgroundProps) => (
  <div className="pointer-events-none absolute inset-0 z-1 overflow-hidden" aria-hidden="true">
    {/* Colored radial glow — ambient light source */}
    <div
      className="absolute inset-0"
      style={{
        background: `radial-gradient(ellipse 80% 60% at 50% 100%, ${tint} 0%, transparent 90%)`,
      }}
    />
    {/* Soft atmospheric bloom near the illustration */}
    <div
      className="absolute bottom-0 left-1/2 h-[34vh] w-[min(84vw,760px)] -translate-x-1/2 rounded-full blur-3xl"
      style={{ background: `radial-gradient(circle, ${tint} 0%, transparent 72%)`, opacity: 0.42 }}
    />

    {/* SVG illustration at bottom center */}
    <img
      src={image}
      alt=""
      draggable={false}
      className="absolute bottom-4 left-1/2 h-auto w-[min(82%,640px)] -translate-x-1/2 translate-y-[4%] select-none"
      style={{
        opacity,
        filter: `drop-shadow(0 0 72px ${tint}) saturate(1.08) contrast(1.04)`,
      }}
    />
    {/* Top fade to surface for seamless blending */}
    <div className="absolute inset-0 bg-gradient-to-b from-surface/92 via-surface/46 to-transparent" />
  </div>
);
