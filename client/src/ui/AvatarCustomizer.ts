import { LocalPlayer }     from '../avatar/LocalPlayer'
import { AvaturnCreator }  from '../avatar/AvaturnCreator'

// ─── TIPO DE RETORNO ──────────────────────────────────────────────────────────

export interface AvatarSelection {
  name:      string
  avatarUrl: string          // GLB que representa a este jugador (realista, foto o estilizado)
  skin:      [number, number, number]
  hair:      [number, number, number]
  jacket:    [number, number, number]
  pants:     [number, number, number]
}

// ─── AVATARES REALISTAS (biblioteca local, humanos texturizados) ───────────────
// Archivos en client/public/models/realistic/ — ver strip_morphs / avatar_factory.
interface RealisticAvatar { file: string; label: string }

const REALISTIC_AVATARS: RealisticAvatar[] = [
  { file: 'latina_f.glb',     label: 'Latina'    },
  { file: 'latino_m.glb',     label: 'Latino'    },
  { file: 'afro_f.glb',       label: 'Afro ♀'    },
  { file: 'afro_m.glb',       label: 'Afro ♂'    },
  { file: 'asiatica_f.glb',   label: 'Asiática'  },
  { file: 'asiatico_m.glb',   label: 'Asiático'  },
  { file: 'caucasica_f.glb',  label: 'Caucásica' },
  { file: 'caucasico_m.glb',  label: 'Caucásico' },
]

const REALISTIC_DIR = '/models/realistic/'
const DOLL_URL      = '/models/avatar_doll.glb'   // avatar estilizado personalizable por color

// "Crear con mi foto" (Avaturn) deprioritado por ahora — el código sigue
// intacto, solo no se muestra el botón. Cambiar a true para reactivarlo.
const ENABLE_AVATURN = false

// ─── PALETAS ──────────────────────────────────────────────────────────────────

const SKIN_TONES = [
  { hex: '#FDEEE0', label: 'Porcelana'    },
  { hex: '#F5DCCA', label: 'Muy claro'    },
  { hex: '#E8C099', label: 'Claro'        },
  { hex: '#D4A478', label: 'Claro medio'  },
  { hex: '#C08B60', label: 'Medio'        },
  { hex: '#A06B40', label: 'Medio oscuro' },
  { hex: '#7A4A28', label: 'Oscuro'       },
  { hex: '#5A3018', label: 'Muy oscuro'   },
  { hex: '#3E2010', label: 'Profundo'     },
]

const HAIR_COLORS = [
  { hex: '#0E0806', label: 'Negro'      },
  { hex: '#2D1606', label: 'Castano'    },
  { hex: '#5C3210', label: 'Marron'     },
  { hex: '#7A3018', label: 'Rojizo'     },
  { hex: '#C8A050', label: 'Rubio'      },
  { hex: '#D4702A', label: 'Cobrizo'    },
  { hex: '#A8A8A8', label: 'Gris'       },
  { hex: '#ECECEC', label: 'Blanco'     },
]

type RGB = [number, number, number]

interface Outfit {
  label:  string
  color:  string
  jacket: RGB
  shirt:  RGB
  pants:  RGB
}

const OUTFITS: Outfit[] = [
  {
    label: 'Azul marino',  color: '#1A3A7A',
    jacket: [0.10, 0.22, 0.48],
    shirt:  [0.18, 0.38, 0.72],
    pants:  [0.08, 0.10, 0.22],
  },
  {
    label: 'Terracota',    color: '#B83A1A',
    jacket: [0.65, 0.22, 0.08],
    shirt:  [0.82, 0.38, 0.16],
    pants:  [0.20, 0.10, 0.06],
  },
  {
    label: 'Crema',        color: '#C8B48A',
    jacket: [0.80, 0.72, 0.58],
    shirt:  [0.92, 0.86, 0.74],
    pants:  [0.35, 0.28, 0.18],
  },
  {
    label: 'Verde oliva',  color: '#3D5C1A',
    jacket: [0.24, 0.36, 0.10],
    shirt:  [0.32, 0.50, 0.14],
    pants:  [0.12, 0.18, 0.06],
  },
  {
    label: 'Negro',        color: '#2A2A2A',
    jacket: [0.12, 0.10, 0.10],
    shirt:  [0.18, 0.16, 0.16],
    pants:  [0.08, 0.07, 0.07],
  },
  {
    label: 'Bordo',        color: '#6A1A2A',
    jacket: [0.40, 0.10, 0.16],
    shirt:  [0.58, 0.14, 0.22],
    pants:  [0.14, 0.08, 0.10],
  },
  {
    label: 'Gris urbano',  color: '#5A6070',
    jacket: [0.35, 0.38, 0.44],
    shirt:  [0.52, 0.55, 0.62],
    pants:  [0.18, 0.20, 0.24],
  },
  {
    label: 'Salmon',       color: '#C87050',
    jacket: [0.72, 0.40, 0.28],
    shirt:  [0.88, 0.58, 0.40],
    pants:  [0.22, 0.14, 0.10],
  },
]

