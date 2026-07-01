/**
 * RPMCreator — Integración con Ready Player Me.
 *
 * Muestra el creador de avatares de RPM en un iframe overlay.
 * Cuando el usuario termina, RPM envía la URL del GLB via postMessage.
 *
 * Para producción: registrar la app en https://readyplayer.me/developers
 * y reemplazar RPM_FRAME_URL con el subdominio propio
 * (ej. https://atlas-miniverso.readyplayer.me/avatar?frameApi)
 */

const RPM_FRAME_URL = 'https://demo.readyplayer.me/avatar?frameApi'
const RPM_ORIGIN    = 'https://demo.readyplayer.me'

export class RPMCreator {
  private overlay:   HTMLDivElement
  private iframe:    HTMLIFrameElement
  private resolveUrl: ((url: string) => void) | null = null

  constructor() {
    this.overlay = this.buildOverlay()
    this.iframe  = this.overlay.querySelector('iframe')!
  }

  // ─── UI ──────────────────────────────────────────────────────────────────

  private buildOverlay(): HTMLDivElement {
    const overlay = document.createElement('div')
    overlay.id = 'rpm-overlay'
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 200;
      background: rgba(8, 6, 4, 0.90);
      display: none;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 16px;
      font-family: Arial, sans-serif;
    `

    // Título
    const title = document.createElement('p')
    title.textContent = 'Crea tu avatar'
    title.style.cssText = `
      color: #F5E6C8;
      font-size: 18px;
      font-weight: bold;
      margin: 0;
      letter-spacing: 0.05em;
    `

    // Iframe del creador
    const frame = document.createElement('iframe')
    frame.allow  = 'camera *; microphone *'
    frame.src    = RPM_FRAME_URL
    frame.style.cssText = `
      width: min(860px, 94vw);
      height: min(640px, 82vh);
      border: none;
      border-radius: 14px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.6);
    `

    // Suscribirse a eventos RPM cuando el iframe carga
    frame.addEventListener('load', () => {
      frame.contentWindow?.postMessage(
        JSON.stringify({
          target:    'readyplayerme',
          type:      'subscribe',
          eventName: 'v1.**',
        }),
        '*'
      )
    })

    overlay.appendChild(title)
    overlay.appendChild(frame)
    document.body.appendChild(overlay)

    return overlay
  }

  // ─── API PÚBLICA ─────────────────────────────────────────────────────────

  /**
   * Abre el creador y devuelve la URL del GLB cuando el usuario termina.
   */
  open(): Promise<string> {
    this.overlay.style.display = 'flex'

    return new Promise((resolve) => {
      this.resolveUrl = resolve

      const handler = (event: MessageEvent) => {
        // RPM envía mensajes desde su dominio como string JSON
        const data = this.parseMessage(event.data)
        if (!data) return

        if (
          data.source    === 'readyplayerme' &&
          data.eventName === 'v1.avatar.exported' &&
          data.data?.url
        ) {
          window.removeEventListener('message', handler)
          this.close()
          resolve(data.data.url as string)
        }
      }

      window.addEventListener('message', handler)
    })
  }

  close() {
    this.overlay.style.display = 'none'
  }

  dispose() {
    this.overlay.remove()
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────

  private parseMessage(raw: unknown): Record<string, any> | null {
    if (typeof raw === 'string') {
      try { return JSON.parse(raw) } catch { return null }
    }
    if (typeof raw === 'object' && raw !== null) return raw as Record<string, any>
    return null
  }
}
