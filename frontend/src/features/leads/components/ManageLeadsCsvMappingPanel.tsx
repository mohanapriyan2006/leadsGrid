import type { CSVImportResult } from "../types/manageLead";

import { APP_IMPORT_FIELDS } from "../constants/manageLeads";

type ManageLeadsCsvMappingPanelProps = {
  fileName: string;
  csvHeaders: string[];
  csvMapping: Record<string, string>;
  csvResult: CSVImportResult | null;
  onMappingChange: (header: string, field: string) => void;
  onImport: () => void;
  onCancel: () => void;
};

export const ManageLeadsCsvMappingPanel = ({
  fileName,
  csvHeaders,
  csvMapping,
  csvResult,
  onMappingChange,
  onImport,
  onCancel,
}: ManageLeadsCsvMappingPanelProps) => {
  return (
    <div className="glass-card p-4">
      <p className="text-sm text-content">CSV Field Mapping: {fileName}</p>
      <div className="mt-2 grid gap-2 md:grid-cols-2">
        {csvHeaders.map((header) => (
          <label
            key={header}
            className="glass-card-sm flex items-center justify-between gap-2 px-2 py-1 text-xs"
          >
            <span className="text-content-secondary">{header}</span>
            <select
              value={csvMapping[header] ?? ""}
              onChange={(event) => onMappingChange(header, event.target.value)}
              className="glass-input px-2 py-1 text-sm"
            >
              <option value="">Ignore</option>
              {APP_IMPORT_FIELDS.map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={onImport} className="accent-btn px-3 py-1.5 text-xs font-semibold">
          Import CSV
        </button>
        <button type="button" onClick={onCancel} className="glass-btn px-3 py-1.5 text-xs">
          Cancel
        </button>
      </div>
      {csvResult ? (
        <p className="mt-2 text-xs text-content-secondary">
          Imported {csvResult.accepted}, skipped {csvResult.skipped}, invalid {csvResult.invalid}
        </p>
      ) : null}
    </div>
  );
};