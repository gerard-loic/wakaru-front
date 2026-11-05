import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

const rootEl = document.getElementById('root')!

/** Affiche un message lisible plutôt qu'un écran noir muet si le boot échoue. */
function showFatal(err: unknown) {
  console.error(err)
  const message = err instanceof Error ? (err.stack ?? err.message) : String(err)
  rootEl.textContent = ''
  const box = document.createElement('pre')
  box.style.cssText =
    'max-width:680px;margin:12vh auto;padding:24px;white-space:pre-wrap;' +
    "font:13px/1.6 'JetBrains Mono',ui-monospace,monospace;color:#f4f0ea"
  box.textContent = `Erreur de démarrage\n\n${message}`
  rootEl.appendChild(box)
}

async function bootstrap() {
  try {
    const { default: App } = await import('./App')
    ReactDOM.createRoot(rootEl).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  } catch (err) {
    showFatal(err)
  }
}

void bootstrap()
