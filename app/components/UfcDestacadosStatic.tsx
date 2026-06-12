import { UFC_CASABLANCA_FALLBACK } from "../lib/ufc-week";
import { DestacadosSection } from "./DestacadosSection";

/** Hero UFC en HTML estático — sin API (LCP inmediato en ISR/CDN). */
export function UfcDestacadosStatic() {
  return <DestacadosSection events={[UFC_CASABLANCA_FALLBACK.event]} />;
}
