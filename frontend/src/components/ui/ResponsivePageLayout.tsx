import type { PropsWithChildren } from "react";

type ResponsivePageLayoutProps = PropsWithChildren<{
  backgroundImage?: string;
  tint?: string;
  opacity?: number;
  contentClassName?: string;
}>;

export const ResponsivePageLayout = ({
  contentClassName = "",
  children,
}: ResponsivePageLayoutProps) => {
  return (
    <section className="page-with-bg h-screen overflow-auto">
      <div className={`page-scroll-container ${contentClassName}`.trim()}>{children}</div>
    </section>
  );
};