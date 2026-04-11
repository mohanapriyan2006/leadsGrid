// import { useMemo, useState } from "react";

// import { ScoreBadge } from "../../components/ui/ScoreBadge";
// import { StatusBadge } from "../../components/ui/StatusBadge";
// import { MOCK_DEALS } from "../../features/crm/constants/mockDeals";
// import type { DealStatus } from "../../features/common/types/ui";

// export const CRMPage = () => {
//   const [view, setView] = useState<"table" | "kanban">("table");
//   const [deals, setDeals] = useState(MOCK_DEALS);

//   const totalValue = useMemo(
//     () => deals.filter((deal) => deal.status !== "closed").reduce((sum, deal) => sum + Number(deal.value.replace(/[$,]/g, "")), 0),
//     [deals]
//   );

//   const closedValue = useMemo(
//     () => deals.filter((deal) => deal.status === "closed").reduce((sum, deal) => sum + Number(deal.value.replace(/[$,]/g, "")), 0),
//     [deals]
//   );

//   const updateStatus = (id: string, status: DealStatus) => {
//     setDeals((current) => current.map((deal) => (deal.id === id ? { ...deal, status } : deal)));
//   };

//   return (
//     <div className="space-y-4">
//       <header>
//         <h2 className="text-3xl font-semibold text-white">Pipeline CRM</h2>
//         <p className="text-sm text-text-dim">Deal intelligence with stage-aware execution controls.</p>
//       </header>

//       <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
//         {[{ label: "ACTIVE PIPELINE", value: `$${totalValue.toLocaleString()}`, color: "#b595ff" }, { label: "CLOSED WON", value: `$${closedValue.toLocaleString()}`, color: "#10B981" }, { label: "TOTAL LEADS", value: String(deals.length), color: "#F9FAFB" }, { label: "AVG. SCORE", value: String(Math.round(deals.reduce((sum, deal) => sum + deal.score, 0) / deals.length)), color: "#F59E0B" }].map((item) => (
//           <article key={item.label} className="rounded-xl border border-white/10 bg-panel/80 p-4 shadow-aura">
//             <p className="text-[11px] tracking-[0.1em] text-text-dim">{item.label}</p>
//             <p className="mt-2 text-3xl font-semibold" style={{ color: item.color }}>{item.value}</p>
//           </article>
//         ))}
//       </div>

//       <div className="flex gap-2">
//         {(["table", "kanban"] as const).map((option) => (
//           <button
//             key={option}
//             onClick={() => setView(option)}
//             className={`rounded border px-4 py-1.5 text-xs tracking-[0.1em] ${view === option ? "border-accent/50 bg-accent/10 text-accent" : "border-white/10 text-text-dim"}`}
//           >
//             {option.toUpperCase()}
//           </button>
//         ))}
//       </div>

//       {view === "table" ? (
//         <div className="overflow-hidden rounded-xl border border-white/10 bg-panel/80">
//           <div className="grid grid-cols-[2fr_1.5fr_1fr_90px_1fr] border-b border-white/10 px-4 py-3 text-[10px] tracking-[0.1em] text-text-dim">
//             <span>CLIENT</span>
//             <span>COMPANY</span>
//             <span>STATUS</span>
//             <span>SCORE</span>
//             <span>LAST ACTION</span>
//           </div>
//           {deals.map((deal) => (
//             <div key={deal.id} className="grid grid-cols-[2fr_1.5fr_1fr_90px_1fr] items-center border-b border-white/5 px-4 py-3 last:border-b-0">
//               <span className="text-sm text-white">{deal.name}</span>
//               <span className="text-sm text-text-dim">{deal.company}</span>
//               <div className="flex items-center gap-2">
//                 <select
//                   value={deal.status}
//                   onChange={(event) => updateStatus(deal.id, event.target.value as DealStatus)}
//                   className="rounded border border-white/10 bg-black/20 px-2 py-1 text-xs text-white"
//                 >
//                   <option value="contacted">contacted</option>
//                   <option value="replied">replied</option>
//                   <option value="negotiation">negotiation</option>
//                   <option value="closed">closed</option>
//                 </select>
//                 <StatusBadge status={deal.status} />
//               </div>
//               <ScoreBadge score={deal.score} />
//               <span className="text-sm text-text-dim">{deal.lastAction}</span>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
//           {(["contacted", "replied", "negotiation", "closed"] as DealStatus[]).map((status) => (
//             <section key={status} className="rounded-xl border border-white/10 bg-panel/80 p-3">
//               <div className="mb-3 flex items-center justify-between">
//                 <h3 className="text-xs font-bold tracking-[0.1em] text-accent">{status.toUpperCase()}</h3>
//                 <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white">{deals.filter((deal) => deal.status === status).length}</span>
//               </div>
//               <div className="space-y-2">
//                 {deals
//                   .filter((deal) => deal.status === status)
//                   .map((deal) => (
//                     <article key={deal.id} className="rounded border border-white/10 bg-black/20 p-2.5">
//                       <div className="flex items-center justify-between">
//                         <p className="text-sm text-white">{deal.name}</p>
//                         <ScoreBadge score={deal.score} />
//                       </div>
//                       <p className="text-xs text-text-dim">{deal.company}</p>
//                       <p className="mt-1 text-xs text-text-dim">{deal.lastAction}</p>
//                       <p className="mt-1 text-sm font-semibold text-highlight">{deal.value}</p>
//                     </article>
//                   ))}
//               </div>
//             </section>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };
