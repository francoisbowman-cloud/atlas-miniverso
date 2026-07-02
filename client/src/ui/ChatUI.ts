/**
 * ChatUI — barra de entrada fija + burbujas flotantes.
 *
 * Diseño:
 *  • Barra pill fija en la parte inferior — nunca crece
 *  • Mensajes nuevos aparecen como toasts que se desvanecen en ~4.5 s
 *  • Botón 📋 abre/cierra historial colapsable
 *  • /susurro @nombre mensaje → whisper privado
 */

interface MsgEntry {
  name:    string
  text:    string
  time:    string
  isSelf:  boolean
  kind:    'chat' | 'whisper' | 'system'
  toName?: string
}

export class ChatUI {
  onSend:    ((text: string) => void) | null = null
  onWhisper: ((target: string, text: string) => void) | null = null

  private bar:          HTMLDivElement
  private input:        HTMLInputElement
  private badge:        HTMLSpanElement
  private bubblesWrap:  HTMLDivElement
  private histPanel:    HTMLDivElement
  private histList:     HTMLDivElement

  private _histOpen = false
  private _unread   = 0
  private msgs:     MsgEntry[] = []
  private MAX_MSG   = 100

  constructor() {
    this.injectStyles()
    this.buildUI()
  }

  // ─── API ──────────────────────────────────────────────────────────────────

  addMessage(name: string, text: string, isSelf: boolean) {
    const entry = this.store({ name, text, isSelf, kind: 'chat' })
    if (this._histOpen) {
      this.appendHist(entry)
    } else {
      this.toast(isSelf ? 'Tú' : name, text, isSelf ? 'self' : 'chat')
      if (!isSelf) this.incUnread()
    }
  }

  addWhisperMessage(fromName: string, toName: string, text: string, isSelf: boolean) {
    const entry = this.store({ name: fromName, text, isSelf, kind: 'whisper', toName })
    const label = isSelf ? `Tú → ${toName}` : `${fromName} → ti`
    if (this._histOpen) {
      this.appendHist(entry)
    } else {
      this.toast(label, text, 'whisper')
      this.incUnread()
    }
  }

  addSystemMessage(text: string) {
    const entry = this.store({ name: '', text, isSelf: false, kind: 'system' })
    if (this._histOpen) this.appendHist(entry)
    else this.toast('', text, 'system')
  }

  get hasFocus(): boolean { return document.activeElement === this.input }
  focus() { this.input.focus() }

  dispose() {
    this.bar.remove()
    this.bubblesWrap.remove()
    this.histPanel.remove()
  }

  // ─── CONSTRUCCIÓN ─────────────────────────────────────────────────────────

  private buildUI() {
    // ── Contenedor de toasts flotantes ──
    const bw = document.createElement('div')
    bw.id = 'chat-bw'
    document.body.appendChild(bw)
    this.bubblesWrap = bw

    // ── Panel de historial ──
    const hp = document.createElement('div')
    hp.id = 'chat-hist'
    hp.style.display = 'none'

    const hh = document.createElement('div')
    hh.id = 'chat-hist-head'
    const htitle = document.createElement('span')
    htitle.textContent = 'Historial'
    htitle.style.cssText = 'color:#C8956C;font-size:11px;font-weight:bold;letter-spacing:.05em;'
    const hclose = document.createElement('button')
    hclose.id = 'chat-hist-close'
    hclose.textContent = '✕'
    hclose.addEventListener('click', () => this.openHist(false))
    hh.appendChild(htitle)
    hh.appendChild(hclose)

    const hl = document.createElement('div')
    hl.id = 'chat-hist-list'
    this.histList = hl

    hp.appendChild(hh)
    hp.appendChild(hl)
    document.body.appendChild(hp)
    this.histPanel = hp

    // ── Barra de entrada ──
    const bar = document.createElement('div')
    bar.id = 'chat-bar'
    this.bar = bar

    const histBtn = document.createElement('button')
    histBtn.id = 'chat-hist-btn'
    histBtn.title = 'Historial del chat'
    histBtn.textContent = '💬'

    const badge = document.createElement('span')
    badge.id = 'chat-badge'
    badge.style.display = 'none'
    this.badge = badge
    histBtn.appendChild(badge)
    histBtn.addEventListener('click', () => this.openHist(!this._histOpen))

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

    const sendBtn = document.createElement('button')
    sendBtn.id          = 'chat-send'
    sendBtn.textContent = '↑'
    sendBtn.addEventListener('click', () => this.send())

    bar.appendChild(histBtn)
    bar.appendChild(input)
    bar.appendChild(sendBtn)
    document.body.appendChild(bar)
  }

