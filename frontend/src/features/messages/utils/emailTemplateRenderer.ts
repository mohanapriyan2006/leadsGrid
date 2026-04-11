import { EMAIL_TEMPLATES } from "../constants/emailTemplates";
import type { EmailTemplateId, EmailTemplateTokenData, RenderedEmailTemplate } from "../types/emailTemplates";

type RenderOptions = {
  templateId: EmailTemplateId;
  tokens: EmailTemplateTokenData;
  primaryColor?: string;
  secondaryColor?: string;
};

const EMAIL_TOKEN_PATTERN = /{{\s*([a-zA-Z0-9_]+)\s*}}/g;
const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const sanitizeColor = (value: string | undefined, fallback: string): string => {
  if (!value) return fallback;
  const trimmed = value.trim();
  return HEX_COLOR_PATTERN.test(trimmed) ? trimmed : fallback;
};

const applyTokens = (template: string, tokens: Record<string, string>): string =>
  template.replace(EMAIL_TOKEN_PATTERN, (_, rawToken: string) => {
    const token = rawToken.trim();
    return token in tokens ? tokens[token] : "";
  });

export const renderEmailTemplate = ({
  templateId,
  tokens,
  primaryColor,
  secondaryColor,
}: RenderOptions): RenderedEmailTemplate => {
  const template = EMAIL_TEMPLATES.find((item) => item.id === templateId) ?? EMAIL_TEMPLATES[0];

  const resolvedPrimary = sanitizeColor(primaryColor, template.defaultPrimaryColor);
  const resolvedSecondary = sanitizeColor(secondaryColor, template.defaultSecondaryColor);

  const htmlTokens: Record<string, string> = {
    name: escapeHtml(tokens.name),
    company: escapeHtml(tokens.company),
    pain_point: escapeHtml(tokens.pain_point),
    solution: escapeHtml(tokens.solution),
    sender_name: escapeHtml(tokens.sender_name),
    primary_color: resolvedPrimary,
    secondary_color: resolvedSecondary,
  };

  const plainTokens: Record<string, string> = {
    name: tokens.name,
    company: tokens.company,
    pain_point: tokens.pain_point,
    solution: tokens.solution,
    sender_name: tokens.sender_name,
  };

  return {
    html: applyTokens(template.htmlTemplate, htmlTokens),
    plain: applyTokens(template.plainTemplate, plainTokens),
    subject: applyTokens(template.subjectTemplate, plainTokens),
  };
};
