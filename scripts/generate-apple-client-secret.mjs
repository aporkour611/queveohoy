#!/usr/bin/env node
/**
 * Genera el client secret JWT que Supabase pide en Apple → Secret Key.
 * NO pegues el contenido del .p8: Apple exige un JWT firmado ES256.
 *
 * Uso:
 *   APPLE_TEAM_ID=AB12CD34EF \
 *   APPLE_KEY_ID=XYZ123ABC \
 *   APPLE_SERVICES_ID=com.tudominio.queveohoy.auth \
 *   APPLE_P8_PATH=./AuthKey_XYZ123ABC.p8 \
 *   node scripts/generate-apple-client-secret.mjs
 *
 * Copia la salida (eyJ...) en Supabase → Authentication → Providers → Apple → Secret Key.
 * Caduca en ~180 días: renueva y vuelve a pegar el JWT.
 */
import { readFileSync } from "node:fs"
import { createPrivateKey, sign } from "node:crypto"

const teamId = process.env.APPLE_TEAM_ID?.trim()
const keyId = process.env.APPLE_KEY_ID?.trim()
const servicesId = process.env.APPLE_SERVICES_ID?.trim()
const p8Path = process.env.APPLE_P8_PATH?.trim()

const missing = [
  ["APPLE_TEAM_ID", teamId],
  ["APPLE_KEY_ID", keyId],
  ["APPLE_SERVICES_ID", servicesId],
  ["APPLE_P8_PATH", p8Path],
].filter(([, v]) => !v)

if (missing.length > 0) {
  console.error("Faltan variables de entorno:")
  for (const [name] of missing) console.error(`  ${name}`)
  process.exit(1)
}

const privateKeyPem = readFileSync(p8Path, "utf8")
const privateKey = createPrivateKey(privateKeyPem)

const base64Url = (input) => Buffer.from(input).toString("base64url")

const iat = Math.floor(Date.now() / 1000)
const exp = iat + 86400 * 180 // máx. ~6 meses (Apple)

const header = base64Url(
  JSON.stringify({ alg: "ES256", kid: keyId, typ: "JWT" })
)
const payload = base64Url(
  JSON.stringify({
    iss: teamId,
    iat,
    exp,
    aud: "https://appleid.apple.com",
    sub: servicesId,
  })
)

const signingInput = `${header}.${payload}`
const signature = sign("sha256", Buffer.from(signingInput), {
  key: privateKey,
  dsaEncoding: "ieee-p1363",
})

const jwt = `${signingInput}.${base64Url(signature)}`

console.log("Pega esto en Supabase → Apple → Secret Key:\n")
console.log(jwt)
console.log(
  `\nCaduca: ${new Date(exp * 1000).toISOString().slice(0, 10)} (renueva antes)`
)
console.log(`Services ID (Client ID): ${servicesId}`)
