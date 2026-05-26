import { getMadridTodayKey, partidosHoyDatePath } from "../lib/seo-date";
import { siteUrl } from "../lib/seo";
import { ShareTodayButton } from "./ShareTodayButton";

export function ShareTodayBar() {
  const url = `${siteUrl}${partidosHoyDatePath(getMadridTodayKey())}`;

  return (
    <ShareTodayButton
      title="Partidos hoy en TV — queveohoy"
      text="Agenda de hoy con horarios y canales en España"
      url={url}
    />
  );
}
