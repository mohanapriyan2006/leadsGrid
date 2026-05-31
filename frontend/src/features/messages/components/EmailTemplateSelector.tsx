import { EMAIL_TEMPLATES } from "../constants/emailTemplates";
import type { EmailTemplateId } from "../types/emailTemplates";

type EmailTemplateSelectorProps = {
  selectedTemplateId: EmailTemplateId;
  primaryColor: string;
  secondaryColor: string;
  onTemplateChange: (templateId: EmailTemplateId) => void;
  onPrimaryColorChange: (value: string) => void;
  onSecondaryColorChange: (value: string) => void;
  onApplyTemplate: () => void;
};

export const EmailTemplateSelector = ({
  selectedTemplateId,
  primaryColor,
  secondaryColor,
  onTemplateChange,
  onPrimaryColorChange,
  onSecondaryColorChange,
  onApplyTemplate,
}: EmailTemplateSelectorProps) => {
  return (
    <div className="space-y-3">
      <p className="text-xs tracking-[0.1em]  text-content-tertiaryy">EMAIL TEMPLATE</p>
      <div className="grid gap-2">
        {EMAIL_TEMPLATES.map((template) => {
          const active = template.id === selectedTemplateId;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onTemplateChange(template.id)}
              className={`rounded-glass-sm border px-3 py-3 text-left transition-all duration-200 ${
                active
                  ? "border-accent/50 bg-accent-soft text-content shadow-glow"
                  : "border-accent/10 bg-surface-secondary/70 text-content-secondary hover:border-accent/30"
              }`}
            >
              <p className="text-sm font-semibold">{template.name}</p>
              <p className="mt-1 text-xs  text-content-tertiaryy">{template.layoutDescription}</p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="glass-card-sm flex items-center justify-between gap-3 px-3 py-2 text-xs text-content-secondary">
          <span>Primary Color</span>
          <input
            type="color"
            value={primaryColor}
            onChange={(event) => onPrimaryColorChange(event.target.value)}
            className="h-8 w-10 cursor-pointer rounded border border-accent/30 bg-transparent"
          />
        </label>
        <label className="glass-card-sm flex items-center justify-between gap-3 px-3 py-2 text-xs text-content-secondary">
          <span>Secondary Color</span>
          <input
            type="color"
            value={secondaryColor}
            onChange={(event) => onSecondaryColorChange(event.target.value)}
            className="h-8 w-10 cursor-pointer rounded border border-accent/30 bg-transparent"
          />
        </label>
      </div>

      <p className="text-[11px]  text-content-tertiaryy">
        Use high-contrast colors for readability. CTA buttons should remain clearly visible on white backgrounds.
      </p>

      <button type="button" onClick={onApplyTemplate} className="accent-btn w-full text-xs font-semibold">
        APPLY TEMPLATE TO DRAFT
      </button>
    </div>
  );
};
