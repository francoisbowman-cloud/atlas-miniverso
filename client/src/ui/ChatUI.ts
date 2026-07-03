/**
 * ChatUI — barra de entrada fija + toasts efímeros solo para susurros y mensajes de sistema.
 *
 * Los mensajes de chat normal NO aparecen en la UI: se muestran como burbujas
 * 3D sobre la cabeza del avatar (LocalPlayer / RemotePlayer).
 *
 * Toasts: whispers (morado) y mensajes de sistema (gris).
 */
export class ChatUI {
  onSend:    ((text: string) => void) | null = null
  onWhisper: ((target: string, text: string) => void) | null = null
  /** Se dispara cuando el input recibe foco (para bloquear zoom de cámara) */
  onFocus:   (() => void) | null = null
  /** Se dispara cuando el input pierde foco */
  onBlur:    (() => void) | null = null

  private bar:         HTMLDivElement
  private input:       HTMLInputElement
  private toastWrap:   HTMLDivElement

  constructor() {
    this.injectStyles()
    this.buildUI()
  }

  // ─── API ──────────────────────────────────────────────────────────────────

  /** Mensajes de chat normal → solo burbuja 3D. No hacer nada en UI. */
  addMessage(_name: string, _text: string, _isSelf: boolean) {
    // Las burbujas 3D sobre los avatares manejan esto.
  }

  addWhisperMessage(fromName: string, toName: string, text: string, isSelf: boolean) {
    const label = isSelf ? `Tú → ${toName}` : `${fromName} → ti`
    this.toast(label, text, 'whisper')
  }

  addSystemMessage(text: string) {
    this.toast('', text, 'system')
  }

  get hasFocus(): boolean { return document.activeElement === this.input }
  focus() { this.input.focus() }

  dispose() {
    this.bar.remove()
    this.toastWrap.remove()
  }

  // ─── CONSTRUCCIÓN ─────────────────────────────────────────────────────────

  private buildUI() {
    // Contenedor de toasts (whisper + sistema)
    const tw = document.createElement('div')
    tw.id = 'chat-tw'
    document.body.appendChild(tw)
    this.toastWrap = tw

    // Barra pill fija en la parte inferior
    const bar = document.createElement('div')
    bar.id = 'chat-bar'
    this.bar = bar

    const input = document.createElement('input')
    input.type        = 'text'
    input.placeholder = 'Escribe… o /susurro @nombre'
    input.maxLength   = 200
    input.id          = 'chat-input'
    this.input        = input

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); this.send() }
      e.stopPropagation()
    })
    input.addEventListener('focus', () => this.onFocus?.())
    input.addEventListener('blur',  () => this.onBlur?.())

    // Evitar que el scroll sobre la barra haga zoom en la cámara
    bar.addEventListener('wheel', (e) => e.stopPropagation(), { passive: true })

    const sendBtn = document.createElement('button')
    sendBtn.id          = 'chat-send'
    sendBtn.textContent = '↑'
    sendBtn.addEventListener('click', () => this.send())

    bar.appendChild(input)
    bar.appendChild(sendBtn)
    document.body.appendChild(bar)
  }

  // ─── TOASTS ───────────────────────────────────────────────────────────────

  private toast(label: string, text: string, kind: 'whisper' | 'system') {
    // Máximo 4 toasts simultáneos
    while (this.toastWrap.children.length >= 4) {
      this.toastWrap.removeChild(this.toastWrap.firstChild!)
    }

    const el = document.createElement('div')
    el.className = `ct ct-${kind}`

    if (label && kind !== 'system') {
      const n = document.createElement('span')
      n.className   = 'ct-name'
      n.textContent = label + ': '
      el.appendChild(n)
    }

    const t = document.createElement('span')
    t.textContent = text
    el.appendChild(t)

    this.toastWrap.appendChild(el)
    setTimeout(() => el.remove(), 5000)
  }

  // ─── ENVIAR ───────────────────────────────────────────────────────────────

  private send() {
    const text = this.input.value.trim()
    if (!text) return
    const m = text.match(/^\/susurro\s+@(\S+)\s+(.+)$/i)
    if (m) { this.input.value = ''; this.onWhisper?.(m[1], m[2]); return }
    this.input.value = ''
    this.onSend?.(text)
  }

  // ─── ESTILOS ──────────────────────────────────────────────────────────────

  private injectStyles() {
    if (document.getElementById('chat-styles')) return
    const s = document.createElement('style')
    s.id = 'chat-styles'
    s.textContent = `
      /* Toasts: whisper + sistema */
      #chat-tw {
        position: fixed;
        bottom: 72px;
        left: 50%;
        transform: translateX(-50%);
        width: min(440px, calc(100vw - 32px));
        display: flex; flex-direction: column; gap: 6px;
        align-items: center;
        pointer-events: none; z-index: 99;
      }
      @media (pointer: coarse) {
        #chat-tw { bottom: 78px; }
      }

      .ct {
        display: inline-flex; align-items: baseline; flex-wrap: wrap;
        padding: 7px 14px; border-radius: 20px;
        font-family: Arial, sans-serif; font-size: 13px; line-height: 1.4;
        max-width: 100%; word-break: break-word;
        animation: ct-anim 5s ease forwards;
      }
      .ct-whisper {
        background: rgba(40,10,55,.90);
        border: 1px solid rgba(180,110,220,.40);
        color: #EDD0F5; font-style: italic;
        backdrop-filter: blur(4px);
      }
      .ct-system {
        background: rgba(8,6,4,.70);
        border: 1px solid rgba(60,36,12,.30);
        color: #7A6040; font-size: 11px;
      }
      .ct-name { font-weight: bold; font-size: 11px; color: #C87BC8; margin-right: 4px; flex-shrink: 0; }

      @keyframes ct-anim {
        0%   { opacity:0; transform:translateY(6px); }
        10%  { opacity:1; transform:translateY(0); }
        75%  { opacity:1; }
        100% { opacity:0; }
      }

      /* Barra de entrada */
      #chat-bar {
        position: fixed;
        left: 50%;
        transform: translateX(-50%);
        bottom: calc(16px + env(safe-area-inset-bottom, 0px));
        width: min(480px, calc(100vw - 32px));
        display: flex; align-items: center; gap: 8px;
        background: rgba(8,6,4,.88);
        border: 1px solid rgba(60,36,12,.55);
        border-radius: 28px;
        padding: 6px 8px;
        z-index: 100;
        backdrop-filter: blur(6px);
        pointer-events: all;
        font-family: Arial, sans-serif;
        box-shadow: 0 4px 24px rgba(0,0,0,.35);
      }
      @media (pointer: coarse) {
        #chat-bar {
          left: 50%;
          transform: translateX(-50%);
          width: calc(100vw - 32px);
        }
      }
      @media (max-width: 360px) {
        #chat-bar { width: calc(100vw - 20px); }
      }

      #chat-input {
        flex: 1; background: transparent; border: none; outline: none;
        color: #F0E0C0; font-size: 14px; font-family: Arial, sans-serif;
        padding: 4px 6px; min-width: 0;
      }
      #chat-input::placeholder { color: #3A2010; }

      #chat-send {
        width: 38px; height: 38px; flex-shrink: 0;
        background: #C8956C; color: #0A0806;
        border: none; border-radius: 50%;
        font-size: 16px; font-weight: bold; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: opacity .15s; touch-action: manipulation;
      }
      #chat-send:hover { opacity: .82; }
      #chat-send:active { opacity: .65; }
    `
    document.head.appendChild(s)
  }
}
