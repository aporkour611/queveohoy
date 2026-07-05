/**
 * Prune old ultra-pro marathon report artifacts.
 *   node scripts/marathon-prune-reports.mjs
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs"
import { join } from "node:path"

const OUT_DIR = join(process.cwd(), "docs", "marathon-reports")
const ARCHIVE_DIR = join(OUT_DIR, "archive")
const CHAIN_LOG = join(OUT_DIR, "marathon-chain-log.jsonl")
const CHAIN_STATS = join(OUT_DIR, "CHAIN-STATS.json")
const KEEP_PROGRESS = 3
const CYCLES_PER_RUN = Number(process.env.MARATHON_CYCLES ?? 100_000)

const PROGRESS_RE = /^ultra-pro-100k-(\d+)-progress\.json$/
const EXECUTED_RE = /^ultra-pro-100k-(\d+)-executed\.json$/
const LEGACY_EXECUTED = "ultra-pro-100k-executed.json"
const LEGACY_PROGRESS = "ultra-pro-100k-progress.json"

const parseRunNumber = (name, re) => {
  const match = name.match(re)
  if (!match) return null
  return Number(match[1])
}

const readChainLogStats = () => {
  if (!existsSync(CHAIN_LOG)) {
    return {
      totalRunsCompleted: 0,
      firstRunAt: null,
      lastRunAt: null,
    }
  }

  const lines = readFileSync(CHAIN_LOG, "utf8").trim().split("\n").filter(Boolean)
  let first = null
  let last = null

  for (const line of lines) {
    try {
      const entry = JSON.parse(line)
      if (!first) first = entry
      last = entry
    } catch {
      /* skip malformed line */
    }
  }

  return {
    totalRunsCompleted: last?.runsCompleted ?? lines.length,
    firstRunAt: first?.at ?? null,
    lastRunAt: last?.at ?? null,
  }
}

const keptRunIds = () => {
  const runIds = readdirSync(OUT_DIR)
    .map((name) => parseRunNumber(name, PROGRESS_RE))
    .filter((n) => n != null)
    .sort((a, b) => b - a)
    .slice(0, KEEP_PROGRESS)

  return new Set(runIds)
}

const moveToArchive = (filename, bucket, archived) => {
  const src = join(OUT_DIR, filename)
  if (!existsSync(src)) return

  const dest = join(ARCHIVE_DIR, filename)
  renameSync(src, dest)
  archived[bucket].push(filename)
}

mkdirSync(ARCHIVE_DIR, { recursive: true })

const kept = keptRunIds()
const archived = {
  progress: [],
  executed: [],
}

for (const name of readdirSync(OUT_DIR)) {
  const runId = parseRunNumber(name, PROGRESS_RE)
  if (runId == null) continue
  if (kept.has(runId)) continue
  moveToArchive(name, "progress", archived)
}

for (const name of readdirSync(OUT_DIR)) {
  const runId = parseRunNumber(name, EXECUTED_RE)
  if (runId != null) {
    if (kept.has(runId)) continue
    moveToArchive(name, "executed", archived)
    continue
  }

  if (name === LEGACY_EXECUTED) {
    moveToArchive(name, "executed", archived)
  }
}

if (existsSync(join(OUT_DIR, LEGACY_PROGRESS)) && kept.size > 0) {
  moveToArchive(LEGACY_PROGRESS, "progress", archived)
}

const chain = readChainLogStats()
const stats = {
  generatedAt: new Date().toISOString(),
  totalRunsCompleted: chain.totalRunsCompleted,
  totalCycles: chain.totalRunsCompleted * CYCLES_PER_RUN,
  firstRunAt: chain.firstRunAt,
  lastRunAt: chain.lastRunAt,
  keptProgressRunIds: [...kept].sort((a, b) => a - b),
  archivedProgressCount: archived.progress.length,
  archivedExecutedCount: archived.executed.length,
}

writeFileSync(CHAIN_STATS, `${JSON.stringify(stats, null, 2)}\n`)

const summary = { archived, chainStats: stats }
console.log(JSON.stringify(summary, null, 2))