import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

type FullscreenToggleButtonProps = {
  className?: string;
};

const EnterFullscreenIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
    <path d="M7 3H3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13 3h4v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 13v4h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 13v4h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ExitFullscreenIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
    <path d="M7 8H3V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13 8h4V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 17v-5h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 17v-5h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const FullscreenToggleButton = ({ className = "" }: FullscreenToggleButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isFullscreen = searchParams.get("focus") === "1";

  const toggleFullscreen = async () => {
    const nextParams = new URLSearchParams(searchParams);

    if (isFullscreen) {
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch (error) {
          console.error("Failed to exit browser fullscreen", error);
        }
      }
      nextParams.delete("focus");
    } else {
      if (!document.fullscreenElement) {
        try {
          await document.documentElement.requestFullscreen();
        } catch (error) {
          console.error("Failed to enter browser fullscreen", error);
        }
      }
      nextParams.set("focus", "1");
    }

    navigate(
      {
        pathname: location.pathname,
        search: nextParams.toString() ? `?${nextParams.toString()}` : "",
      },
      { replace: true },
    );
  };

  return (
    <button
      type="button"
      onClick={() => {
        void toggleFullscreen();
      }}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-accent/[0.1] bg-surface-secondary/40 text-content-secondary transition-all hover:border-accent/30 hover:bg-surface-secondary/70 hover:text-content ${className}`}
      title={isFullscreen ? "Exit page focus" : "Focus this page"}
      aria-label={isFullscreen ? "Exit page focus" : "Focus this page"}
    >
      {isFullscreen ? <ExitFullscreenIcon /> : <EnterFullscreenIcon />}
    </button>
  );
};
