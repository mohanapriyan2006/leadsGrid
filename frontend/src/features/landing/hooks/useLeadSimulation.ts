import { useState, useEffect, useCallback } from "react";
import type { SimulatedLead } from "../types/landing";

const LEAD_POOL: Omit<SimulatedLead, "id" | "timestamp">[] = [
  { title: "Looking for React developer ASAP", source: "Reddit", score: 92 },
  { title: "Need a SaaS marketing agency", source: "LinkedIn", score: 87 },
  { title: "Hiring full-stack dev for fintech startup", source: "Google", score: 95 },
  { title: "Want someone to build my MVP", source: "Reddit", score: 89 },
  { title: "Looking for AI/ML consultant", source: "LinkedIn", score: 91 },
  { title: "Need e-commerce website redesign", source: "Google", score: 78 },
  { title: "Searching for DevOps engineer", source: "LinkedIn", score: 85 },
  { title: "Need a landing page built today", source: "Reddit", score: 93 },
  { title: "Looking for mobile app developer", source: "Google", score: 88 },
  { title: "Hiring data engineer for remote role", source: "LinkedIn", score: 82 },
];

export const useLeadSimulation = (intervalMs = 3000, maxVisible = 4) => {
  const [leads, setLeads] = useState<SimulatedLead[]>([]);
  const [counter, setCounter] = useState(0);

  const generateLead = useCallback((): SimulatedLead => {
    const template = LEAD_POOL[Math.floor(Math.random() * LEAD_POOL.length)];
    return {
      ...template,
      id: Date.now() + Math.random(),
      timestamp: "Just now",
    };
  }, []);

  useEffect(() => {
    const initialLeads = Array.from({ length: 2 }, () => generateLead());
    setLeads(initialLeads);
    setCounter(initialLeads.length);

    const interval = setInterval(() => {
      setLeads((prev) => {
        const newLead = generateLead();
        const updated = [newLead, ...prev];
        return updated.slice(0, maxVisible);
      });
      setCounter((prev) => prev + 1);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs, maxVisible, generateLead]);

  return { leads, totalDiscovered: counter };
};
