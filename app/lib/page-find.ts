const IGNORE_SELECTOR =
  "[data-page-find-ignore], script, style, noscript, .sr-only, .qvh-page-find";

export type PageFindResult = {
  ranges: Range[];
  count: number;
};

export function normalizePageFindQuery(query: string): string {
  return query.trim().toLowerCase();
}

function isIgnoredTextNode(node: Node): boolean {
  const parent = node.parentElement;
  if (!parent) return true;
  return Boolean(parent.closest(IGNORE_SELECTOR));
}

/** Recorre texto visible del contenedor y devuelve rangos que coinciden (como Ctrl+F). */
export function collectPageFindRanges(
  container: HTMLElement,
  query: string
): PageFindResult {
  const needle = normalizePageFindQuery(query);
  if (!needle) return { ranges: [], count: 0 };

  const ranges: Range[] = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (isIgnoredTextNode(node)) return NodeFilter.FILTER_REJECT;
      if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let node: Node | null = walker.nextNode();
  while (node) {
    const text = node.textContent ?? "";
    const haystack = text.toLowerCase();
    let from = 0;

    while (from < haystack.length) {
      const index = haystack.indexOf(needle, from);
      if (index === -1) break;

      const range = document.createRange();
      range.setStart(node, index);
      range.setEnd(node, index + needle.length);
      ranges.push(range);
      from = index + needle.length;
    }

    node = walker.nextNode();
  }

  return { ranges, count: ranges.length };
}

export function scrollRangeIntoView(
  range: Range,
  anchorOffset = 0
): void {
  const rect = range.getBoundingClientRect();
  if (rect.height === 0 && rect.width === 0) {
    range.startContainer.parentElement?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    return;
  }

  const targetTop =
    rect.top + window.scrollY - anchorOffset - window.innerHeight * 0.32;

  window.scrollTo({
    top: Math.max(0, targetTop),
    behavior: "smooth",
  });
}

type HighlightNames = {
  all: string;
  active: string;
};

const DEFAULT_NAMES: HighlightNames = {
  all: "qvh-page-find-all",
  active: "qvh-page-find-active",
};

export function supportsCssHighlights(): boolean {
  return typeof CSS !== "undefined" && "highlights" in CSS;
}

export function setPageFindHighlights(
  ranges: Range[],
  activeIndex: number,
  names: HighlightNames = DEFAULT_NAMES
): void {
  clearPageFindHighlights(names);

  if (!ranges.length || !supportsCssHighlights()) return;

  CSS.highlights.set(names.all, new Highlight(...ranges));

  const active = ranges[activeIndex];
  if (active) {
    CSS.highlights.set(names.active, new Highlight(active));
  }
}

export function clearPageFindHighlights(
  names: HighlightNames = DEFAULT_NAMES
): void {
  if (!supportsCssHighlights()) return;
  CSS.highlights.delete(names.all);
  CSS.highlights.delete(names.active);
}
