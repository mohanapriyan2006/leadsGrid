import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const CounterStat = ({
  target,
  suffix = "",
  prefix = "",
  duration = 2,
  className = "",
  label,
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
  label?: string;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useGSAP(() => {
    if (!ref.current || hasAnimated.current) return;
    const obj = { val: 0 };
    ScrollTrigger.create({
      trigger: ref.current,
      start: "top 90%",
      once: true,
      onEnter: () => {
        hasAnimated.current = true;
        gsap.to(obj, {
          val: target,
          duration,
          ease: "power2.out",
          onUpdate: () => {
            if (ref.current) {
              ref.current.textContent =
                prefix + Math.round(obj.val).toLocaleString() + suffix;
            }
          },
        });
      },
    });
  }, { scope: ref });

  return (
    <div className="text-center">
      <span ref={ref} className={`block ${className}`}>
        {prefix}0{suffix}
      </span>
      {label ? (
        <span className="mt-1 block text-[10px] uppercase tracking-[0.16em] text-content-secondary">
          {label}
        </span>
      ) : null}
    </div>
  );
};
