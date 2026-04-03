import { motion } from "framer-motion";

import bgDataAtWork from "../../assets/bg-images/data-at-work.svg";
import { PageBackground } from "../../components/ui/PageBackground";
import { DashboardHero } from "../../features/dashboard/components/DashboardHero";
import { DashboardHotLeadsWidget } from "../../features/dashboard/components/DashboardHotLeadsWidget";
import { DashboardKpiGrid } from "../../features/dashboard/components/DashboardKpiGrid";
import { DashboardPipelineWidget } from "../../features/dashboard/components/DashboardPipelineWidget";
import { DashboardQuickActionsWidget } from "../../features/dashboard/components/DashboardQuickActionsWidget";
import { DashboardRecentActivityWidget } from "../../features/dashboard/components/DashboardRecentActivityWidget";
import { DashboardSkeleton } from "../../features/dashboard/components/DashboardSkeleton";
import { useDashboardData } from "../../features/dashboard/hooks/useDashboardData";

const reveal = {
	hidden: { opacity: 0, y: 14 },
	show: { opacity: 1, y: 0 },
};

export const DashboardPage = () => {
	const {
		leads,
		hotLeads,
		kpis,
		stageMetrics,
		recentActivity,
		quickActions,
		loading,
		error,
		refresh,
		refreshing,
		lastUpdatedIso,
	} = useDashboardData();

	return (
		<section className="page-with-bg">
			<PageBackground image={bgDataAtWork} tint="rgba(167, 139, 250, 0.55)" opacity={0.82} />

			<div className="h-[calc(100vh-100px)] overflow-auto p-6">
				{loading ? <DashboardSkeleton /> : null}

				{!loading ? (
					<div className="space-y-4">
						{error ? (
							<div className="rounded-glass-sm border border-warning/30 bg-warning-soft p-3 text-sm text-warning">
								Showing live dashboard with fallback calculations. Detail: {error}
							</div>
						) : null}

						<motion.div initial="hidden" animate="show" variants={reveal} transition={{ duration: 0.35 }}>
							<DashboardHero
								totalLeads={leads.length}
								refreshing={refreshing}
								lastUpdatedIso={lastUpdatedIso}
								onRefresh={() => {
									void refresh();
								}}
							/>
						</motion.div>

						<motion.div
							initial="hidden"
							animate="show"
							variants={reveal}
							transition={{ duration: 0.35, delay: 0.04 }}
						>
							<DashboardKpiGrid kpis={kpis} />
						</motion.div>

						<motion.div
							className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]"
							initial="hidden"
							animate="show"
							variants={reveal}
							transition={{ duration: 0.35, delay: 0.08 }}
						>
							<DashboardHotLeadsWidget leads={hotLeads} />
							<DashboardPipelineWidget stageMetrics={stageMetrics} />
						</motion.div>

						<motion.div
							className="grid gap-4 lg:grid-cols-2"
							initial="hidden"
							animate="show"
							variants={reveal}
							transition={{ duration: 0.35, delay: 0.12 }}
						>
							<DashboardRecentActivityWidget activity={recentActivity} />
							<DashboardQuickActionsWidget actions={quickActions} />
						</motion.div>
					</div>
				) : null}
			</div>
		</section>
	);
};