  // ─── TOASTS ───────────────────────────────────────────────────────────────

  private toast(label: string, text: string, kind: 'chat' | 'self' | 'whisper' | 'system') {
    // Máximo 5 burbujas simultáneas
    while (this.bubblesWrap.children.length >= 5) {
      this.bubblesWrap.removeChild(this.bubblesWrap.firstChild!)
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

    this.bubblesWrap.appendChild(el)
    setTimeout(() => el.remove(), 4500)
  }

  // ─── HISTORIAL ────────────────────────────────────────────────────────────

  private openHist(open: boolean) {
    this._histOpen = open
    this.histPanel.style.display = open ? 'flex' : 'none'
    if (open) {
      this._unread = 0
      this.badge.style.display = 'none'
      this.histList.innerHTML = ''
      this.msgs.forEach(m => this.appendHist(m))
      this.histList.scrollTop = this.histList.scrollHeight
    }
  }

  private appendHist(e: MsgEntry) {
    const row = document.createElement('div')
    row.className = `hr hr-${e.kind}${e.isSelf ? ' hr-self' : ''}`

    if (e.kind !== 'system') {
      const meta = document.createElement('div')
      meta.className = 'hr-meta'
      let nm = e.isSelf ? 'Tú' : e.name
      if (e.kind === 'whisper') nm = e.isSelf ? `💬 Tú → ${e.toName}` : `💬 ${e.name} → ti`
      meta.innerHTML = `<span class="hr-name">${esc(nm)}</span><span class="hr-time">${e.time}</span>`
      row.appendChild(meta)
    }

    const b = document.createElement('div')
    b.className   = 'hr-bub'
    b.textContent = e.text
    row.appendChild(b)

    this.histList.appendChild(row)
    this.histList.scrollTop = this.histList.scrollHeight
  }

  private incUnread() {
    this._unread++
    this.badge.textContent = String(this._unread)
    this.badge.style.display = 'flex'
  }

  // ─── STORE ────────────────────────────────────────────────────────────────

  private store(opts: Omit<MsgEntry, 'time'>): MsgEntry {
    while (this.msgs.length >= this.MAX_MSG) this.msgs.shift()
    const d = new Date()
    const time = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
    const entry: MsgEntry = { ...opts, time }
    this.msgs.push(entry)
    return entry
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
      /* Toasts flotantes */
      #chat-bw {
        position: fixed;
        bottom: 70px;
        left: 16px;
        width: min(420px, calc(100vw - 32px));
        display: flex; flex-direction: column; gap: 5px;
        pointer-events: none; z-index: 99;
      }
      @media (pointer: coarse) {
        #chat-bw { left: 116px; width: calc(100vw - 132px); bottom: 76px; }
      }

      .ct {
        display: inline-flex; align-items: baseline; flex-wrap: wrap;
        padding: 6px 13px; border-radius: 18px;
        font-family: Arial, sans-serif; font-size: 13px; line-height: 1.4;
        max-width: 100%; word-break: break-word;
        animation: ct-anim 4.5s ease forwards;
      }
      .ct-chat {
        background: rgba(10,8,6,.84); border: 1px solid rgba(60,36,12,.55);
        color: #F0E0C0; backdrop-filter: blur(4px);
      }
      .ct-self {
        align-self: flex-end;
        background: rgba(35,20,6,.90); border: 1px solid rgba(200,149,108,.30);
        color: #F0E0C0;
      }
      .ct-whisper {
        background: rgba(40,10,55,.88); border: 1px solid rgba(180,110,220,.35);
        color: #EDD0F5; font-style: italic;
      }
      .ct-system {
        background: rgba(6,6,6,.65); border: 1px solid rgba(60,40,20,.35);
        color: #6A5030; font-size: 11px; font-style: italic;
      }
      .ct-name { font-weight: bold; font-size: 11px; color: #C8956C; margin-right: 3px; flex-shrink: 0; }
      .ct-whisper .ct-name { color: #C87BC8; }

      @keyframes ct-anim {
        0%   { opacity:0; transform:translateY(5px); }
        12%  { opacity:1; transform:translateY(0); }
        72%  { opacity:1; }
        100% { opacity:0; }
      }

      /* Historial */
      #chat-hist {
        position: fixed; bottom: 70px; left: 16px;
        width: min(360px, calc(100vw - 32px));
        max-height: min(300px, 44vh);
        background: rgba(8,6,4,.94);
        border: 1px solid rgba(60,36,12,.55);
        border-radius: 12px;
        z-index: 100; display: flex; flex-direction: column;
        backdrop-filter: blur(6px);
        font-family: Arial, sans-serif; pointer-events: all;
      }
      @media (pointer: coarse) {
        #chat-hist { left: 116px; width: calc(100vw - 132px); bottom: 76px; }
      }

      #chat-hist-head {
        display: flex; align-items: center; justify-content: space-between;
        padding: 8px 12px; border-bottom: 1px solid rgba(40,24,8,.50); flex-shrink: 0;
      }
      #chat-hist-close {
        background: none; border: none; color: #4A2E12;
        font-size: 12px; cursor: pointer; padding: 4px 6px; transition: color .15s;
      }
      #chat-hist-close:hover { color: #C8956C; }

