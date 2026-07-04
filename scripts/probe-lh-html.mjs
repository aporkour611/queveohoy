const ua =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/150.0.0.0 Safari/537.36"
const res = await fetch("https://queveohoy.es/", { headers: { "User-Agent": ua } })
const html = await res.text()
console.log("len", html.length)
console.log("3794", (html.match(/3794/g) || []).length)
console.log("scripts", (html.match(/<script/gi) || []).length)
console.log("modulepreload", (html.match(/modulepreload/gi) || []).length)
console.log("__next_f", html.includes("__next_f"))
console.log("lh-audit marker", html.includes("pasapalabra"))
