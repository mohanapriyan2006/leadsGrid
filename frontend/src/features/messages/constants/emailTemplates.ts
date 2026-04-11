import type { EmailTemplateDefinition } from "../types/emailTemplates";

export const EMAIL_TEMPLATES: EmailTemplateDefinition[] = [
  {
    id: "minimal-professional",
    name: "Minimal Professional",
    layoutDescription: "Text-first personal note with subtle color accents and a soft CTA.",
    subjectTemplate: "Quick idea for {{company}}",
    defaultPrimaryColor: "#8b5cf6",
    defaultSecondaryColor: "#eef2ff",
    htmlTemplate: `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#ffffff;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;font-family:Arial,Helvetica,sans-serif;color:#111827;line-height:1.6;">
            <tr><td style="padding:8px 4px 16px 4px;font-size:15px;">Hi {{name}},</td></tr>
            <tr><td style="padding:0 4px;font-size:15px;">I noticed {{company}} may be facing {{pain_point}}.</td></tr>
            <tr><td style="padding:12px 4px 0 4px;font-size:15px;">A practical approach is {{solution}} with low disruption.</td></tr>
            <tr><td style="padding:16px 4px 0 4px;font-size:15px;">If useful, I can share a short practical rollout for your team.</td></tr>
            <tr><td style="padding:20px 4px 0 4px;font-size:15px;">Best regards,<br />{{sender_name}}<br /><span style="color:#6b7280;font-size:13px;">via LeadsGrid</span></td></tr>
            <tr><td style="padding:18px 4px 0 4px;border-top:1px solid {{secondary_color}};font-size:12px;color:#6b7280;">This outreach is shared because it appears relevant to your current goals.</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
    plainTemplate: `Hi {{name}},

I noticed {{company}} may be facing {{pain_point}}.
A practical approach is {{solution}} with low disruption.

Best regards,
{{sender_name}}
via LeadsGrid`,
  },
  {
    id: "modern-card",
    name: "Modern Card",
    layoutDescription: "Card-based outreach with highlighted value block and clear CTA.",
    subjectTemplate: "A practical improvement for {{company}}",
    defaultPrimaryColor: "#6366f1",
    defaultSecondaryColor: "#eef2ff",
    htmlTemplate: `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:{{secondary_color}};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:{{secondary_color}};">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;font-family:Arial,Helvetica,sans-serif;">
            <tr><td style="padding:0 0 12px 0;color:#111827;font-size:14px;">Outreach from LeadsGrid</td></tr>
            <tr>
              <td style="background:#ffffff;border-radius:12px;padding:22px;border:1px solid #e5e7eb;">
                <p style="margin:0 0 12px 0;color:#111827;font-size:15px;">Hi {{name}},</p>
                <p style="margin:0 0 12px 0;color:#111827;font-size:15px;">I reviewed {{company}} and found a likely bottleneck around <strong>{{pain_point}}</strong>.</p>
                <div style="background:{{secondary_color}};border-left:4px solid {{primary_color}};padding:12px 14px;border-radius:8px;margin:10px 0 14px 0;color:#111827;font-size:14px;"><strong>Suggested direction:</strong> {{solution}}</div>
                <div style="margin-top:8px;border-radius:8px;background:{{primary_color}};padding:10px 16px;color:#ffffff;font-size:14px;font-weight:bold;display:inline-block;">Open to a quick 10-minute review?</div>
                <p style="margin:16px 0 0 0;color:#374151;font-size:14px;">Regards,<br />{{sender_name}} <span style="color:#6b7280;">via LeadsGrid</span></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
    plainTemplate: `Hi {{name}},

I reviewed {{company}} and found a likely bottleneck around {{pain_point}}.
Suggested direction: {{solution}}

Regards,
{{sender_name}}
via LeadsGrid`,
  },
  {
    id: "bold-conversion",
    name: "Bold Conversion",
    layoutDescription: "Strong headline and high-emphasis CTA for conversion-focused outreach.",
    subjectTemplate: "A faster path for {{company}}",
    defaultPrimaryColor: "#8b5cf6",
    defaultSecondaryColor: "#ede9fe",
    htmlTemplate: `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f8fafc;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;font-family:Arial,Helvetica,sans-serif;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr><td style="background:{{primary_color}};padding:18px 20px;"><h1 style="margin:0;color:#ffffff;font-size:22px;line-height:1.3;">A faster path for {{company}}</h1></td></tr>
            <tr>
              <td style="padding:20px;color:#111827;">
                <p style="margin:0 0 10px 0;font-size:15px;">Hi {{name}},</p>
                <p style="margin:0 0 10px 0;font-size:15px;">If {{pain_point}} is still slowing momentum, there is a simpler path.</p>
                <p style="margin:0 0 14px 0;font-size:15px;">We can help by {{solution}} while keeping your current workflow intact.</p>
                <div style="background:{{secondary_color}};padding:12px;border-radius:8px;margin:0 0 14px 0;font-size:14px;">I can share a practical two-step rollout for your team.</div>
                <div style="margin:8px 0 0 0;text-align:center;background:{{primary_color}};border-radius:8px;padding:12px 16px;color:#ffffff;font-size:15px;font-weight:bold;">Would you like the 2-step rollout plan?</div>
                <p style="margin:16px 0 0 0;font-size:14px;color:#374151;">Thanks,<br />{{sender_name}} <span style="color:#6b7280;">via LeadsGrid</span></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
    plainTemplate: `Hi {{name}},

If {{pain_point}} is still slowing momentum at {{company}}, there is a simpler path.
We can help by {{solution}}.

Thanks,
{{sender_name}}
via LeadsGrid`,
  },
];