// ─── UTILIDADES ───────────────────────────────────────────────────────────────

function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.replace('#', ''), 16)
  return [((n >> 16) & 0xff) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255]
}

// ─── CLASE ────────────────────────────────────────────────────────────────────

/**
 * AvatarCustomizer — creador de avatar propio de Atlas.
 *
 * Panel lateral derecho sobre el canvas 3D.
 * La camara se reposiciona para mostrar el avatar de frente.
 * Todos los cambios se reflejan en tiempo real.
 *
 * Independiente de servicios de terceros.
 */
export class AvatarCustomizer {
  private player: LocalPlayer
  private panel:  HTMLDivElement
  private canvas: HTMLCanvasElement

  // Estado actual seleccionado (actualizado en tiempo real con cada clic)
  private _skin:   [number, number, number] = hexToRgb(SKIN_TONES[4].hex)  // Medio
  private _hair:   [number, number, number] = hexToRgb(HAIR_COLORS[1].hex) // Castaño
  private _jacket: [number, number, number] = OUTFITS[0].jacket
  private _pants:  [number, number, number] = OUTFITS[0].pants
  private _nameInput: HTMLInputElement | null = null

  // Apariencia: 'realista' (humano texturizado / foto) o 'estilizado' (muñeco recolor.)
  private _mode: 'realista' | 'estilizado' = 'realista'
  private _avatarUrl = REALISTIC_DIR + REALISTIC_AVATARS[0].file  // latina por defecto
  private _colorSections: HTMLElement[] = []                      // se ocultan en modo realista
  private _avaturn: AvaturnCreator | null = null

  constructor(player: LocalPlayer, canvas: HTMLCanvasElement) {
    this.player = player
    this.canvas = canvas
    this.panel  = this.buildPanel()
  }

  // ─── API ──────────────────────────────────────────────────────────────────

  open(): Promise<AvatarSelection> {
    this.player.enterCustomizerMode()
    this.panel.style.display = 'flex'

    // Arranca en modo realista con el avatar por defecto (ya cargado al boot).
    // No se fuerzan colores del muñeco: eso solo aplica en modo estilizado.
    this.setMode('realista')

    return new Promise((resolve) => {
      const btn = this.panel.querySelector<HTMLButtonElement>('#btn-enter')!
      btn.addEventListener('click', () => {
        const name = (this._nameInput?.value.trim() || 'Jugador').slice(0, 20)
        this.close()
        resolve({
          name,
          avatarUrl: this._avatarUrl,
          skin:   this._skin,
          hair:   this._hair,
          jacket: this._jacket,
          pants:  this._pants,
        })
      }, { once: true })
    })
  }

  // ─── CAMBIO DE MODO / CARGA DE APARIENCIA ──────────────────────────────────

  private setMode(mode: 'realista' | 'estilizado') {
    this._mode = mode
    // Las secciones de color solo tienen sentido para el muñeco estilizado:
    // los avatares realistas usan textura horneada y tintarlos se ve mal.
    const showColors = mode === 'estilizado'
    this._colorSections.forEach(s => { s.style.display = showColors ? 'flex' : 'none' })
  }

  private async loadRealistic(file: string, btn: HTMLElement) {
    this.markSelected('appearance', btn)
    this._mode = 'realista'
    this._avatarUrl = REALISTIC_DIR + file
    this.setMode('realista')
    await this.player.loadAvatarFromURL(this._avatarUrl)
  }

  private async loadDoll(btn: HTMLElement) {
    this.markSelected('appearance', btn)
    this._avatarUrl = DOLL_URL
    this.setMode('estilizado')
    const ok = await this.player.loadAvatarFromURL(DOLL_URL)
    if (ok) {
      // aplicar los colores actualmente seleccionados al muñeco recién cargado
      this.player.updateSkin(...this._skin)
      this.player.updateHair(...this._hair)
      this.player.updateOutfit(this._jacket, this._jacket, this._pants)
    }
  }

