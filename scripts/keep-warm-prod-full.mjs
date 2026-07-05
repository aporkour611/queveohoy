#!/usr/bin/env node
/** APIs + hubs HTML — ver docs/HOBBY-FAIR-USE.md */
process.env.KEEP_WARM_FULL = "1"
await import("./keep-warm-prod.mjs")
