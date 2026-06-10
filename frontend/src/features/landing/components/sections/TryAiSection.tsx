import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionWrapper } from "../ui/SectionWrapper";
import { GradientText } from "../ui/GradientText";

const MOCK_RESULTS = [
  { title: "Senior React dev needed for SaaS project", source: "Reddit", score: 94, dot: "bg-orange-400" },
  { title: "Looking for React consultant — urgent", source: "LinkedIn", score: 91, dot: "bg-blue-400" },
  { title: "Need freelance React developer for MVP", source: "Google", score: 88, dot: "bg-green-400" },
];

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

function ResultCard({ result, idx }: { result: typeof MOCK_RESULTS[0]; idx: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 30, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 18, delay: idx * 0.1 }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative overflow-hidden rounded-glass border border-accent/10 bg-surface-secondary/60 p-4 flex items-center justify-between shadow-glass backdrop-blur-xl transition-transform duration-300 hover:scale-[1.01]"
      >
        {/* Inner spotlight */}
        {isHovered && (
          <div
            className="pointer-events-none absolute inset-0 z-0 mix-blend-screen"
            style={{
              background: `radial-gradient(300px circle at ${coords.x}px ${coords.y}px, rgba(167,139,250,0.1), transparent 80%)`,
            }}
          />
        )}

        <div className="relative z-10 flex items-center gap-3 min-w-0">
          <span className={`h-2 w-2 shrink-0 rounded-full ${result.dot}`} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-content truncate">{result.title}</p>
            <p className="text-xs text-content-secondary">{result.source}</p>
          </div>
        </div>
        <span className="relative z-10 ml-3 shrink-0 rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
          {result.score}
        </span>
      </div>
    </motion.div>
  );
}

export const TryAiSection = () => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [typedText, setTypedText] = useState("");

  const startSearch = useCallback(() => {
    if (!query.trim()) return;
    setIsSearching(true);
    setShowResults(false);
    setTypedText("");

    const fullText = `Scanning sources for "${query}"...`;
    let charIndex = 0;

    const typingInterval = setInterval(() => {
      charIndex++;
      setTypedText(fullText.slice(0, charIndex));
      if (charIndex >= fullText.length) {
        clearInterval(typingInterval);
        setTimeout(() => {
          setIsSearching(false);
          setShowResults(true);
        }, 600);
      }
    }, 40);

    return () => clearInterval(typingInterval);
  }, [query]);

  useEffect(() => {
    setShowResults(false);
    setIsSearching(false);
  }, [query]);

  return (
    <SectionWrapper id="try-ai">
      {/* Floating particles around search */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-accent/15"
            style={{
              width: 4 + i,
              height: 4 + i,
              left: `${20 + i * 20}%`,
              top: `${30 + (i % 2) * 30}%`,
            }}
            animate={{ y: [0, -15, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
          />
        ))}
      </div>

      <div className="mb-12 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...spring }}
          className="mb-4 font-display text-4xl font-bold md:text-5xl"
        >
          Try <GradientText>AI Search</GradientText>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...spring, delay: 0.1 }}
          className="mx-auto max-w-lg text-lg text-content-secondary"
        >
          See how LeadsGrid finds leads in seconds
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ ...spring, delay: 0.2 }}
        className="relative mx-auto max-w-2xl"
      >
        {/* Search input */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && startSearch()}
            placeholder="Find leads for: React Developer"
            className="glass-input flex-1 !rounded-xl !px-5 !py-4 text-base"
          />
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(167,139,250,0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={startSearch}
            disabled={isSearching || !query.trim()}
            className="rounded-xl bg-gradient-to-r from-accent to-accent-secondary px-6 py-4 text-sm font-semibold text-content-inverse shadow-[0_0_30px_rgba(167,139,250,0.3)] transition-opacity disabled:opacity-50"
          >
            Search
          </motion.button>
        </div>

        {/* AI thinking */}
        <AnimatePresence>
          {isSearching && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={spring}
              className="mb-6 flex items-center gap-3 text-sm text-accent"
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block h-4 w-4 rounded-full border-2 border-accent border-t-transparent"
              />
              {typedText}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={spring}
              className="space-y-3"
            >
              {MOCK_RESULTS.map((result, idx) => (
                <ResultCard key={result.title} result={result} idx={idx} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </SectionWrapper>
  );
};
