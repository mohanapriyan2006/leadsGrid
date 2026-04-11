import bgImage from "../../assets/bg-images/data-at-work.svg";
import logo from "../../assets/logo.png";
import { PageBackground } from "./PageBackground";

type GlobalLogoLoaderProps = {
  message?: string;
  fullscreen?: boolean;
  backgroundImage?: string;
  tint?: string;
  opacity?: number;
};

export const GlobalLogoLoader = ({
  message = "Preparing your workspace...",
  fullscreen = true,
  backgroundImage = bgImage,
  tint = "rgba(167, 139, 250, 0.52)",
  opacity = 0.35,
}: GlobalLogoLoaderProps) => {
  return (
    <div className={fullscreen ? "logo-loader-shell" : "logo-loader-shell min-h-[240px] rounded-2xl"}>
      <PageBackground image={backgroundImage} tint={tint} opacity={opacity} />
      <div className="logo-loader-orb" aria-hidden="true" />
      <div className="logo-loader-card">
        <img src={logo} alt="leadsGrid" className="logo-loader-image" />
        <p className="logo-loader-text">{message}</p>
      </div>
    </div>
  );
};