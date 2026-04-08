import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";

type RouteErrorPageProps = {
  title?: string;
};

export const RouteErrorPage = ({ title = "Navigation Error" }: RouteErrorPageProps) => {
  const error = useRouteError();

  const detail = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Something went wrong while opening this page.";

  return (
    <div className="min-h-screen bg-surface px-4 py-8 text-content">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 rounded-2xl border border-danger/25 bg-danger-soft/40 p-6 backdrop-blur-glass">
        <p className="text-xs uppercase tracking-[0.2em] text-danger">Route Error</p>
        <h1 className="text-3xl font-semibold text-content">{title}</h1>
        <p className="text-sm text-content-secondary">{detail}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Link to="/dashboard" className="accent-btn px-4 py-2 text-xs uppercase tracking-[0.1em]">
            Go to dashboard
          </Link>
          <Link to="/" className="glass-btn px-4 py-2 text-xs uppercase tracking-[0.1em]">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
};