      #chat-hist-list {
        flex: 1; overflow-y: auto; padding: 8px 10px;
        display: flex; flex-direction: column; gap: 5px;
        scrollbar-width: thin; scrollbar-color: #2E1A0A transparent;
      }
      #chat-hist-list::-webkit-scrollbar { width: 3px; }
      #chat-hist-list::-webkit-scrollbar-thumb { background: #2E1A0A; border-radius: 2px; }

      .hr { display:flex; flex-direction:column; align-items:flex-start; gap:2px; }
      .hr-self { align-items:flex-end; }
      .hr-meta { display:flex; align-items:baseline; gap:5px; padding:0 3px; }
      .hr-name  { font-size:10px; font-weight:bold; color:#C8956C; }
      .hr-self .hr-name { color:#D4A96A; }
      .hr-whisper .hr-name { color:#C87BC8; }
      .hr-time  { font-size:9px; color:#3A2010; }
      .hr-bub   {
        font-size:12px; color:#F0E0C0; line-height:1.4;
        background:rgba(18,12,6,.80); border:1px solid rgba(50,28,8,.55);
        border-radius:10px; padding:4px 9px;
        max-width:280px; word-break:break-word;
      }
      .hr-self .hr-bub { background:rgba(35,20,6,.88); border-color:rgba(200,149,108,.28); }
      .hr-whisper .hr-bub { background:rgba(40,10,55,.80); border-color:rgba(180,110,220,.30); font-style:italic; color:#EDD0F5; }
      .hr-system .hr-bub { background:transparent; border-color:transparent; color:#6A5030; font-size:10px; font-style:italic; }

      /* Barra de entrada */
      #chat-bar {
        position: fixed;
        left: 16px;
        bottom: calc(16px + env(safe-area-inset-bottom, 0px));
        width: min(420px, calc(100vw - 32px));
        display: flex; align-items: center; gap: 6px;
        background: rgba(8,6,4,.90);
        border: 1px solid rgba(60,36,12,.55);
        border-radius: 26px;
        padding: 5px 6px;
        z-index: 100; backdrop-filter: blur(5px);
        pointer-events: all; font-family: Arial, sans-serif;
      }
      @media (pointer: coarse) {
        #chat-bar { left: 16px; width: calc(100vw - 32px); }
      }

      #chat-hist-btn {
        width: 36px; height: 36px; flex-shrink: 0;
        background: rgba(30,18,6,.70); border: 1px solid #2A1608;
        border-radius: 50%; font-size: 15px; cursor: pointer;
        position: relative; display: flex; align-items: center; justify-content: center;
        transition: background .15s; touch-action: manipulation;
      }
      #chat-hist-btn:hover { background: rgba(50,28,8,.90); }

      #chat-badge {
        position: absolute; top: -3px; right: -3px;
        min-width: 15px; height: 15px;
        background: #C8956C; color: #0A0806;
        border-radius: 8px; font-size: 9px; font-weight: bold;
        display: flex; align-items: center; justify-content: center;
        padding: 0 3px; pointer-events: none;
      }

      #chat-input {
        flex: 1; background: transparent; border: none; outline: none;
        color: #F0E0C0; font-size: 13px; font-family: Arial, sans-serif;
        padding: 4px 4px; min-width: 0;
      }
      #chat-input::placeholder { color: #3A2010; }

      #chat-send {
        width: 36px; height: 36px; flex-shrink: 0;
        background: #C8956C; color: #0A0806;
        border: none; border-radius: 50%;
        font-size: 15px; font-weight: bold; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: opacity .15s; touch-action: manipulation;
      }
      #chat-send:hover { opacity: .82; }
    `
    document.head.appendChild(s)
  }
}

function esc(s: string) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}