  private async openAvaturn(btn: HTMLElement) {
    this.markSelected('appearance', btn)
    try {
      if (!this._avaturn) this._avaturn = new AvaturnCreator()
      const url = await this._avaturn.open()   // selfie → GLB del propio usuario
      this._avatarUrl = url
      this.setMode('realista')
      await this.player.loadAvatarFromURL(url)
    } catch (err) {
      console.warn('[Atlas] Avaturn cancelado o no disponible:', err)
    }
  }

  private markSelected(group: string, el: HTMLElement) {
    this.panel.querySelectorAll(`[data-group="${group}"]`)
      .forEach(b => b.classList.remove('appear-selected'))
    el.classList.add('appear-selected')
  }

  close() {
    this.panel.style.display = 'none'
    this.player.exitCustomizerMode(this.canvas)
  }

  dispose() {
    this.panel.remove()
    this._avaturn?.dispose()
  }

  // ─── CONSTRUCCION DEL PANEL ───────────────────────────────────────────────

  private buildPanel(): HTMLDivElement {
    this.injectStyles()

    const panel = document.createElement('div')
    panel.id = 'customizer-panel'
    panel.style.cssText = `
      position: fixed;
      top: 0; right: 0;
      width: 320px;
      background: rgba(8, 6, 4, 0.94);
      border-left: 1px solid #221810;
      display: none;
      flex-direction: column;
      font-family: Arial, sans-serif;
      z-index: 150;
      backdrop-filter: blur(6px);
    `

    // Header
    const header = document.createElement('div')
    header.style.cssText = 'padding: 22px 22px 14px; border-bottom: 1px solid #1A1208;'
    header.innerHTML = `
      <p style="color:#D4A96A;font-size:17px;font-weight:bold;
                letter-spacing:.08em;margin:0 0 3px">Tu avatar</p>
      <p style="color:#4A3828;font-size:11px;margin:0;letter-spacing:.03em">
        Los cambios se ven en tiempo real
      </p>
    `
    panel.appendChild(header)

    // Cuerpo scrollable — min-height:0 es crítico en flex para que overflow-y funcione en iOS
    const body = document.createElement('div')
    body.style.cssText = `
      flex: 1; min-height: 0; overflow-y: auto; padding: 18px 22px;
      display: flex; flex-direction: column; gap: 20px;
    `
    body.appendChild(this.appearanceSection())
    const skinS = this.skinSection()
    const hairS = this.hairSection()
    const outfitS = this.outfitSection()
    this._colorSections = [skinS, hairS, outfitS]
    body.appendChild(skinS)
    body.appendChild(hairS)
    body.appendChild(outfitS)
    body.appendChild(this.nameSection())
    panel.appendChild(body)

    // Footer
    const footer = document.createElement('div')
    footer.id = 'customizer-footer'
    footer.style.cssText = 'border-top: 1px solid #1A1208;'
    footer.appendChild(this.enterButton())
    panel.appendChild(footer)

    document.body.appendChild(panel)
    return panel
  }

  // ─── SECCION: APARIENCIA (humanos realistas + foto + estilizado) ───────────

  private appearanceSection(): HTMLDivElement {
    const wrap = this.section('Elige tu apariencia')

    // Grid de humanos realistas
    const grid = document.createElement('div')
    grid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 7px;'
    REALISTIC_AVATARS.forEach((av, i) => {
      const btn = document.createElement('button')
      btn.className = 'appear-btn'
      btn.dataset.group = 'appearance'
      btn.textContent = av.label
      if (i === 0) btn.classList.add('appear-selected')  // latina por defecto
      btn.addEventListener('click', () => this.loadRealistic(av.file, btn))
      grid.appendChild(btn)
    })
    wrap.appendChild(grid)

    // Botón: crear con selfie (Avaturn) — deprioritado, ver ENABLE_AVATURN
    if (ENABLE_AVATURN) {
      const photoBtn = document.createElement('button')
      photoBtn.className = 'appear-photo'
      photoBtn.dataset.group = 'appearance'
      photoBtn.innerHTML = '📷 Crear con mi foto'
      photoBtn.addEventListener('click', () => this.openAvaturn(photoBtn))
      wrap.appendChild(photoBtn)
    }

    // Botón: avatar estilizado personalizable por color
    const dollBtn = document.createElement('button')
    dollBtn.className = 'appear-doll'
    dollBtn.dataset.group = 'appearance'
    dollBtn.textContent = 'Estilizado (personalizar color)'
    dollBtn.addEventListener('click', () => this.loadDoll(dollBtn))
    wrap.appendChild(dollBtn)

    return wrap
  }

