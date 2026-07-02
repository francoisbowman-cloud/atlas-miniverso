/**
 * Joystick virtual para dispositivos táctiles.
 *
 * Solo visible en pantallas con pointer:coarse (táctil).
 * Emite dirección normalizada {x, y} continua mientras se mantiene pulsado.
 * onChange se llama con (0, 0) al soltar.
 */
export class Joystick {
  /** Dirección actual: x ∈ [-1,1], y ∈ [-1,1] */
  onChange: ((x: number, y: number) => void) | null = null

  private wrap:   HTMLDivElement
  private base:   HTMLDivElement
  private thumb:  HTMLDivElement

  private active     = false
  private touchId:   number | null = null
  private originX    = 0
  private originY    = 0

  private readonly RADIUS     = 44   // radio de la base (px)
  private readonly THUMB_MAX  = 34   // desplazamiento máximo del thumb

  constructor() {
    this.injectStyles()
    this.buildUI()
    this.bindEvents()
  }

  dispose() {
    this.wrap.remove()
  }

  // ─── CONSTRUCCIÓN ─────────────────────────────────────────────────────────

  private buildUI() {
    const wrap = document.createElement('div')
    wrap.id = 'joy-wrap'

    const base = document.createElement('div')
    base.id = 'joy-base'

    const thumb = document.createElement('div')
    thumb.id = 'joy-thumb'

    base.appendChild(thumb)
    wrap.appendChild(base)
    document.body.appendChild(wrap)

    this.wrap  = wrap
    this.base  = base
    this.thumb = thumb
  }

  // ─── EVENTOS ──────────────────────────────────────────────────────────────

  private bindEvents() {
    this.base.addEventListener('touchstart',  (e) => this.onStart(e),  { passive: false })
    this.base.addEventListener('touchmove',   (e) => this.onMove(e),   { passive: false })
    this.base.addEventListener('touchend',    (e) => this.onEnd(e),    { passive: false })
    this.base.addEventListener('touchcancel', (e) => this.onEnd(e),    { passive: false })
  }

  private onStart(e: TouchEvent) {
    if (this.active) return
    e.preventDefault()
    const t = e.changedTouches[0]
    this.touchId = t.identifier
    this.active  = true
    const rect   = this.base.getBoundingClientRect()
    this.originX = rect.left + rect.width  / 2
    this.originY = rect.top  + rect.height / 2
    this.update(t.clientX, t.clientY)
  }

  private onMove(e: TouchEvent) {
    if (!this.active) return
    e.preventDefault()
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i]
      if (t.identifier === this.touchId) {
        this.update(t.clientX, t.clientY)
        break
      }
    }
  }

  private onEnd(e: TouchEvent) {
    if (!this.active) return
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === this.touchId) {
        this.reset()
        break
      }
    }
  }

  private update(cx: number, cy: number) {
    const dx   = cx - this.originX
    const dy   = cy - this.originY
    const dist = Math.sqrt(dx * dx + dy * dy)
    const capped = Math.min(dist, this.THUMB_MAX)
    const angle  = Math.atan2(dy, dx)

    const tx = Math.cos(angle) * capped
    const ty = Math.sin(angle) * capped

    this.thumb.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`

    // Normalizar: x → movimiento lateral, y → adelante/atrás (negativo = avanzar)
    const nx = dist > 4 ? (dx / this.THUMB_MAX) : 0
    const ny = dist > 4 ? (dy / this.THUMB_MAX) : 0
    const mx = Math.max(-1, Math.min(1, nx))
    const my = Math.max(-1, Math.min(1, ny))
    this.onChange?.(mx, my)
  }

  private reset() {
    this.active  = false
    this.touchId = null
    this.thumb.style.transform = 'translate(-50%, -50%)'
    this.onChange?.(0, 0)
  }

  // ─── ESTILOS ──────────────────────────────────────────────────────────────

  private injectStyles() {
    if (document.getElementById('joy-styles')) return
    const s = document.createElement('style')
    s.id = 'joy-styles'
    s.textContent = `
      /* Solo visible en dispositivos táctiles */
      #joy-wrap {
        display: none;
        position: fixed;
        left: 16px;
        bottom: calc(70px + env(safe-area-inset-bottom, 0px));
        z-index: 98;
        pointer-events: none;
      }
      @media (pointer: coarse) {
        #joy-wrap { display: block; }
      }

      #joy-base {
        width: 88px;
        height: 88px;
        border-radius: 50%;
        background: rgba(8, 6, 4, 0.55);
        border: 2px solid rgba(200, 149, 108, 0.30);
        backdrop-filter: blur(4px);
        position: relative;
        pointer-events: all;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
      }

      #joy-thumb {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(200, 149, 108, 0.70);
        border: 1.5px solid rgba(212, 169, 106, 0.50);
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        transition: transform 0.04s linear;
      }
    `
    document.head.appendChild(s)
  }
}
