export type EmailTemplateId = "minimal-professional" | "modern-card" | "bold-conversion";

export type EmailTemplateTokenData = {
  name: string;
  company: string;
  pain_point: string;
  solution: string;
  sender_name: string;
};

export type EmailTemplateDefinition = {
  id: EmailTemplateId;
  name: string;
  layoutDescription: string;
  subjectTemplate: string;
  htmlTemplate: string;
  plainTemplate: string;
  defaultPrimaryColor: string;
  defaultSecondaryColor: string;
};

export type RenderedEmailTemplate = {
  html: string;
  plain: string;
  subject: string;
};
