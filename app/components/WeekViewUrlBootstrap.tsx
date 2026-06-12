import { WEEK_VIEW_URL_BOOTSTRAP_SCRIPT } from "../lib/week-view-url-bootstrap"

export function WeekViewUrlBootstrap() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: WEEK_VIEW_URL_BOOTSTRAP_SCRIPT }}
    />
  )
}
