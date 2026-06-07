import { useTranslation } from "react-i18next";
import CliIntegrationCard from "./CliIntegrationCard";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 mb-2 pl-1">
      {children}
    </div>
  );
}

export default function IntegrationsView() {
  const { t } = useTranslation();

  return (
    <div className="max-w-3xl mx-auto w-full px-8 py-7 space-y-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">{t("integrations.title")}</h2>
        <p className="text-xs text-muted-foreground/70 mt-0.5">{t("integrations.description")}</p>
      </div>

      <div>
        <SectionLabel>{t("integrations.sections.cli")}</SectionLabel>
        <CliIntegrationCard />
      </div>
    </div>
  );
}
