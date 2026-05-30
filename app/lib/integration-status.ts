import { isSupabaseConfigured } from "./supabase-config"
import { isPushConfigured } from "./push-vapid"

export type IntegrationStatus = {
  supabase: boolean
  serviceRole: boolean
  cronSecret: boolean
  adminSecret: boolean
  footballApi: boolean
  tmdbApi: boolean
  pandascoreApi: boolean
  balldontlieApi: boolean
  indexNow: boolean
  upstashRateLimit: boolean
  openaiAssistant: boolean
  pushVapid: boolean
  cronAlerts: boolean
}

function isSet(name: string): boolean {
  return Boolean(process.env[name]?.trim())
}

/** Estado de integraciones (solo booleanos, sin valores). */
export function getIntegrationStatus(): IntegrationStatus {
  return {
    supabase: isSupabaseConfigured(),
    serviceRole: isSet("SUPABASE_SERVICE_ROLE_KEY"),
    cronSecret: isSet("CRON_SECRET"),
    adminSecret: isSet("ADMIN_SECRET"),
    footballApi: isSet("FOOTBALL_DATA_API_KEY"),
    tmdbApi: isSet("TMDB_API_KEY"),
    pandascoreApi: isSet("PANDASCORE_API_KEY"),
    balldontlieApi: isSet("BALLDONTLIE_API_KEY"),
    indexNow: isSet("INDEXNOW_KEY"),
    upstashRateLimit:
      isSet("UPSTASH_REDIS_REST_URL") && isSet("UPSTASH_REDIS_REST_TOKEN"),
    openaiAssistant: isSet("OPENAI_API_KEY"),
    pushVapid: isPushConfigured(),
    cronAlerts: isSet("CRON_ALERT_WEBHOOK_URL"),
  }
}

export function integrationScore(status: IntegrationStatus): {
  requiredOk: number
  requiredTotal: number
  optionalOk: number
  optionalTotal: number
} {
  const required = [
    status.supabase,
    status.serviceRole,
    status.cronSecret,
    status.adminSecret,
    status.footballApi,
    status.tmdbApi,
    status.indexNow,
  ]
  const optional = [
    status.pandascoreApi,
    status.balldontlieApi,
    status.upstashRateLimit,
    status.openaiAssistant,
    status.pushVapid,
    status.cronAlerts,
  ]
  return {
    requiredOk: required.filter(Boolean).length,
    requiredTotal: required.length,
    optionalOk: optional.filter(Boolean).length,
    optionalTotal: optional.length,
  }
}
