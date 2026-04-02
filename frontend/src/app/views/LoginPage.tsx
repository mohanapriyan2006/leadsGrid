import { useState } from "react";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth, googleProvider, isFirebaseConfigured } from "../../lib/firebase";
import { useNavigate } from "react-router-dom";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const auth = getFirebaseAuth();
    if (!auth) {
      setError("Firebase is not configured. Set VITE_FIREBASE_* values in frontend/.env and restart Vite.");
      return;
    }

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setError("Firebase is not configured. Set VITE_FIREBASE_* values in frontend/.env and restart Vite.");
      return;
    }

    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-secondary/15 rounded-full blur-3xl" />
      </div>

      {/* Glass Card */}
      <div className="relative w-full max-w-md glass-card p-8 animate-fadeIn">
        {/* Logo/Header */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-secondary font-black text-surface text-lg shadow-glow">
            P
          </div>
          <span className="text-xl font-bold tracking-wider text-content">PitchPilot</span>
        </div>

        <h2 className="mb-2 text-center text-2xl font-semibold text-content">
          {isRegistering ? "Create your account" : "Welcome back"}
        </h2>
        <p className="mb-6 text-center text-sm text-content-secondary">
          {isRegistering ? "Start your sales journey today" : "Sign in to access your sales engine"}
        </p>

        {!isFirebaseConfigured && (
          <div className="mb-4 rounded-glass-sm border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-warning">
            Firebase is not configured. Update VITE_FIREBASE_* in frontend/.env with your real Firebase web app config.
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-glass-sm border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-content-secondary">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-content-secondary">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full accent-btn py-2.5"
          >
            {isRegistering ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
          <span className="text-xs font-medium uppercase tracking-wider text-content-tertiary">Or continue with</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-3 rounded-glass-sm border border-accent/20 bg-surface-secondary/60 px-4 py-2.5 text-sm font-medium text-content transition-all duration-200 hover:border-accent/40 hover:bg-accent-soft"
        >
          <svg className="h-5 w-5" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
          </svg>
          Google
        </button>

        <p className="mt-6 text-center text-sm text-content-secondary">
          {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="font-medium text-accent hover:text-accent-secondary transition-colors"
          >
            {isRegistering ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
};
