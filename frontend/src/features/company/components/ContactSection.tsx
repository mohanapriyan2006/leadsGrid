import { SectionWrapper } from "../../landing/components/ui/SectionWrapper";
import { ContactForm } from "./ContactForm";
import { ContactOptions } from "./ContactOptions";

export const ContactSection = () => {
  return (
    <SectionWrapper className="py-12">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <ContactOptions />
        <ContactForm />
      </div>
    </SectionWrapper>
  );
};