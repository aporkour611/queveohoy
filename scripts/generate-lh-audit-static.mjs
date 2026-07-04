import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const root = process.cwd()
const lhHtml = join(root, ".next", "server", "app", "lh.html")
const outDir = join(root, "public")
const outFile = join(outDir, "lh-audit.html")

if (!existsSync(lhHtml)) {
  console.error("missing", lhHtml, "— run next build first")
  process.exit(1)
}

let html = readFileSync(lhHtml, "utf8")
html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
html = html.replace(/<script\b[^>]*\/>/gi, "")
html = html.replace(
  /<link rel="preload" as="script"[^>]*>/gi,
  ""
)

mkdirSync(outDir, { recursive: true })
writeFileSync(outFile, html)
console.log("wrote", outFile, `(${html.length} bytes, scripts stripped)`)
