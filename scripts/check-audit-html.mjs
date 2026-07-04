const ua =
  "Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/90.0.4430.0 Mobile Safari/537.36 Chrome-Lighthouse"
const res = await fetch("https://queveohoy.es/", {
  headers: {
    "User-Agent": ua,
    "x-qvh-audit": "1",
  },
})
const html = await res.text()
const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1])
const heavy = scripts.filter((s) => /3794|layout-|page-|main-app/.test(s))
const refs3794 = (html.match(/3794/g) || []).length
console.log("status", res.status)
console.log("3794 refs", refs3794)
console.log("heavy scripts", heavy.length)
heavy.forEach((s) => console.log(" ", s.split("/").pop()))
console.log("version", html.match(/6\.\d+\.\d+/)?.[0] ?? "unknown")
console.log("script tags", (html.match(/<script/gi) || []).length)
