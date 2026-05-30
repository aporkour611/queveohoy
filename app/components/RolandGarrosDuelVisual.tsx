import {
  resolveTennisPlayerCountry,
  tennisFlagUrl,
} from "../lib/tennis-player-country";

type Props = {
  homeName?: string | null;
  awayName?: string | null;
  className?: string;
  size?: "card" | "spotlight";
};

function shortPlayerName(name?: string | null): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return parts[0];
  return parts[parts.length - 1];
}

function FlagHalf({
  code,
  side,
  prefix,
}: {
  code: string;
  side: "home" | "away";
  prefix: string;
}) {
  const url = tennisFlagUrl(code);

  if (!url) {
    return (
      <div
        className={`${prefix}-flag ${prefix}-flag-${side} ${prefix}-flag-clay`}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={`${prefix}-flag ${prefix}-flag-${side}`}
      style={{ backgroundImage: `url("${url}")` }}
      aria-hidden
    />
  );
}

export function RolandGarrosDuelVisual({
  homeName,
  awayName,
  className,
  size = "card",
}: Props) {
  const prefix = size === "spotlight" ? "qvh-rg" : "fh-rg";
  const home = homeName?.trim();
  const away = awayName?.trim();

  if (!home && !away) return null;

  const homeCode = resolveTennisPlayerCountry(home);
  const awayCode = resolveTennisPlayerCountry(away);

  const rootClass = [`${prefix}-duel`, className].filter(Boolean).join(" ");

  return (
    <div className={rootClass} aria-hidden>
      <div className={`${prefix}-flags`}>
        <FlagHalf code={homeCode} side="home" prefix={prefix} />
        <FlagHalf code={awayCode} side="away" prefix={prefix} />
        <div className={`${prefix}-flags-center`} />
        <div className={`${prefix}-ball`} aria-hidden>
          <span className={`${prefix}-ball-core`} />
        </div>
      </div>

      <div className={`${prefix}-players`}>
        <span className={`${prefix}-player ${prefix}-player-home`}>
          {shortPlayerName(home)}
        </span>
        <span className={`${prefix}-vs`}>vs</span>
        <span className={`${prefix}-player ${prefix}-player-away`}>
          {shortPlayerName(away)}
        </span>
      </div>
    </div>
  );
}
