import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionWrapper } from "../ui/SectionWrapper";
import { GradientText } from "../ui/GradientText";
import { GlassCard } from "../ui/GlassCard";

const MOCK_RESULTS = [
  { title: "Senior React dev needed for SaaS project", source: "Reddit", score: 94 },
  { title: "Looking for React consultant — urgent", source: "LinkedIn", score: 91 },
  { title: "Need freelance React developer for MVP", source: "Google", score: 88 },
];

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
      <div className="mb-12 text-center">
        <h2 className="mb-4 font-display text-4xl font-bold md:text-5xl">
          Try <GradientText>AI Search</GradientText>
        </h2>
        <p className="mx-auto max-w-lg text-lg text-content-secondary">
          See how LeadsGrid finds leads in seconds
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-2xl"
      >
        {/* Search input */}
        <div className="mb-8 flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && startSearch()}
            placeholder="Find leads for: React Developer"
            className="glass-input flex-1 !rounded-xl !px-5 !py-4 text-base"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startSearch}
            disabled={isSearching || !query.trim()}
            className="rounded-xl bg-gradient-to-r from-accent to-accent-secondary px-6 py-4 text-sm font-semibold text-content-inverse shadow-[0_0_30px_rgba(167,139,250,0.3)] transition-opacity disabled:opacity-50"
          >
            Search
          </motion.button>
        </div>

        {/* AI thinking */}
        {isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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

        {/* Results */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              {MOCK_RESULTS.map((result, idx) => (
                <motion.div
                  key={result.title}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.15 }}
                >
                  <GlassCard className="flex items-center justify-between !p-4">
                    <div>
                      <p className="text-sm font-medium text-content">{result.title}</p>
                      <p className="text-xs  ">{result.source}</p>
                    </div>
                    <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
                      {result.score}
                    </span>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </SectionWrapper>
  );
};
