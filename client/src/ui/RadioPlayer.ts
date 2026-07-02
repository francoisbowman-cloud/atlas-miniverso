/**
 * RadioPlayer — emisora de ambiente para la cafetería Atlas.
 *
 * Características:
 * • 3 categorías: SomaFM (12 estaciones) | 🇩🇴 RD (6 emisoras) | ★ Custom
 * • Sincronización de sala: cualquiera puede cambiar la estación y todos
 *   los que tienen sync ON la escuchan juntos (interruptor opcional)
 * • URL personalizada: pega cualquier stream MP3/AAC o enlace de YouTube
 * • YouTube: se carga como iframe embebido con reproducción automática
 * • Widget colapsable, esquina inferior derecha
 */

// ─── DATOS DE ESTACIONES ──────────────────────────────────────────────────────

interface Station {
  name:  string
  genre: string
  url:   string
  color: string
}

const SOMA_STATIONS: Station[] = [
  { name: 'Groove Salad',       genre: 'Ambient • IDM',       url: 'https://ice1.somafm.com/groovesalad-256-mp3',  color: '#6BAA75' },
  { name: 'Café del Mar',       genre: 'Chill • Balearic',    url: 'https://ice1.somafm.com/cafedelmar-128-mp3',   color: '#5B9BD5' },
  { name: 'Secret Agent',       genre: 'Jazz • Lounge',       url: 'https://ice1.somafm.com/secretagent-128-mp3',  color: '#C8956C' },
  { name: 'Lush',               genre: 'Dream Pop • Indie',   url: 'https://ice1.somafm.com/lush-128-mp3',         color: '#B07BC8' },
  { name: 'Drone Zone',         genre: 'Ambient • Drone',     url: 'https://ice1.somafm.com/dronezone-256-mp3',    color: '#7B7BC8' },
  { name: 'Cliqhop IDM',        genre: 'Electronic • IDM',    url: 'https://ice1.somafm.com/cliqhop-256-mp3',      color: '#5BB5C8' },
  { name: 'Boot Liquor',        genre: 'Americana • Country', url: 'https://ice1.somafm.com/bootliquor-128-mp3',   color: '#C8A55B' },
  { name: 'Folk Forward',       genre: 'Folk • Acoustic',     url: 'https://ice1.somafm.com/folkfwd-128-mp3',      color: '#8BA55B' },
  { name: 'Heavyweight Reggae', genre: 'Reggae • Dub',        url: 'https://ice1.somafm.com/reggae-128-mp3',       color: '#5BC87B' },
  { name: 'Seven Inch Soul',    genre: 'Soul • R&B',          url: 'https://ice1.somafm.com/7soul-128-mp3',        color: '#C87B5B' },
  { name: 'Metal Detector',     genre: 'Metal • Rock',        url: 'https://ice1.somafm.com/metal-128-mp3',        color: '#C85B5B' },
  { name: 'DEF CON Radio',      genre: 'Electronic • Techno', url: 'https://ice1.somafm.com/defcon-128-mp3',       color: '#D45B5B' },
]

