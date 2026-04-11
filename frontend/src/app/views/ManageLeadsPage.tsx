import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
} from "@dnd-kit/core";
import { useNavigate } from "react-router-dom";
import { CSS } from "@dnd-kit/utilities";

import { ConfirmDialog } from "../../features/leads/components/ConfirmDialog";
import { EditLeadModal } from "../../features/leads/components/EditLeadModal";
import { ManageLeadsAddRowForm } from "../../features/leads/components/ManageLeadsAddRowForm";
import { LeadModal } from "../../features/leads/components/LeadModal";
import { ManageLeadsCsvMappingPanel } from "../../features/leads/components/ManageLeadsCsvMappingPanel";
import { ManageLeadsHeader } from "../../features/leads/components/ManageLeadsHeader";
import { ManageLeadsStageColumn } from "../../features/leads/components/ManageLeadsStageColumn";
import { ManageLeadsTableView } from "../../features/leads/components/ManageLeadsTableView";
import {
  BOARD_STAGES,
  NEXT_STAGE,
  guessMapping,
} from "../../features/leads/constants/manageLeads";
import { leadService } from "../../features/leads/services/leadService";
import { useCentralizedLeads } from "../../features/leads/hooks/useCentralizedLeads";
import type {
  CSVImportResult,
  ManageLead,
  ManageLeadActionType,
  ManageLeadInsights,
  ManageLeadStage,
} from "../../features/leads/types/manageLead";
import { usePipelineViewPreferences } from "../../features/settings/hooks/usePipelineViewPreferences";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useLeadStore } from "../../store/useLeadStore";
import { FullscreenToggleButton } from "../../components/ui/FullscreenToggleButton";
import { PageBackground } from "../../components/ui/PageBackground";
import { ResponsivePageLayout } from "../../components/ui/ResponsivePageLayout";
import bgTeamCollab from "../../assets/bg-images/team-collaboration.svg";
import { LeadsAnalysisPage } from "./LeadsAnalysisPage";

type PendingLeadUpdate = {
  leadId: string;
  payload: {
    name: string;
    company: string;
    email: string;
    phone: string;
    stage: ManageLeadStage;
    budget_estimate: number;
    notes: string;
    category: string | null;
    rating: number | null;
    review_count: number | null;
    address: string | null;
    website_url: string | null;
    google_maps_url: string | null;
  };
};