  // ─── SECCION: TONO DE PIEL ────────────────────────────────────────────────

  private skinSection(): HTMLDivElement {
    const wrap = this.section('Tono de piel')
    const grid = document.createElement('div')
    grid.style.cssText = 'display: flex; gap: 9px; flex-wrap: wrap;'

    SKIN_TONES.forEach((tone, i) => {
      const sw = this.swatch(tone.hex, tone.label)
      if (i === 4) sw.classList.add('sw-selected')   // Medio por defecto
      sw.addEventListener('click', () => {
        grid.querySelectorAll('.sw').forEach(s => s.classList.remove('sw-selected'))
        sw.classList.add('sw-selected')
        this._skin = hexToRgb(tone.hex)
        this.player.updateSkin(...this._skin)
      })
      grid.appendChild(sw)
    })

    wrap.appendChild(grid)
    return wrap
  }

  // ─── SECCION: CABELLO ─────────────────────────────────────────────────────

  private hairSection(): HTMLDivElement {
    const wrap = this.section('Color de cabello')
    const grid = document.createElement('div')
    grid.style.cssText = 'display: flex; gap: 9px; flex-wrap: wrap;'

    HAIR_COLORS.forEach((hc, i) => {
      const sw = this.swatch(hc.hex, hc.label)
      if (i === 1) sw.classList.add('sw-selected')   // Castano por defecto
      sw.addEventListener('click', () => {
        grid.querySelectorAll('.sw').forEach(s => s.classList.remove('sw-selected'))
        sw.classList.add('sw-selected')
        this._hair = hexToRgb(hc.hex)
        this.player.updateHair(...this._hair)
      })
      grid.appendChild(sw)
    })

    wrap.appendChild(grid)
    return wrap
  }

  // ─── SECCION: ROPA ────────────────────────────────────────────────────────

  private outfitSection(): HTMLDivElement {
    const wrap = this.section('Ropa')
    const grid = document.createElement('div')
    grid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 7px;'

    OUTFITS.forEach((outfit, i) => {
      const btn = document.createElement('button')
      btn.className = 'outfit-btn'
      btn.innerHTML = `
        <span class="outfit-dot" style="background:${outfit.color}"></span>
        ${outfit.label}
      `
      if (i === 0) btn.classList.add('outfit-selected')

      btn.addEventListener('click', () => {
        grid.querySelectorAll('.outfit-btn').forEach(b => b.classList.remove('outfit-selected'))
        btn.classList.add('outfit-selected')
        this._jacket = outfit.jacket
        this._pants  = outfit.pants
        this.player.updateOutfit(outfit.jacket, outfit.shirt, outfit.pants)
      })
      grid.appendChild(btn)
    })

    wrap.appendChild(grid)
    return wrap
  }

  // ─── SECCION: NOMBRE ──────────────────────────────────────────────────────

  private nameSection(): HTMLDivElement {
    const wrap = this.section('Tu nombre')
    const input = document.createElement('input')
    input.type        = 'text'
    input.placeholder = 'Como te llamas...'
    input.maxLength   = 20
    input.className   = 'name-input'
    input.addEventListener('input', () => {
      this.player.updateNameplate(input.value.trim())
    })
    this._nameInput = input
    wrap.appendChild(input)
    return wrap
  }

  // ─── BOTON ENTRAR ─────────────────────────────────────────────────────────

  private enterButton(): HTMLButtonElement {
    const btn = document.createElement('button')
    btn.id          = 'btn-enter'
    btn.textContent = 'Entrar a la cafetería ☕'
    btn.className   = 'enter-btn'
    return btn
  }

  // ─── ESTILOS ──────────────────────────────────────────────────────────────

