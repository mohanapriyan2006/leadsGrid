import type { PropsWithChildren } from "react";

import { PageBackground } from "./PageBackground";

type ResponsivePageLayoutProps = PropsWithChildren<{
  backgroundImage?: string;
  tint?: string;
  opacity?: number;
  contentClassName?: string;
}>;

export const ResponsivePageLayout = ({
  backgroundImage,
  tint = "rgba(167, 139, 250, 0.55)",
  opacity = 0.82,
  contentClassName = "",
  children,
}: ResponsivePageLayoutProps) => {
  return (
    <section className="page-with-bg">
      {backgroundImage ? <PageBackground image={backgroundImage} tint={tint} opacity={opacity} /> : null}
      <div className={`page-scroll-container ${contentClassName}`.trim()}>{children}</div>
    </section>
  );
};