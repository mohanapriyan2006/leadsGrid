import type { ReactNode } from "react";
import { useMouseSpotlight } from "../../hooks/useMouseSpotlight";

type Props = {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  glowSize?: number;
  borderGlow?: boolean;
  borderGlowWidth?: number;
};

export const MouseSpotlight = ({
  children,
  className = "",
  glowColor = "rgba(167, 139, 250, 0.15)",
  glowSize = 400,
  borderGlow = true,
  borderGlowWidth = 120,
}: Props) => {
  const { ref, coords, isHovered, handlers } = useMouseSpotlight();

  return (
    <div
      ref={ref}
      {...handlers}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Inner spotlight overlay */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 z-0 mix-blend-screen transition-opacity duration-300"
          style={{
            background: `radial-gradient(${glowSize}px circle at ${coords.x}px ${coords.y}px, ${glowColor}, transparent 80%)`,
          }}
        />
      )}

      {/* Border glow tracing */}
      {borderGlow && isHovered && (
        <div
          className="pointer-events-none absolute inset-[-1px] z-10 rounded-inherit"
          style={{
            background: `radial-gradient(${borderGlowWidth}px circle at ${coords.x}px ${coords.y}px, rgba(167,139,250,0.4), transparent 60%)`,
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            padding: "1px",
            borderRadius: "inherit",
          }}
        />
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
};
