import fs from "node:fs";

const sourcePath = process.argv[2] ?? "app/futbolhoy.css";
const lines = fs.readFileSync(sourcePath, "utf8").split(/\r?\n/);
const shellEnd = lines.findIndex((line) => line.startsWith(".fh-comp-header {"));
if (shellEnd < 0) throw new Error("split marker not found");

const emptyStart = lines.findIndex((line) => line.includes("Empty / loading"));
let emptyBlockEnd = emptyStart;
for (let i = emptyStart; i < lines.length; i += 1) {
  if (lines[i].startsWith(".fh-btn-primary:hover")) {
    emptyBlockEnd = i + 1;
    break;
  }
}

const featStart = lines.findIndex((line) => line.startsWith(".fh-featured-badge {"));
const featEnd =
  lines.findIndex((line, index) => index > featStart && line.startsWith(".fh-footer {")) -
  1;

const shell = [
  ...lines.slice(0, shellEnd),
  "",
  "/* Empty / loading (above-the-fold errors) */",
  ...lines.slice(emptyStart + 1, emptyBlockEnd + 1),
  "",
  "/* Featured badge (day header) */",
  ...lines.slice(featStart, featEnd + 1),
  "",
  ".fh-home-day-header-ssr {",
  "  overflow-anchor: none;",
  "}",
  "",
  ".fh-home-day-header-ssr[hidden] {",
  "  display: none !important;",
  "}",
  "",
  ".fh-home-day-header-ssr .fh-matchday-header {",
  "  margin-bottom: 0.5rem;",
  "}",
];

const feedSkip = new Set();
for (let i = emptyStart; i <= emptyBlockEnd; i += 1) feedSkip.add(i);
for (let i = featStart; i <= featEnd; i += 1) feedSkip.add(i);

const feed = ["/* Match cards, filters, SEO blocks — below the fold */"];
for (let i = shellEnd; i < lines.length; i += 1) {
  if (!feedSkip.has(i)) feed.push(lines[i]);
}

fs.writeFileSync("app/futbolhoy-shell.css", shell.join("\n"));
fs.writeFileSync("app/futbolhoy-feed.css", feed.join("\n"));
console.log(`shell ${shell.length} lines, feed ${feed.length} lines, split at ${shellEnd}`);