export const ManageLeadsPage = () => {
  const navigate = useNavigate();
  const {
    selectedManageLeadId,
    manageLeadView,
    setSelectedManageLeadId,
    setManageLeadView,
  } = useLeadStore();
  const { manageStageLabelMap, preferredExportFields } = usePipelineViewPreferences();

  // Use centralized leads hook for real-time data
  const { leads: manageLeads, loading, error: hookError } = useCentralizedLeads();

  const [search, setSearch] = useState("");
  const [onlyHot, setOnlyHot] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [insights, setInsights] = useState<ManageLeadInsights | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [showAddRow, setShowAddRow] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvMapping, setCsvMapping] = useState<Record<string, string>>({});
  const [csvResult, setCsvResult] = useState<CSVImportResult | null>(null);

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [modalPosition, setModalPosition] = useState<{ x: number; y: number } | null>(null);
  const [isModalHover, setIsModalHover] = useState(false);
  const isModalHoverRef = useRef(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [disableDetailsPopup, setDisableDetailsPopup] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [pendingLeadUpdate, setPendingLeadUpdate] = useState<PendingLeadUpdate | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmBulkDeleteOpen, setConfirmBulkDeleteOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [newLead, setNewLead] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    stage: "NEW" as ManageLeadStage,
    budget_estimate: 0,
  });

  const [activeDragLead, setActiveDragLead] = useState<ManageLead | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const debouncedSearch = useDebouncedValue(search, 300);

  const loadInsights = async () => {
    try {
      const insightsPayload = await leadService.getManageLeadInsights();
      setInsights(insightsPayload);
    } catch (err) {
      console.error("Failed to load insights:", err);
    }
  };

  // Load insights on mount and when leads change
  useEffect(() => {
    if (!loading && manageLeads.length > 0) {
      void loadInsights();
    }
  }, [loading, manageLeads.length]);

  // Set error from hook
  useEffect(() => {
    if (hookError) {
      setError("Unable to load manage leads right now.");
      setErrorDetails(hookError.message);
    }
  }, [hookError]);

  // Auto-select first lead if none selected
  useEffect(() => {
    if (!selectedManageLeadId && manageLeads.length > 0) {
      setSelectedManageLeadId(manageLeads[0].id);
    }
  }, [manageLeads, selectedManageLeadId, setSelectedManageLeadId]);

  useEffect(() => {
    setHoveredId(null);
    setIsModalHover(false);
    setDetailsOpen(false);
    setEditOpen(false);
  }, [manageLeadView]);

  const filteredLeads = useMemo(() => {
    let filtered = manageLeads;

    // Apply search filter
    const q = debouncedSearch.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((lead) => {
        return (
          lead.name.toLowerCase().includes(q) ||
          lead.company.toLowerCase().includes(q) ||
          lead.email?.toLowerCase().includes(q) ||
          lead.phone?.toLowerCase().includes(q)
        );
      });
    }

    // Apply hot filter
    if (onlyHot) {
      filtered = filtered.filter(lead => lead.score >= 80);
    }

    return filtered;
  }, [manageLeads, debouncedSearch, onlyHot]);

  useEffect(() => {
    setSelectedLeadIds((prev) => prev.filter((id) => filteredLeads.some((lead) => lead.id === id)));
  }, [filteredLeads]);

  const grouped = useMemo(
    () =>
      BOARD_STAGES.map((stage) => ({
        ...stage,
        label:
          (manageStageLabelMap as Partial<Record<ManageLeadStage, string>>)[stage.id] ??
          stage.label,
        leads: filteredLeads.filter((lead) => lead.stage === stage.id),
      })),
    [filteredLeads, manageStageLabelMap],
  );

  const activeLead = useMemo(() => {
    if (hoveredId) {
      const hoveredLead = filteredLeads.find((lead) => lead.id === hoveredId);
      if (hoveredLead) return hoveredLead;
    }
    if (selectedManageLeadId) {
      return filteredLeads.find((lead) => lead.id === selectedManageLeadId) ?? null;
    }
    return null;
  }, [hoveredId, filteredLeads, selectedManageLeadId]);

  const createLeadRow = async () => {
    if (!newLead.name.trim() || !newLead.company.trim()) return;
    await leadService.createManageLead(newLead);
    setNewLead({ name: "", company: "", email: "", phone: "", stage: "NEW", budget_estimate: 0 });
    setShowAddRow(false);
    await loadInsights();
  };

  const handleFilePick = async (file: File) => {
    setCsvFile(file);
    const text = await file.text();
    const [headerLine = ""] = text.split(/\r?\n/);
    const headers = headerLine.split(",").map((item) => item.trim()).filter(Boolean);
    setCsvHeaders(headers);
    const initial: Record<string, string> = {};
    headers.forEach((header) => {
      initial[header] = guessMapping(header);
    });
    setCsvMapping(initial);
  };

  const importCsv = async () => {
    if (!csvFile) return;
    const result = await leadService.importManageLeadCSV(csvFile, csvMapping);
    setCsvResult(result);
    await loadInsights();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setIsDragging(false);
    setActiveDragLead(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const source = filteredLeads.find((lead) => lead.id === activeId);
    if (!source) return;

    const overId = String(over.id);

    // Check if dropped directly on a stage column
    let targetStage = BOARD_STAGES.find((stage) => stage.id === overId)?.id;

    // If not dropped on a stage, check if dropped on another lead in a different stage
    if (!targetStage) {
      const targetLead = filteredLeads.find((lead) => lead.id === overId);
      if (targetLead && targetLead.stage !== source.stage) {
        targetStage = targetLead.stage;
      }
    }

    if (!targetStage || source.stage === targetStage) return;

    await leadService.updateManageLead(source.id, { stage: targetStage });
    await loadInsights();
  };

  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
    const leadId = String(event.active.id);
    const lead = filteredLeads.find((l) => l.id === leadId);
    if (lead) setActiveDragLead(lead);
  };

  const runAction = async (leadId: string, actionType: ManageLeadActionType, targetStage?: ManageLeadStage) => {
    await leadService.manageLeadAction(leadId, { action_type: actionType, target_stage: targetStage });
    await loadInsights();
  };

  const moveNext = async (lead: ManageLead) => {
    const nextStage = NEXT_STAGE[lead.stage];
    if (!nextStage) return;
    await leadService.updateManageLead(lead.id, { stage: nextStage });
    await loadInsights();
    setFeedback(`Moved ${lead.name} to ${nextStage}`);
  };

  const openDetails = (leadId: string) => {
    setSelectedManageLeadId(leadId);
    setDetailsOpen(true);
  };

  const openEdit = (leadId: string) => {
    setSelectedManageLeadId(leadId);
    setEditOpen(true);
  };

  const handleHoverStart = (leadId: string, event: React.MouseEvent) => {
    if (disableDetailsPopup) return; // Don't show popup if disabled
    setHoveredId(leadId);
    setSelectedManageLeadId(leadId);
    setModalPosition({ x: event.clientX, y: event.clientY });
  };

  const handleHoverEnd = (leadId: string) => {
    window.setTimeout(() => {
      if (!isModalHoverRef.current) {
        setHoveredId((current) => (current === leadId ? null : current));
      }
    }, 120);
  };

  const moveToNEGOTIATION = async (lead: ManageLead) => {
    await leadService.updateManageLead(lead.id, { stage: "NEGOTIATION" });
    await loadInsights();
    setFeedback(`Moved ${lead.name} to NEGOTIATION and sent to CRM`);
    navigate("/crm", { state: { lead } });
  };

  const toggleSelectLead = (leadId: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId],
    );
  };

  const toggleSelectAllLeads = () => {
    setSelectedLeadIds((prev) => {
      const allSelected =
        filteredLeads.length > 0 && filteredLeads.every((lead) => prev.includes(lead.id));
      if (allSelected) return [];
      return filteredLeads.map((lead) => lead.id);
    });
  };

  const handleBulkDeleteSelectedLeads = async () => {
    if (selectedLeadIds.length === 0) return;

    await Promise.all(selectedLeadIds.map((leadId) => leadService.softDeleteManageLead(leadId)));
    setSelectedLeadIds([]);
    await loadInsights();
    setFeedback(`${selectedLeadIds.length} lead(s) deleted`);
    setConfirmBulkDeleteOpen(false);
  };

  const handleExportSelectedLeadsCsv = () => {
    if (selectedLeadIds.length === 0) return;

    const selectedLeads = filteredLeads.filter((lead) => selectedLeadIds.includes(lead.id));
    if (selectedLeads.length === 0) return;

    const escapeCsv = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

    const fieldDefinitions: Record<string, { header: string; getValue: (lead: ManageLead) => unknown }> = {
      name: { header: "Name", getValue: (lead) => lead.name },
      company: { header: "Company", getValue: (lead) => lead.company },
      email: { header: "Email", getValue: (lead) => lead.email },
      phone: { header: "Phone", getValue: (lead) => lead.phone },
      stage: {
        header: "Stage",
        getValue: (lead) =>
          (manageStageLabelMap as Partial<Record<ManageLeadStage, string>>)[lead.stage] ??
          lead.stage,
      },
      score: { header: "Score", getValue: (lead) => lead.score },
      budget_estimate: {
        header: "Budget Estimate",
        getValue: (lead) => lead.budget_estimate,
      },
      category: { header: "Category", getValue: (lead) => lead.category },
      rating: { header: "Rating", getValue: (lead) => lead.rating },
      review_count: {
        header: "Review Count",
        getValue: (lead) => lead.review_count,
      },
      address: { header: "Address", getValue: (lead) => lead.address },
      website_url: { header: "Website URL", getValue: (lead) => lead.website_url },
      google_maps_url: {
        header: "Google Maps URL",
        getValue: (lead) => lead.google_maps_url,
      },
      notes: { header: "Notes", getValue: (lead) => lead.notes },
      created_at: { header: "Created At", getValue: (lead) => lead.created_at },
      updated_at: { header: "Updated At", getValue: (lead) => lead.updated_at },
    };

    const fallbackFields = [
      "name",
      "company",
      "email",
      "phone",
      "stage",
      "score",
      "notes",
    ];
    const selectedFields =
      preferredExportFields.length > 0 ? preferredExportFields : fallbackFields;
    const activeFields = selectedFields
      .map((field) => fieldDefinitions[field])
      .filter(Boolean);

    if (activeFields.length === 0) {
      return;
    }

    const headers = activeFields.map((field) => field.header);
    const rows = selectedLeads.map((lead) =>
      activeFields.map((field) => field.getValue(lead)),
    );

    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `manage-leads-selected-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);

    setFeedback(`Exported ${selectedLeads.length} selected lead(s) to CSV`);
  };

  const uploadButton = (
    <label className="glass-btn cursor-pointer px-2 py-1 text-[11px]">
      Upload CSV
      <input
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void handleFilePick(file);
          }
        }}
      />
    </label>
  );

  if (loading) {
    return <div className="glass-card p-8 text-sm text-content-secondary">Loading Manage Leads dashboard...</div>;
  }

  if (error) {
    return (
      <div className="glass-card border-danger/30 p-4 text-sm text-danger">
        <p className="font-semibold">{error}</p>
        {errorDetails && (
          <p className="mt-2 text-xs text-danger/80">Details: {errorDetails}</p>
        )}
      </div>
    );
  }

  return (
    <>
      <PageBackground image={bgTeamCollab} tint="rgba(168, 85, 247, 0.80)"  />
      <ResponsivePageLayout
        contentClassName="space-y-4"
      >
        <ManageLeadsHeader
          manageLeadView={manageLeadView}
          insights={insights}
          search={search}
          onlyHot={onlyHot}
          disableDetailsPopup={disableDetailsPopup}
          utilityControl={<FullscreenToggleButton />}
          uploadControl={uploadButton}
          onViewChange={setManageLeadView}
          onSearchChange={setSearch}
          onToggleOnlyHot={() => setOnlyHot((value) => !value)}
          onTogglePopup={() => setDisableDetailsPopup((value) => !value)}
          onToggleAddLead={() => setShowAddRow((value) => !value)}
        />

        {feedback ? (
          <div className="rounded-glass-sm border border-success/30 bg-success-soft px-3 py-2 text-sm text-success">
            {feedback}
          </div>
        ) : null}

        {showAddRow ? (
          <ManageLeadsAddRowForm
            draft={newLead}
            onDraftChange={setNewLead}
            onSave={() => {
              void createLeadRow();
            }}
            onCancel={() => setShowAddRow(false)}
          />
        ) : null}

        {csvFile && csvHeaders.length > 0 ? (
          <ManageLeadsCsvMappingPanel
            fileName={csvFile.name}
            csvHeaders={csvHeaders}
            csvMapping={csvMapping}
            csvResult={csvResult}
            onMappingChange={(header, field) => {
              setCsvMapping((previous) => ({ ...previous, [header]: field }));
            }}
            onImport={() => {
              void importCsv();
            }}
            onCancel={() => setCsvFile(null)}
          />
        ) : null}

        {manageLeadView === "kanban" ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={(event) => {
              void handleDragEnd(event);
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {grouped.map((column) => (
                <ManageLeadsStageColumn
                  key={column.id}
                  stage={column}
                  leads={column.leads}
                  onHoverStart={handleHoverStart}
                  onHoverEnd={handleHoverEnd}
                  onAddLead={() => setShowAddRow(true)}
                  uploadControl={uploadButton}
                />
              ))}
            </div>
            <DragOverlay>
              {activeDragLead ? (
                <div
                  className="glass-card-sm p-3 text-xs opacity-90 shadow-lg rotate-2 cursor-grabbing"
                  style={{ transform: CSS.Translate.toString({ x: 0, y: 0, scaleX: 1, scaleY: 1 }) }}
                >
                  <p className="text-sm font-semibold text-content">{activeDragLead.name}</p>
                  <p className="text-[11px] text-content-secondary">{activeDragLead.company}</p>
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-content-tertiary">
                    <span>Score {activeDragLead.score}</span>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : null}

        {manageLeadView === "table" ? (
          <>
            <div className="glass-card-sm flex flex-wrap items-center gap-2 px-3 py-2">
              <span className="text-xs text-content-secondary">{selectedLeadIds.length} selected</span>
              <button
                type="button"
                onClick={() => {
                  setConfirmBulkDeleteOpen(true);
                }}
                disabled={selectedLeadIds.length === 0}
                className="rounded-glass-sm border border-danger/30 bg-danger-soft px-2.5 py-1 text-[11px] text-danger disabled:cursor-not-allowed disabled:opacity-50"
              >
                Delete Selected
              </button>
              <button
                type="button"
                onClick={handleExportSelectedLeadsCsv}
                disabled={selectedLeadIds.length === 0}
                className="glass-btn px-2.5 py-1 text-[11px] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Export Selected CSV
              </button>
            </div>

            <ManageLeadsTableView
              leads={filteredLeads}
              selectedLeadIds={selectedLeadIds}
              stageLabels={manageStageLabelMap}
              onToggleSelectLead={toggleSelectLead}
              onToggleSelectAllLeads={toggleSelectAllLeads}
              onOpenDetails={openDetails}
              onOpenEdit={openEdit}
              onDelete={setConfirmDeleteId}
            />
          </>
        ) : null}

        {manageLeadView === "analytics" ? (
          <LeadsAnalysisPage leads={filteredLeads} />
        ) : null}

        <LeadModal
          key={hoveredId || selectedManageLeadId || "closed"}
          lead={activeLead}
          open={manageLeadView === "kanban" ? Boolean(hoveredId && activeLead && !isDragging) : Boolean(detailsOpen && activeLead)}
          variant={manageLeadView === "kanban" ? "hover" : "dialog"}
          position={modalPosition}
          onClose={() => {
            setHoveredId(null);
            setDetailsOpen(false);
            isModalHoverRef.current = false;
          }}
          onMouseEnter={() => {
            setIsModalHover(true);
            isModalHoverRef.current = true;
          }}
          onMouseLeave={() => {
            setIsModalHover(false);
            isModalHoverRef.current = false;
            if (activeLead) {
              handleHoverEnd(activeLead.id);
            }
          }}
          onSendMessage={() => {
            if (!activeLead) return;
            if (!activeLead.email) {
              setFeedback("No email available for this lead.");
              return;
            }

            navigate("/messages", {
              state: {
                fromPipeline: true,
                leadId: activeLead.id,
                tone: "professional",
                subject: `Regarding ${activeLead.company} - Partnership Opportunity`,
                customContext: `Stage: ${activeLead.stage}. Score: ${activeLead.score}. Company: ${activeLead.company}.`,
              },
            });
            setFeedback(`Redirected to Messages for ${activeLead.name}`);
          }}
          onScheduleCall={() => {
            if (!activeLead) return;
            if (!activeLead.phone?.trim()) {
              setFeedback("No phone number available for this lead.");
              return;
            }

            window.open(`tel:${activeLead.phone.trim()}`, "_blank", "noopener,noreferrer");
            setFeedback(`Initiated call action for ${activeLead.phone.trim()}`);
          }}
          onMoveNext={() => {
            if (!activeLead) return;
            void moveNext(activeLead);
          }}
          onMoveToContacted={() => {
            if (!activeLead) return;
            void moveToNEGOTIATION(activeLead);
          }}
          onDelete={() => {
            if (!activeLead) return;
            setConfirmDeleteId(activeLead.id);
          }}
          onEdit={manageLeadView === "table" ? () => setEditOpen(true) : undefined}
        />

        <EditLeadModal
          lead={activeLead}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSave={(updated) => {
            if (!activeLead) return;
            setPendingLeadUpdate({
              leadId: activeLead.id,
              payload: updated,
            });
          }}
        />

        <ConfirmDialog
          open={Boolean(pendingLeadUpdate)}
          title="Confirm Lead Update"
          description="Are you sure you want to update this lead?"
          confirmLabel="Update Lead"
          onCancel={() => setPendingLeadUpdate(null)}
          onConfirm={() => {
            if (!pendingLeadUpdate) return;
            const { leadId, payload } = pendingLeadUpdate;
            void leadService
              .updateManageLead(leadId, {
                name: payload.name,
                company: payload.company,
                email: payload.email || undefined,
                phone: payload.phone || undefined,
                stage: payload.stage,
                budget_estimate: payload.budget_estimate,
                notes: payload.notes || undefined,
                // CSV fields
                category: payload.category,
                rating: payload.rating,
                review_count: payload.review_count,
                address: payload.address,
                website_url: payload.website_url,
                google_maps_url: payload.google_maps_url,
              })
              .then(async () => {
                await loadInsights();
                setEditOpen(false);
                setPendingLeadUpdate(null);
                setFeedback(`Updated ${payload.name}`);
              });
          }}
        />

        <ConfirmDialog
          open={Boolean(confirmDeleteId)}
          title="Delete Lead"
          description="Delete this lead? It will be moved to the recycle bin."
          confirmLabel="Delete"
          danger
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={() => {
            if (!confirmDeleteId) return;
            void leadService.softDeleteManageLead(confirmDeleteId).then(async () => {
              setConfirmDeleteId(null);
              setHoveredId(null);
              setDetailsOpen(false);
              await loadInsights();
              setFeedback("Lead deleted");
            });
          }}
        />

        <ConfirmDialog
          open={confirmBulkDeleteOpen}
          title="Delete Selected Leads"
          description={`Delete ${selectedLeadIds.length} selected lead(s)? They will be moved to the recycle bin.`}
          confirmLabel="Delete Selected"
          danger
          onCancel={() => setConfirmBulkDeleteOpen(false)}
          onConfirm={() => {
            void handleBulkDeleteSelectedLeads();
          }}
        />
      </ResponsivePageLayout>
    </>
  );
};
