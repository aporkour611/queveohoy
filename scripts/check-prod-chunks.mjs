const h = await fetch("https://queveohoy.es/").then((r) => r.text())
const refs = h.match(/3794[^"']*/g) ?? []
console.log("3794 refs:", refs.length)
if (refs.length) console.log(refs.slice(0, 5).join("\n"))
const scripts = [...h.matchAll(/<script[^>]+src="([^"]+)"/g)].map((x) => x[1])
console.log("critical scripts:", scripts.filter((s) => /3794|HomeFeed|page-/.test(s)).join("\n") || "(none)")
