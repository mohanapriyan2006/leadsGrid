import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export const GradientText = ({ children, className = "" }: Props) => {
  return (
    <span
      className={`bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent ${className}`}
    >
      {children}
    </span>
  );
};
