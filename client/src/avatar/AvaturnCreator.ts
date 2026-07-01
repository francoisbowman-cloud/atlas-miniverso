/**
 * AvaturnCreator — Integración con Avaturn (reemplaza Ready Player Me).
 *
 * Avaturn es la alternativa más similar a RPM:
 * - iframe embed con SDK npm
 * - Exporta GLB directamente
 * - Gratis para desarrollo
 *
 * Para producción: registrar en https://avaturn.me/developers
 * y configurar AVATURN_URL con el subdominio propio.
 *
 * Docs: https://docs.avaturn.me/docs/integration/web/
 */

// AVATURN_URL para demo (sin API key). En producción usar subdominio propio.
const AVATURN_URL = 'https://app.avaturn.me'

export class AvaturnCreator {
  private overlay:   HTMLDivElement
  private container: HTMLDivElement

  constructor() {
    this.overlay   = this.buildOverlay()
    this.container = this.overlay.querySelector('#avaturn-container') as HTMLDivElement
  }

  // ─── UI ──────────────────────────────────────────────────────────────────

  private buildOverlay(): HTMLDivElement {
    const overlay = document.createElement('div')
    overlay.id = 'avaturn-overlay'
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 200;
      background: rgba(8, 6, 4, 0.92);
      display: none;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 14px;
      font-family: Arial, sans-serif;
    `

    const title = document.createElement('p')
    title.textContent = 'Crea tu avatar'
    title.style.cssText = `
      color: #F5E6C8;
      font-size: 18px;
      font-weight: bold;
      margin: 0;
      letter-spacing: 0.05em;
    `

    // Contenedor donde Avaturn SDK montará su iframe
    const container = document.createElement('div')
    container.id = 'avaturn-container'
    container.style.cssText = `
      width: min(860px, 94vw);
      height: min(640px, 82vh);
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 8px 40px rgba(0,0,0,0.6);
    `

    overlay.appendChild(title)
    overlay.appendChild(container)
    document.body.appendChild(overlay)

    return overlay
  }

  // ─── API PÚBLICA ─────────────────────────────────────────────────────────

  /**
   * Abre el creador de Avaturn y devuelve la URL del GLB cuando termina.
   */
  async open(): Promise<string> {
    this.overlay.style.display = 'flex'

    return new Promise(async (resolve, reject) => {
      try {
        // Importar el SDK de Avaturn dinámicamente
        const { AvaturnSDK } = await import('@avaturn/sdk')

        const sdk = new AvaturnSDK()

        // El SDK espera el elemento contenedor, no un selector en string.
        await sdk.init(this.container, {
          url: AVATURN_URL,
        })

        // Evento que dispara Avaturn cuando el usuario exporta su avatar
        sdk.on('export', (data: { url: string }) => {
          this.close()
          resolve(data.url)
        })

      } catch (err) {
        console.error('[Atlas] Error inicializando Avaturn SDK:', err)
        this.close()
        reject(err)
      }
    })
  }

  close() {
    this.overlay.style.display = 'none'
  }

  dispose() {
    this.overlay.remove()
  }
}
