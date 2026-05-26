export type EventRow = {
  id: number;
  title?: string;
  time?: string;
  home_team?: string | null;
  away_team?: string | null;
  competition?: string | null;
  platform?: string | null;
  sport?: string | null;
  external_id?: string | null;
  source?: string | null;
};
