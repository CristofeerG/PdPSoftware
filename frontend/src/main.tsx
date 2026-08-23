import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import './index.css'
import App from './App.tsx'

// Chequea si hay una version nueva del service worker cada 5 minutos y la
// aplica sola (registerType: autoUpdate), asi el sistema se actualiza en la
// mesa de trabajo sin depender de que alguien haga un refresh manual.
const CHEQUEO_ACTUALIZACION_MS = 5 * 60 * 1000
registerSW({
  immediate: true,
  onRegisteredSW(_swScriptUrl, registration) {
    if (!registration) return
    setInterval(() => {
      if (registration.installing || !navigator.onLine) return
      registration.update()
    }, CHEQUEO_ACTUALIZACION_MS)
  },
})

// El bundle del sistema de diseno (public/ds/_ds_bundle.js) referencia `React`
// como global (no es un modulo ES) — por eso se expone aca antes de cargarlo,
// para que use la misma instancia de React que el resto de la app.
;(window as unknown as { React: typeof React }).React = React

function cargarSistemaDeDiseno(): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = '/ds/_ds_bundle.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('No se pudo cargar el sistema de diseno'))
    document.head.appendChild(script)
  })
}

const root = document.getElementById('root')!

cargarSistemaDeDiseno()
  .then(() => {
    createRoot(root).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
  .catch((error) => {
    console.error(error)
    root.innerHTML =
      '<p style="padding:24px;font-family:sans-serif;color:#F5F1E8;background:#1D1E1C;">No se pudo cargar la aplicación. Recargá la página.</p>'
  })
