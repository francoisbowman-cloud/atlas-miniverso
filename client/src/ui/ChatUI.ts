/**
 * ChatUI — panel de mensajes colapsable.
 *
 * • Colapsado: solo muestra el botón con badge de no-leídos
 * • Expandido: historial de mensajes + input
 * • Timestamps en cada mensaje
 * • WASD no se dispara cuando el input tiene foco
 */
export class ChatUI {
  onSend:    ((text: string) => void) | null = null
  onWhisper: ((target: string, text: string) => void) | null = null

  private panel:     HTMLDivElement
  private list:      HTMLDivElement
  private input:     HTMLInputElement
  private badge:     HTMLSpanElement
  private body:      HTMLDivElement

  private _expanded  = true
  private _unread    = 0
  private MAX_MSG    = 60

  constructor() {
    this.injectStyles()
    const els = this.buildPanel()
    this.panel = els.panel
    this.list  = els.list
    this.input = els.input
    this.badge = els.badge
    this.body  = els.body
  }

  // ─── API ──────────────────────────────────────────────────────────────────

  addMessage(name: string, text: string, isSelf: boolean) {
    while (this.list.children.length >= this.MAX_MSG) {
      this.list.removeChild(this.list.firstChild!)
    }

    const now = new Date()
    const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`

    const row = document.createElement('div')
    row.className = isSelf ? 'chat-row chat-self' : 'chat-row'

    const meta = document.createElement('div')
    meta.className = 'chat-meta'
    meta.innerHTML = `<span class="chat-name">${esc(name)}</span><span class="chat-time">${time}</span>`

    const bubble = document.createElement('div')
    bubble.className   = 'chat-bubble'
    bubble.textContent = text

    row.appendChild(meta)
    row.appendChild(bubble)
    this.list.appendChild(row)
    this.list.scrollTop = this.list.scrollHeight

    // Badge de no-leídos cuando está colapsado
    if (!this._expanded) {
      this._unread++
      this.badge.textContent = String(this._unread)
      this.badge.style.display = 'flex'
    }
  }

  get hasFocus(): boolean { return document.activeElement === this.input }

  focus() { this.input.focus() }

  dispose() { this.panel.remove() }

  // ─── CONSTRUCCIÓN ─────────────────────────────────────────────────────────

  private buildPanel() {
    const panel = document.createElement('div')
    panel.id = 'chat-panel'

    // ── Header (siempre visible) ──
    const header = document.createElement('div')
    header.id = 'chat-header'
    header.title = 'Abrir / cerrar chat'

    const icon = document.createElement('span')
    icon.textContent = '💬'
    icon.style.fontSize = '15px'

    const label = document.createElement('span')
    label.id = 'chat-label'
    label.textContent = 'Chat'

    const badge = document.createElement('span')
    badge.id = 'chat-badge'
    badge.style.display = 'none'

    const toggle = document.createElement('span')
    toggle.id = 'chat-toggle'
    toggle.textContent = '▾'

    header.appendChild(icon)
    header.appendChild(label)
    header.appendChild(badge)
    header.appendChild(toggle)
    panel.appendChild(header)

    // ── Cuerpo (colapsable) ──
    const body = document.createElement('div')
    body.id = 'chat-body'

    const list = document.createElement('div')
    list.id = 'chat-list'
    body.appendChild(list)

    const inputRow = document.createElement('div')
    inputRow.id = 'chat-input-row'

    const input = document.createElement('input')
    input.type        = 'text'
    input.placeholder = 'Escribe un mensaje… (Enter)'
    input.maxLength   = 200
    input.id          = 'chat-input'

    const btn = document.createElement('button')
    btn.id          = 'chat-send'
    btn.textContent = '↑'

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); this.send() }
      e.stopPropagation()
    })
    btn.addEventListener('click', () => this.send())

    inputRow.appendChild(input)
    inputRow.appendChild(btn)
    body.appendChild(inputRow)
    panel.appendChild(body)

    document.body.appendChild(panel)
    this.makeDraggable(panel, header, () => this.setExpanded(!this._expanded))
    return { panel, list, input, badge, body }
  }

  // ─── DRAG ─────────────────────────────────────────────────────────────────

  private makeDraggable(panel: HTMLElement, handle: HTMLElement, onTap: () => void) {
    let sx = 0, sy = 0, sl = 0, st = 0
    let dragging = false, moved = false

    const xy = (e: MouseEvent | TouchEvent) => {
      const s = e instanceof TouchEvent ? e.touches[0] : e
      return { x: s.clientX, y: s.clientY }
    }

    const onStart = (e: MouseEvent | TouchEvent) => {
      const t = e.target as HTMLElement
      if (t.tagName === 'BUTTON' || t.tagName === 'INPUT') return
      const r = panel.getBoundingClientRect()
      const p = xy(e)
      sx = p.x; sy = p.y; sl = r.left; st = r.top
      dragging = true; moved = false
      panel.style.bottom = 'auto'; panel.style.right = 'auto'
      panel.style.left = sl + 'px'; panel.style.top = st + 'px'
      document.addEventListener('mousemove', onMove)
      document.addEventListener('touchmove', onMove, { passive: false })
      document.addEventListener('mouseup', onEnd)
      document.addEventListener('touchend', onEnd)
    }

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging) return
      if (e instanceof TouchEvent) e.preventDefault()
      const p = xy(e)
      const dx = p.x - sx, dy = p.y - sy
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) moved = true
      panel.style.left = Math.max(0, sl + dx) + 'px'
      panel.style.top  = Math.max(0, st + dy) + 'px'
    }

    const onEnd = () => {
      dragging = false
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('mouseup', onEnd)
      document.removeEventListener('touchend', onEnd)
      if (!moved) onTap()
    }

    handle.addEventListener('mousedown', onStart)
    handle.addEventListener('touchstart', onStart, { passive: true })
  }

  private setExpanded(val: boolean) {
    this._expanded = val
    this.body.style.display  = val ? 'flex' : 'none'
    const toggle = this.panel.querySelector<HTMLSpanElement>('#chat-toggle')!
    toggle.textContent = val ? '▾' : '▸'

    if (val) {
      this._unread = 0
      this.badge.style.display = 'none'
      this.list.scrollTop = this.list.scrollHeight
    }
  }

  private send() {
    const text = this.input.value.trim()
    if (!text) return

    // Comando /susurro @nombre mensaje
    const m = text.match(/^\/susurro\s+@(\S+)\s+(.+)$/i)
    if (m) {
      this.input.value = ''
      this.onWhisper?.(m[1], m[2])
      return
    }

    this.input.value = ''
    this.onSend?.(text)
  }

  /** Muestra un mensaje de susurro (privado) en el chat con estilo diferenciado */
  addWhisperMessage(fromName: string, toName: string, text: string, isSelf: boolean) {
    while (this.list.children.length >= this.MAX_MSG) {
      this.list.removeChild(this.list.firstChild!)
    }
    const now = new Date()
    const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`

    const row = document.createElement('div')
    row.className = isSelf ? 'chat-row chat-self chat-whisper-row' : 'chat-row chat-whisper-row'

    const meta = document.createElement('div')
    meta.className = 'chat-meta'
    const label = isSelf
      ? `💬 ${esc(fromName)} → ${esc(toName)}`
      : `💬 ${esc(fromName)} → ti`
    meta.innerHTML = `<span class="chat-name chat-whisper-name">${label}</span><span class="chat-time">${time}</span>`

    const bubble = document.createElement('div')
    bubble.className   = 'chat-bubble chat-whisper-bubble'
    bubble.textContent = text

    row.appendChild(meta)
    row.appendChild(bubble)
    this.list.appendChild(row)
    this.list.scrollTop = this.list.scrollHeight

    if (!this._expanded) {
      this._unread++
      this.badge.textContent = String(this._unread)
      this.badge.style.display = 'flex'
    }
  }