  private injectStyles() {
    if (document.getElementById('customizer-styles')) return
    const style = document.createElement('style')
    style.id = 'customizer-styles'
    style.textContent = `
      .sw {
        width: 30px; height: 30px; border-radius: 50%;
        cursor: pointer; border: 2px solid transparent;
        transition: transform .14s, border-color .14s;
        box-shadow: 0 1px 5px rgba(0,0,0,0.55);
        flex-shrink: 0;
      }
      .sw:hover     { transform: scale(1.20); }
      .sw-selected  { border-color: #D4A96A; transform: scale(1.20); }

      .outfit-btn {
        display: flex; align-items: center; gap: 7px;
        padding: 8px 10px;
        background: #140F0A; border: 1px solid #221810;
        border-radius: 8px; color: #5A4030;
        font-size: 12px; cursor: pointer;
        text-align: left; transition: all .15s;
        font-family: Arial, sans-serif;
      }
      .outfit-btn:hover    { background: #1C1510; color: #C8956C; border-color: #362010; }
      .outfit-selected     { background: #1C1510; color: #F0E0C0; border-color: #C8956C; }

      .outfit-dot {
        width: 11px; height: 11px; border-radius: 50%;
        flex-shrink: 0; display: inline-block;
      }

      .appear-btn {
        padding: 9px 8px;
        background: #140F0A; border: 1px solid #221810;
        border-radius: 8px; color: #7A5A40;
        font-size: 12px; cursor: pointer; text-align: center;
        transition: all .15s; font-family: Arial, sans-serif;
      }
      .appear-btn:hover  { background: #1C1510; color: #C8956C; border-color: #362010; }
      .appear-selected   { background: #241a10; color: #F0E0C0; border-color: #D4A96A; }

      .appear-photo, .appear-doll {
        width: 100%; padding: 10px; margin-top: 8px;
        border-radius: 8px; cursor: pointer; font-size: 12px;
        font-family: Arial, sans-serif; transition: all .15s;
      }
      .appear-photo {
        background: linear-gradient(135deg,#3A2A6A,#5A3A9A);
        color: #E8DCFF; border: none; font-weight: bold;
      }
      .appear-photo:hover { opacity: .9; }
      .appear-doll {
        background: #140F0A; border: 1px solid #221810; color: #5A4030;
      }
      .appear-doll:hover { background: #1C1510; color: #C8956C; border-color: #362010; }

      .name-input {
        width: 100%; box-sizing: border-box;
        background: #140F0A; border: 1px solid #221810;
        border-radius: 8px; padding: 10px 13px;
        color: #F0E0C0; font-size: 14px; outline: none;
        font-family: Arial, sans-serif; transition: border-color .15s;
      }
      .name-input:focus       { border-color: #C8956C; }
      .name-input::placeholder { color: #2E2010; }

      .enter-btn {
        width: 100%; padding: 14px;
        background: linear-gradient(135deg, #C8956C, #D4A96A);
        color: #0A0806; font-size: 15px; font-weight: bold;
        border: none; border-radius: 10px;
        cursor: pointer; letter-spacing: .05em;
        transition: opacity .2s; font-family: Arial, sans-serif;
      }
      .enter-btn:hover { opacity: .88; }

      /* scrollbar del panel */
      #customizer-panel ::-webkit-scrollbar       { width: 4px; }
      #customizer-panel ::-webkit-scrollbar-track  { background: transparent; }
      #customizer-panel ::-webkit-scrollbar-thumb  { background: #2E1E0E; border-radius: 2px; }

      /* Altura del panel: cascada de fallbacks para iOS Safari */
      #customizer-panel {
        height: 100vh;
        height: -webkit-fill-available;
        height: 100dvh;
      }

      /* Footer: safe area para iPhone (home indicator) */
      #customizer-footer {
        padding: 14px 22px max(22px, calc(14px + env(safe-area-inset-bottom, 0px)));
      }

      /* Móvil: panel ocupa todo el ancho */
      @media (max-width: 500px) {
        #customizer-panel { width: 100% !important; border-left: none !important; }
      }
    `
    document.head.appendChild(style)
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────

  private section(label: string): HTMLDivElement {
    const wrap = document.createElement('div')
    wrap.style.cssText = 'display: flex; flex-direction: column; gap: 10px;'
    const lbl = document.createElement('p')
    lbl.textContent = label
    lbl.style.cssText = `
      color: #C8956C; font-size: 10px; font-weight: bold;
      letter-spacing: .10em; margin: 0; text-transform: uppercase;
    `
    wrap.appendChild(lbl)
    return wrap
  }

  private swatch(hex: string, label: string): HTMLDivElement {
    const div = document.createElement('div')
    div.className      = 'sw'
    div.style.background = hex
    div.title          = label
    return div
  }
}