// Emisoras dominicanas — si una URL no conecta, usa la pestaña Custom
const RD_STATIONS: Station[] = [
  { name: 'Z101 FM',        genre: 'Merengue • Bachata',  url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/Z101.mp3', color: '#E8412E' },
  { name: 'Xtreme FM',      genre: 'Pop • Reggaetón',     url: 'https://stream.zeno.fm/xtremefm-rd',                                         color: '#FF6B35' },
  { name: 'La 94.9',        genre: 'Tropical • Clásicos', url: 'https://stream.zeno.fm/la949-rd',                                            color: '#FFB347' },
  { name: 'Mega 97.9',      genre: 'Hit Music',           url: 'https://stream.zeno.fm/mega979-rd',                                          color: '#F5C518' },
  { name: 'Romántica 96.5', genre: 'Baladas • Romántica', url: 'https://stream.zeno.fm/romantica965-rd',                                     color: '#E87B9A' },
  { name: 'Kaché 107.1',    genre: 'Variada • Tropical',  url: 'https://stream.zeno.fm/kache1071-rd',                                        color: '#7BD4E8' },
]

type Category = 'somafm' | 'rd' | 'custom'

function stationsFor(cat: Category): Station[] {
  return cat === 'somafm' ? SOMA_STATIONS : cat === 'rd' ? RD_STATIONS : []
}

// ─── CLASE ────────────────────────────────────────────────────────────────────

export class RadioPlayer {
  /**
   * Se dispara cuando el usuario cambia la estación con sync ON.
   * main.ts lo conecta a NetworkManager.sendRadioChange().
   */
  onSync: ((category: string, idx: number, customUrl?: string, customLabel?: string) => void) | null = null

  // ── Audio ──
  private audio:   HTMLAudioElement
  private ytFrame: HTMLIFrameElement | null = null

  // ── Estado ──
  private cat:        Category = 'somafm'
  private idx         = 0
  private customUrl   = ''
  private customLabel = ''
  private _playing    = false
  private _volume     = 0.35
  private _syncOn     = true   // sync ON por defecto: toda la sala escucha igual
  private _expanded   = true

  // ── DOM ──
  private panel:          HTMLDivElement
  private elBody:         HTMLDivElement
  private elDot:          HTMLSpanElement
  private elPlayBtn:      HTMLButtonElement
  private elSyncBtn:      HTMLButtonElement
  private elVolIcon:      HTMLSpanElement
  private elCurrentName:  HTMLElement
  private elCurrentGenre: HTMLElement
  private elCustomUrl:    HTMLInputElement
  private elCustomLabel:  HTMLInputElement
  private elYtWrap:       HTMLDivElement
  private tabBtns:        Record<Category, HTMLButtonElement>
  private listWraps:      Record<string, HTMLDivElement>

  // ─── CONSTRUCTOR ──────────────────────────────────────────────────────────

  constructor() {
    this.audio = new Audio()
    this.audio.volume  = this._volume
    this.audio.preload = 'none'
    // crossOrigin omitido: muchas emisoras no envían cabeceras CORS
    // y bloqueaban la reproducción silenciosamente.

    this.injectStyles()
    this.buildPanel()
  }

  // ─── API PÚBLICA ──────────────────────────────────────────────────────────

  /**
   * Aplicar estado de radio llegado del servidor.
   * Solo actúa si sync está activado.
   */
  applyRemoteState(category: string, idx: number, customUrl?: string, customLabel?: string) {
    if (!this._syncOn) return
    this.cat = category as Category
    this.idx = idx
    if (customUrl   !== undefined) this.customUrl   = customUrl
    if (customLabel !== undefined) this.customLabel = customLabel

    this.switchToTab(this.cat, false)
    this.refreshListHighlight()
    this.updateCurrentInfo()

    if (this._playing) this.loadAndPlay()
  }

  dispose() {
    this.audio.pause()
    this.panel.remove()
    this.ytFrame?.remove()
  }

  // ─── CONSTRUCCIÓN ─────────────────────────────────────────────────────────

  private buildPanel() {
    const panel = document.createElement('div')
    panel.id = 'radio-panel'
    this.panel = panel

    // ══ HEADER ══
    const header = document.createElement('div')
    header.id = 'radio-header'

    const dot = document.createElement('span')
    dot.id = 'radio-dot'
    dot.textContent = '●'
    this.elDot = dot

    const lbl = document.createElement('span')
    lbl.id = 'radio-lbl'
    lbl.textContent = 'RADIO'

    const syncBtn = document.createElement('button')
    syncBtn.id    = 'radio-sync'
    syncBtn.addEventListener('click', () => this.toggleSync())
    this.elSyncBtn = syncBtn

    const colBtn = document.createElement('button')
    colBtn.id = 'radio-collapse'
    colBtn.textContent = '─'
    colBtn.addEventListener('click', () => this.setExpanded(!this._expanded))

    header.appendChild(dot)
    header.appendChild(lbl)
    header.appendChild(syncBtn)
    header.appendChild(colBtn)
    panel.appendChild(header)

    // ══ BODY ══
    const body = document.createElement('div')
    body.id = 'radio-body'
    this.elBody = body

    // ── Tabs ──
    const tabs = document.createElement('div')
    tabs.id = 'radio-tabs'
    this.tabBtns = {} as any
    this.listWraps = {}

    const makeCatBtn = (cat: Category, label: string) => {
      const btn = document.createElement('button')
      btn.className = 'radio-tab'
      btn.textContent = label
      btn.addEventListener('click', () => {
        this.cat = cat
        if (cat !== 'custom') this.idx = 0
        this.switchToTab(cat)
        this.updateCurrentInfo()
      })
      this.tabBtns[cat] = btn
      tabs.appendChild(btn)
    }
    makeCatBtn('somafm', 'SomaFM')
    makeCatBtn('rd',     '🇩🇴 RD')
    makeCatBtn('custom', '★ Custom')
    body.appendChild(tabs)

    // ── Listas por categoría ──
    ;(['somafm', 'rd', 'custom'] as Category[]).forEach(cat => {
      const wrap = document.createElement('div')
      wrap.className = 'radio-list-wrap'
      wrap.style.display = 'none'
      this.listWraps[cat] = wrap

      if (cat === 'somafm' || cat === 'rd') {
        stationsFor(cat).forEach((st, i) => {
          const row = document.createElement('button')
          row.className = 'radio-st-row'
          row.dataset['idx'] = String(i)
          row.innerHTML = `<span class="radio-st-dot" style="color:${st.color}">●</span>
                           <span class="radio-st-name">${esc(st.name)}</span>
                           <span class="radio-st-genre">${esc(st.genre)}</span>`
          row.addEventListener('click', () => this.selectStation(cat, i))
          wrap.appendChild(row)
        })
      } else {
        // Custom
        const p1 = document.createElement('p')
        p1.className = 'radio-custom-info'
        p1.textContent = 'URL de stream (MP3/AAC) o YouTube:'
        wrap.appendChild(p1)

        const urlIn = document.createElement('input')
        urlIn.type = 'text'
        urlIn.placeholder = 'https://…  o  youtube.com/watch?v=…'
        urlIn.className = 'radio-custom-input'
        this.elCustomUrl = urlIn
        wrap.appendChild(urlIn)

        const p2 = document.createElement('p')
        p2.className = 'radio-custom-info'
        p2.textContent = 'Nombre (opcional):'
        wrap.appendChild(p2)

        const lblIn = document.createElement('input')
        lblIn.type = 'text'
        lblIn.placeholder = 'Mi emisora…'
        lblIn.className = 'radio-custom-input'
        this.elCustomLabel = lblIn
        wrap.appendChild(lblIn)

        const playBtn2 = document.createElement('button')
        playBtn2.className = 'radio-custom-play'
        playBtn2.textContent = '▶ Reproducir'
        playBtn2.addEventListener('click', () => this.playCustomUrl())
        wrap.appendChild(playBtn2)

        // Bloquear WASD cuando los inputs de custom tienen foco
        ;[urlIn, lblIn].forEach(inp => {
          inp.addEventListener('keydown', e => e.stopPropagation())
        })
      }

      body.appendChild(wrap)
    })

    // Activar SomaFM por defecto
    this.listWraps['somafm'].style.display = 'block'
    this.tabBtns['somafm'].classList.add('active')

    // ── YouTube embed ──
    const ytWrap = document.createElement('div')
    ytWrap.id = 'radio-yt-wrap'
    ytWrap.style.display = 'none'
    this.elYtWrap = ytWrap
    body.appendChild(ytWrap)

    // ── Info estación actual ──
    const stInfo = document.createElement('div')
    stInfo.id = 'radio-st-info'
    const curName = document.createElement('div')
    curName.id = 'radio-cur-name'
    const curGenre = document.createElement('div')
    curGenre.id = 'radio-cur-genre'
    stInfo.appendChild(curName)
    stInfo.appendChild(curGenre)
    this.elCurrentName  = curName
    this.elCurrentGenre = curGenre
    body.appendChild(stInfo)

    // ── Controles ──
    const controls = document.createElement('div')
    controls.id = 'radio-controls'

    const prevBtn = document.createElement('button')
    prevBtn.className = 'radio-nav'
    prevBtn.textContent = '◀'
    prevBtn.title = 'Anterior'
    prevBtn.addEventListener('click', () => this.stepStation(-1))

    const playBtn = document.createElement('button')
    playBtn.id = 'radio-play'
    playBtn.textContent = '▶'
    playBtn.addEventListener('click', () => this.toggle())
    this.elPlayBtn = playBtn

    const nextBtn = document.createElement('button')
    nextBtn.className = 'radio-nav'
    nextBtn.textContent = '▶'
    nextBtn.title = 'Siguiente'
    nextBtn.addEventListener('click', () => this.stepStation(1))

    controls.appendChild(prevBtn)
    controls.appendChild(playBtn)
    controls.appendChild(nextBtn)
    body.appendChild(controls)

    // ── Volumen ──
    const volRow = document.createElement('div')
    volRow.id = 'radio-vol-row'

    const volIcon = document.createElement('span')
    volIcon.id = 'radio-vol-icon'
    volIcon.textContent = '🔈'
    this.elVolIcon = volIcon

    const volSlider = document.createElement('input')
    volSlider.type = 'range'
    volSlider.id = 'radio-vol'
    volSlider.min = '0'
    volSlider.max = '1'
    volSlider.step = '0.02'
    volSlider.value = String(this._volume)
    volSlider.addEventListener('input', () => {
      this._volume = parseFloat(volSlider.value)
      this.audio.volume = this._volume
      this.elVolIcon.textContent = this._volume < 0.01 ? '🔇' : this._volume < 0.5 ? '🔈' : '🔊'
      // Intentar ajustar volumen del iframe de YouTube via postMessage
      this.ytFrame?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: 'setVolume', args: [Math.round(this._volume * 100)] }),
        '*'
      )
    })

    volRow.appendChild(volIcon)
    volRow.appendChild(volSlider)
    body.appendChild(volRow)

    panel.appendChild(body)
    document.body.appendChild(panel)

    // Inicializar UI
    this.updateSyncBtn()
    this.updateCurrentInfo()
    this.refreshListHighlight()
  }

  // ─── LÓGICA DE TABS / SELECCIÓN ───────────────────────────────────────────

  private switchToTab(cat: Category, updateHighlight = true) {
    Object.keys(this.listWraps).forEach(k => {
      this.listWraps[k].style.display = k === cat ? 'block' : 'none'
    })
    ;(Object.keys(this.tabBtns) as Category[]).forEach(k => {
      this.tabBtns[k].classList.toggle('active', k === cat)
    })
    if (updateHighlight) this.refreshListHighlight()
  }

  private refreshListHighlight() {
    ;(['somafm', 'rd'] as Category[]).forEach(cat => {
      const wrap = this.listWraps[cat]
      if (!wrap) return
      wrap.querySelectorAll<HTMLButtonElement>('.radio-st-row').forEach(row => {
        const i = Number(row.dataset['idx'])
        row.classList.toggle('selected', this.cat === cat && i === this.idx)
      })
    })
  }

  private selectStation(cat: Category, i: number) {
    const wasPlaying = this._playing
    if (wasPlaying) { this.audio.pause(); this.hideYtFrame() }

    this.cat = cat
    this.idx = i
    this.refreshListHighlight()
    this.updateCurrentInfo()

    if (wasPlaying) {
      this._playing = true
      this.loadAndPlay()
    }

    if (this._syncOn) this.onSync?.(cat, i)
  }

  private stepStation(dir: 1 | -1) {
    if (this.cat === 'custom') return
    const list = stationsFor(this.cat)
    this.selectStation(this.cat, ((this.idx + dir) + list.length) % list.length)
  }

  // ─── CUSTOM URL ───────────────────────────────────────────────────────────

  private playCustomUrl() {
    const url   = this.elCustomUrl?.value.trim() ?? ''
    const label = this.elCustomLabel?.value.trim() || 'URL personalizada'
    if (!url) return

    this.customUrl   = url
    this.customLabel = label
    this.cat         = 'custom'
    this.updateCurrentInfo()

    this._playing = true
    this.loadAndPlay()

    if (this._syncOn) this.onSync?.('custom', 0, url, label)
  }

  // ─── REPRODUCCIÓN ─────────────────────────────────────────────────────────

  private toggle() {
    if (this._playing) {
      this.audio.pause()
      this.hideYtFrame()
      this._playing = false
      this.elPlayBtn.textContent = '▶'
      this.elDot.classList.remove('pulsing')
    } else {
      if (!this.getCurrentUrl()) return
      this._playing = true
      this.loadAndPlay()
    }
  }

  private loadAndPlay() {
    const url = this.getCurrentUrl()
    if (!url) return

    const ytId = extractYouTubeId(url)
    if (ytId) {
      this.audio.pause()
      this.showYtFrame(ytId)
      this.elPlayBtn.textContent = '⏸'
      this.elDot.classList.add('pulsing')
    } else {
      this.hideYtFrame()
      this.audio.src    = url
      this.audio.volume = this._volume
      this.audio.load()
      this.audio.play().then(() => {
        this.elPlayBtn.textContent = '⏸'
        this.elDot.classList.add('pulsing')
      }).catch((err) => {
        this._playing = false
        this.elPlayBtn.textContent = '▶'
        this.elDot.classList.remove('pulsing')
        console.warn('[Atlas Radio] No se pudo reproducir:', err)
        // Si falla una emisora dominicana, mostrar sugerencia en el nombre
        if (this.cat === 'rd') {
          this.elCurrentGenre.textContent = '⚠ Stream no disponible — prueba Custom ↗'
        }
      })
    }
  }

  private getCurrentUrl(): string {
    if (this.cat === 'custom') return this.customUrl
    return stationsFor(this.cat)[this.idx]?.url ?? ''
  }

  // ─── YOUTUBE IFRAME ───────────────────────────────────────────────────────

  private showYtFrame(videoId: string) {
    if (!this.ytFrame) {
      const iframe = document.createElement('iframe')
      iframe.id = 'radio-yt-iframe'
      iframe.allow = 'autoplay; encrypted-media'
      this.ytFrame = iframe
      this.elYtWrap.appendChild(iframe)
    }
    const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`
    if (!this.ytFrame.src.includes(videoId)) this.ytFrame.src = src
    this.elYtWrap.style.display = 'block'
  }

  private hideYtFrame() {
    if (this.ytFrame) this.ytFrame.src = ''
    this.elYtWrap.style.display = 'none'
  }

  // ─── SYNC ─────────────────────────────────────────────────────────────────

  private toggleSync() {
    this._syncOn = !this._syncOn
    this.updateSyncBtn()
    if (this._syncOn && this.cat !== 'custom') {
      this.onSync?.(this.cat, this.idx)
    }
  }

  private updateSyncBtn() {
    this.elSyncBtn.textContent = this._syncOn ? '🔗' : '🔓'
    this.elSyncBtn.title = this._syncOn
      ? 'Sincronizado con la sala — clic para escuchar solo'
      : 'Sin sync — clic para escuchar con todos'
    this.panel.classList.toggle('synced', this._syncOn)
  }

  // ─── EXPANDIR / COLAPSAR ──────────────────────────────────────────────────

  private setExpanded(val: boolean) {
    this._expanded = val
    this.elBody.style.display = val ? 'flex' : 'none'
    const colBtn = this.panel.querySelector<HTMLButtonElement>('#radio-collapse')!
    colBtn.textContent = val ? '─' : '+'
  }

  // ─── INFO ESTACIÓN ACTUAL ─────────────────────────────────────────────────

  private updateCurrentInfo() {
    if (this.cat === 'custom') {
      this.elCurrentName.textContent  = this.customLabel || 'URL personalizada'
      this.elCurrentGenre.textContent = 'Stream propio'
      this.panel.style.setProperty('--accent', '#C8956C')
      this.elDot.style.color = '#C8956C'
    } else {
      const st = stationsFor(this.cat)[this.idx]
      if (st) {
        this.elCurrentName.textContent  = st.name
        this.elCurrentGenre.textContent = st.genre
        this.panel.style.setProperty('--accent', st.color)
        this.elDot.style.color = st.color
      }
    }
  }

  // ─── ESTILOS ──────────────────────────────────────────────────────────────

  private injectStyles() {
    if (document.getElementById('radio-styles')) return
    const s = document.createElement('style')
    s.id = 'radio-styles'
    s.textContent = `
      #radio-panel {
        --accent: #C8956C;
        position: fixed;
        right: 16px;
        bottom: calc(16px + env(safe-area-inset-bottom, 0px));
        width: min(252px, calc(100vw - 32px));
      }
      @media (max-width: 500px) {
        #radio-panel { bottom: 70px; }
      }
      #radio-panel {
        background: rgba(8, 6, 4, 0.92);
        border: 1px solid rgba(60, 36, 12, 0.55);
        border-radius: 12px;
        font-family: Arial, sans-serif;
        z-index: 100;
        backdrop-filter: blur(6px);
        overflow: hidden;
        pointer-events: all;
      }

      /* Header */
      #radio-header {
        display: flex; align-items: center; gap: 6px;
        padding: 8px 10px;
        border-bottom: 1px solid rgba(60, 36, 12, 0.30);
      }
      #radio-dot {
        font-size: 9px; color: var(--accent); transition: color .4s; flex-shrink: 0;
      }
      #radio-dot.pulsing { animation: radio-pulse 1.2s ease-in-out infinite; }
      @keyframes radio-pulse { 0%,100%{ opacity:1; } 50%{ opacity:0.3; } }
      #radio-lbl { font-size: 9px; font-weight: bold; letter-spacing:.18em; color:#6A4828; flex:1; }
      #radio-sync, #radio-collapse {
        background:none; border:none; font-size:13px; cursor:pointer;
        padding:6px 8px; border-radius:4px; opacity:.55; transition:opacity .15s; line-height:1;
        touch-action: manipulation;
        min-width: 36px; min-height: 36px;
        display: flex; align-items: center; justify-content: center;
      }
      #radio-sync:hover, #radio-collapse:hover { opacity:1; }
      #radio-panel.synced #radio-sync { opacity:1; color:var(--accent); }

      /* Body */
      #radio-body { display:flex; flex-direction:column; }

      /* Tabs */
      #radio-tabs { display:flex; border-bottom:1px solid rgba(60,36,12,.30); }
      .radio-tab {
        flex:1; padding:6px 4px;
        background:none; border:none; border-right:1px solid rgba(60,36,12,.20);
        color:#5A3818; font-size:10px; font-weight:bold;
        cursor:pointer; letter-spacing:.03em;
        transition:color .15s, background .15s;
      }
      .radio-tab:last-child { border-right:none; }
      .radio-tab:hover { color:#C8956C; background:rgba(200,149,108,.07); }
      .radio-tab.active {
        color:var(--accent);
        border-bottom:2px solid var(--accent);
        background:rgba(200,149,108,.10);
      }

      /* Station lists */
      .radio-list-wrap {
        max-height:165px; overflow-y:auto;
        scrollbar-width:thin; scrollbar-color:#2E1A0A transparent;
      }
      .radio-list-wrap::-webkit-scrollbar { width:3px; }
      .radio-list-wrap::-webkit-scrollbar-thumb { background:#2E1A0A; border-radius:2px; }

      .radio-st-row {
        display:flex; align-items:baseline; gap:6px;
        width:100%; padding:7px 12px;
        background:none; border:none; border-bottom:1px solid rgba(40,20,5,.25);
        text-align:left; cursor:pointer; transition:background .1s;
      }
      .radio-st-row:hover    { background:rgba(200,149,108,.08); }
      .radio-st-row.selected { background:rgba(200,149,108,.16); }
      .radio-st-dot  { font-size:8px; flex-shrink:0; line-height:1.9; }
      .radio-st-name { font-size:12px; color:#F0E0C0; flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .radio-st-genre{ font-size:9px; color:#5A3818; white-space:nowrap; }

      /* Custom tab */
      .radio-custom-info { font-size:10px; color:#6A4828; margin:0; padding:8px 12px 3px; }
      .radio-custom-input {
        display:block; width:calc(100% - 24px); margin:0 12px 0;
        padding:6px 8px; background:rgba(14,10,6,.80);
        border:1px solid #2A1608; border-radius:6px;
        color:#F0E0C0; font-size:11px; outline:none;
        transition:border-color .15s;
        box-sizing:border-box;
      }
      .radio-custom-input:focus { border-color:var(--accent); }
      .radio-custom-input::placeholder { color:#3A2010; }
      .radio-custom-play {
        display:block; margin:8px 12px 10px;
        padding:7px 0; width:calc(100% - 24px);
        background:var(--accent); color:#0A0806;
        border:none; border-radius:7px; font-size:12px;
        font-weight:bold; cursor:pointer; transition:opacity .15s;
        box-sizing:border-box;
      }
      .radio-custom-play:hover { opacity:.85; }

      /* YouTube iframe */
      #radio-yt-wrap { width:100%; aspect-ratio:16/9; background:#000; }
      #radio-yt-iframe { width:100%; height:100%; border:none; }

      /* Current station info */
      #radio-st-info { padding:7px 12px 3px; border-top:1px solid rgba(40,20,5,.30); }
      #radio-cur-name  { font-size:12px; font-weight:bold; color:#F0E0C0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      #radio-cur-genre { font-size:9px; color:#6A4828; }

      /* Controls */
      #radio-controls {
        display:flex; align-items:center; justify-content:center; gap:10px;
        padding:7px 12px 6px;
      }
      .radio-nav {
        background:none; border:none; color:#6A4828; font-size:10px;
        cursor:pointer; padding:4px 6px; transition:color .15s;
      }
      .radio-nav:hover { color:var(--accent); }
      #radio-play {
        width:34px; height:34px;
        background:var(--accent); color:#0A0806;
        border:none; border-radius:50%; font-size:13px;
        cursor:pointer; display:flex; align-items:center; justify-content:center;
        transition:opacity .15s, background .4s;
      }
      #radio-play:hover { opacity:.85; }

      /* Volume */
      #radio-vol-row { display:flex; align-items:center; gap:7px; padding:0 12px 10px; }
      #radio-vol-icon { font-size:12px; }
      #radio-vol {
        flex:1; -webkit-appearance:none; height:3px;
        background:#2A1608; border-radius:2px; outline:none; cursor:pointer;
      }
      #radio-vol::-webkit-slider-thumb {
        -webkit-appearance:none; width:12px; height:12px;
        border-radius:50%; background:var(--accent); transition:background .4s;
      }
      #radio-vol::-moz-range-thumb {
        width:12px; height:12px; border:none; border-radius:50%; background:var(--accent);
      }
    `
    document.head.appendChild(s)
  }
}

// ─── UTILIDADES ───────────────────────────────────────────────────────────────

function esc(s: string) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

function extractYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|live\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  )
  return m ? m[1] : null
}
