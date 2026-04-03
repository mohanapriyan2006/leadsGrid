import { useEffect, useMemo, useRef, useState } from "react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { useNavigate } from "react-router-dom";

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
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useLeadStore } from "../../store/useLeadStore";
import { PageBackground } from "../../components/ui/PageBackground";
import bgTeamCollab from "../../assets/bg-images/team-collaboration.svg";

export const ManageLeadsPage = () => {
  const navigate = useNavigate();
  const {
    selectedManageLeadId,
    manageLeadView,
    setSelectedManageLeadId,
    setManageLeadView,
  } = useLeadStore();

  // Use centralized leads hook for real-time data
  const { leads: manageLeads, loading, error: hookError } = useCentralizedLeads();

  const [search, setSearch] = useState("");
  const [onlyHot, setOnlyHot] = useState(false);
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
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [newLead, setNewLead] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    stage: "NEW" as ManageLeadStage,
    budget_estimate: 0,
  });

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

  const grouped = useMemo(
    () =>
      BOARD_STAGES.map((stage) => ({
        ...stage,
        leads: filteredLeads.filter((lead) => lead.stage === stage.id),
      })),
    [filteredLeads],
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
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const targetStage = BOARD_STAGES.find((item) => item.id === String(over.id))?.id;
    const source = filteredLeads.find((lead) => lead.id === activeId);

    if (!targetStage || !source || source.stage === targetStage) return;

    await leadService.updateManageLead(source.id, { stage: targetStage });
    await loadInsights();
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
    <div className="page-with-bg">
      <PageBackground image={bgTeamCollab} tint="rgba(168, 85, 247, 0.80)" />

      <div className="h-[calc(100vh-100px)] overflow-auto space-y-4 p-6">
        <ManageLeadsHeader
          manageLeadView={manageLeadView}
          insights={insights}
          search={search}
          onlyHot={onlyHot}
          disableDetailsPopup={disableDetailsPopup}
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
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(event) => {
              void handleDragEnd(event);
            }}
          >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
          </DndContext>
        ) : null}

        {manageLeadView === "table" ? (
          <ManageLeadsTableView
            leads={filteredLeads}
            onOpenDetails={openDetails}
            onOpenEdit={openEdit}
            onDelete={setConfirmDeleteId}
          />
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
            void runAction(activeLead.id, "SEND_FOLLOW_UP");
          }}
          onScheduleCall={() => {
            if (!activeLead) return;
            void runAction(activeLead.id, "SCHEDULE_CALL");
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
            if (!window.confirm("Are you sure you want to update this lead?")) return;
            void leadService
              .updateManageLead(activeLead.id, {
                name: updated.name,
                company: updated.company,
                email: updated.email || undefined,
                phone: updated.phone || undefined,
                stage: updated.stage,
                budget_estimate: updated.budget_estimate,
                notes: updated.notes || undefined,
                // CSV fields
                category: updated.category,
                rating: updated.rating,
                review_count: updated.review_count,
                address: updated.address,
                website_url: updated.website_url,
                open_now: updated.open_now,
                google_maps_url: updated.google_maps_url,
              })
              .then(async () => {
                await loadInsights();
                setEditOpen(false);
                setFeedback(`Updated ${updated.name}`);
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
      </div>
    </div>
  );
};
