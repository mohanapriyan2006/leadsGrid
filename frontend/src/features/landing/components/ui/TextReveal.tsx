import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const TextReveal = ({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
  stagger = 0.08,
  y = 40,
}: {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "p" | "div" | "span";
  className?: string;
  delay?: number;
  stagger?: number;
  y?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!ref.current) return;
    const words = ref.current.querySelectorAll(".word");
    if (!words.length) return;

    gsap.fromTo(
      words,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );
  }, { scope: ref });

  const text = typeof children === "string" ? children : "";
  const words = text.split(" ").map((word, i) => (
    <span key={i} className="word inline-block mr-[0.25em] overflow-hidden">
      <span className="inline-block">{word}</span>
    </span>
  ));

  return (
    <Tag ref={ref as any} className={className}>
      {typeof children === "string" ? words : children}
    </Tag>
  );
};
