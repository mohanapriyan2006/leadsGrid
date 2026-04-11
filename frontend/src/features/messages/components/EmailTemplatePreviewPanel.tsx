type EmailTemplatePreviewPanelProps = {
  templateName: string;
  previewSubject: string;
  htmlContent: string;
};

export const EmailTemplatePreviewPanel = ({
  templateName,
  previewSubject,
  htmlContent,
}: EmailTemplatePreviewPanelProps) => {
  return (
    <section className="glass-card p-4">
      <div className="mb-3">
        <p className="text-xs tracking-[0.1em] text-content-tertiary">TEMPLATE PREVIEW</p>
        <h3 className="mt-1 text-base font-semibold text-content">{templateName}</h3>
        <p className="mt-1 text-xs text-content-secondary">Subject: {previewSubject || "No subject"}</p>
      </div>

      <div className="overflow-hidden rounded-glass border border-accent/15 bg-white">
        <iframe
          title="Email template preview"
          srcDoc={htmlContent}
          className="h-[560px] w-full bg-white"
          sandbox="allow-same-origin"
        />
      </div>
    </section>
  );
};