  /** Muestra un mensaje de sistema (error, aviso) en el chat */
  addSystemMessage(text: string) {
    const row = document.createElement('div')
    row.className = 'chat-row'
    const bubble = document.createElement('div')
    bubble.className   = 'chat-bubble chat-system-bubble'
    bubble.textContent = text
    row.appendChild(bubble)
    this.list.appendChild(row)
    this.list.scrollTop = this.list.scrollHeight
  }

  // ─── ESTILOS ──────────────────────────────────────────────────────────────

  private injectStyles() {
    if (document.getElementById('chat-styles')) return
    const s = document.createElement('style')
    s.id = 'chat-styles'
    s.textContent = `
      #chat-panel {
        position: fixed;
        left: 16px;
        bottom: calc(16px + env(safe-area-inset-bottom, 0px));
        width: min(420px, calc(100vw - 32px));
        display: flex; flex-direction: column;
        z-index: 100;
        font-family: Arial, sans-serif;
        margin-bottom: env(safe-area-inset-bottom, 0px);
        cursor: grab;
      }
      @media (max-width: 500px) {
        #chat-panel { bottom: 70px; width: min(320px, calc(100vw - 32px)); }
      }

      /* ── Header ── */
      #chat-header {
        display: flex; align-items: center; gap: 7px;
        padding: 10px 12px;
        background: rgba(10, 8, 6, 0.88);
        border: 1px solid rgba(60, 36, 12, 0.55);
        border-radius: 10px 10px 0 0;
        cursor: pointer;
        user-select: none;
        pointer-events: all;
        backdrop-filter: blur(4px);
        transition: background .15s;
        touch-action: manipulation;
        min-height: 44px;
      }
      #chat-header:hover { background: rgba(20, 14, 8, 0.92); }

      #chat-label {
        color: #C8956C; font-size: 12px; font-weight: bold;
        letter-spacing: .06em; flex: 1;
      }

      #chat-badge {
        min-width: 18px; height: 18px;
        background: #C8956C; color: #0A0806;
        border-radius: 9px; font-size: 10px;
        font-weight: bold; align-items: center; justify-content: center;
        padding: 0 4px;
      }

      #chat-toggle {
        color: #6A4828; font-size: 11px;
      }

      /* ── Body ── */
      #chat-body {
        display: flex; flex-direction: column;
        background: rgba(8, 6, 4, 0.82);
        border: 1px solid rgba(60, 36, 12, 0.55);
        border-top: none;
        border-radius: 0 0 10px 10px;
        backdrop-filter: blur(4px);
        pointer-events: all;
      }

      /* ── Lista de mensajes ── */
      #chat-list {
        max-height: min(200px, 30vh); overflow-y: auto;
        display: flex; flex-direction: column;
        gap: 6px; padding: 10px 10px 6px;
        scrollbar-width: thin;
        scrollbar-color: #2E1A0A transparent;
      }
      #chat-list::-webkit-scrollbar { width: 3px; }
      #chat-list::-webkit-scrollbar-thumb { background: #2E1A0A; border-radius: 2px; }

      .chat-row {
        display: flex; flex-direction: column;
        align-items: flex-start; gap: 2px;
      }
      .chat-self { align-items: flex-end; }

      .chat-meta {
        display: flex; align-items: baseline; gap: 5px;
        padding: 0 4px;
      }
      .chat-name {
        font-size: 10px; font-weight: bold;
        color: #C8956C; letter-spacing: .04em;
      }
      .chat-self .chat-name { color: #D4A96A; }
      .chat-time {
        font-size: 9px; color: #3A2010;
      }

      .chat-bubble {
        font-size: 13px; color: #F0E0C0; line-height: 1.4;
        background: rgba(18, 12, 6, 0.85);
        border: 1px solid rgba(50, 28, 8, 0.60);
        border-radius: 10px; padding: 5px 10px;
        max-width: 240px; word-break: break-word;
      }
      .chat-self .chat-bubble {
        background: rgba(35, 20, 6, 0.90);
        border-color: rgba(200, 149, 108, 0.30);
      }

      /* ── Input ── */
      #chat-input-row {
        display: flex; gap: 6px;
        padding: 6px 10px 10px;
        border-top: 1px solid rgba(40, 24, 8, 0.50);
      }

      #chat-input {
        flex: 1;
        background: rgba(14, 10, 6, 0.80);
        border: 1px solid #2A1608;
        border-radius: 7px; padding: 7px 10px;
        color: #F0E0C0; font-size: 12px;
        font-family: Arial, sans-serif; outline: none;
        transition: border-color .15s;
      }
      #chat-input:focus      { border-color: #C8956C; }
      #chat-input::placeholder { color: #3A2010; }

      #chat-send {
        width: 40px; height: 40px; flex-shrink: 0;
        background: #C8956C; color: #0A0806;
        border: none; border-radius: 7px;
        font-size: 15px; font-weight: bold;
        cursor: pointer; transition: opacity .15s;
        touch-action: manipulation;
      }
      #chat-send:hover { opacity: .82; }

      /* ── Whisper ── */
      .chat-whisper-name { color: #C87BC8 !important; }
      .chat-whisper-bubble {
        background: rgba(40, 10, 55, 0.88) !important;
        border-color: rgba(180, 110, 220, 0.35) !important;
        font-style: italic;
        color: #EDD0F5 !important;
      }
      /* ── Sistema ── */
      .chat-system-bubble {
        background: rgba(6, 6, 6, 0.70) !important;
        border-color: rgba(80, 60, 30, 0.40) !important;
        color: #7A6040 !important;
        font-size: 11px !important;
        font-style: italic;
      }
    `
    document.head.appendChild(s)
  }
}

function esc(s: string) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}
