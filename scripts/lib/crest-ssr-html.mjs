/**
 * Cuenta escudos en HTML SSR. StaticCrest pone src antes de class;
 * el regex antiguo (class antes de src) daba 0 falsos negativos.
 */

export function listCrestImgTags(html) {
  return html.match(/<img[^>]*fh-team-crest-img[^>]*>/gi) ?? [];
}

export function countCrestImgsWithSrc(html) {
  return listCrestImgTags(html).filter((tag) => /src=["'][^"']+["']/i.test(tag)).length;
}

export function hasCrestSrcLocalOrCdn(html) {
  return listCrestImgTags(html).some((tag) =>
    /src=["'](?:\/crests\/|https:\/\/cdn\.pandascore)/i.test(tag)
  );
}

export function hasCrestSrcAnyKnownOrigin(html) {
  return listCrestImgTags(html).some((tag) =>
    /src=["'](?:\/crests\/|https:\/\/cdn\.pandascore|https:\/\/crests\.football-data\.org)/i.test(
      tag
    )
  );
}
