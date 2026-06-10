import { useTranslation } from "react-i18next";
import { ChatEmptyIllustration } from "./ChatEmptyIllustration";

export default function EmptyChatState() {
  const { t } = useTranslation();

  return (
    <div className="ow-empty-state h-full -mt-6 select-none">
      <ChatEmptyIllustration />
      <p className="ow-empty-state-description mt-4">{t("chat.selectChat")}</p>
    </div>
  );
}
