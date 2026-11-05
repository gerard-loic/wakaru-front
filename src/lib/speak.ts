export function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return
  const u = new SpeechSynthesisUtterance(text)
  u.lang = "ja-JP"
  u.rate = 0.9
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
}
