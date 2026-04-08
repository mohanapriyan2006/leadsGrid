import logo from "../../assets/logo.png";

type GlobalLogoLoaderProps = {
  message?: string;
  fullscreen?: boolean;
};

export const GlobalLogoLoader = ({
  message = "Preparing your workspace...",
  fullscreen = true,
}: GlobalLogoLoaderProps) => {
  return (
    <div className={fullscreen ? "logo-loader-shell" : "logo-loader-shell relative min-h-[240px] rounded-2xl"}>
      <div className="logo-loader-orb" aria-hidden="true" />
      <div className="logo-loader-card">
        <img src={logo} alt="leadsGrid" className="logo-loader-image" />
        <p className="logo-loader-text">{message}</p>
      </div>
    </div>
  );
};