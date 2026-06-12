import { FeedControlsShell } from "./FeedControlsShell";
import { FeedHydrationGate } from "./FeedHydrationGate";
import { HomeFeedDayHeader } from "./HomeFeedDayHeader";
import { buildDisplayDays, MADRID_TZ } from "../lib/timezone";
import { HOME_SSR_DAY_COUNT } from "../lib/home-feed-config";

type Props = {
  todayKey: string;
};

/** Feed UFC estático bajo el pliegue — hidratación diferida vía gate. */
export function UfcHomeFeedShell({ todayKey }: Props) {
  const initialDay = buildDisplayDays(MADRID_TZ, HOME_SSR_DAY_COUNT)[0];
  const shellDays = buildDisplayDays(MADRID_TZ, HOME_SSR_DAY_COUNT);

  return (
    <div className="qvh-home-feed-slot">
      <FeedControlsShell days={shellDays} />
      {initialDay ? (
        <HomeFeedDayHeader date={initialDay.date} title={initialDay.title} />
      ) : null}
      <FeedHydrationGate
        initialEvents={[]}
        initialDestacadosEvents={[]}
        initialWeekEvents={[]}
        initialError={null}
        serverDayHeaderDate={initialDay?.date ?? null}
        initialEventCount={0}
        tonightEvents={[]}
        todayKey={todayKey}
        destacadosEnhancer={null}
      />
    </div>
  );
}
