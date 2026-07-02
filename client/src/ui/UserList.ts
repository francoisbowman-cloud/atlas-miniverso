/**
 * UserList — panel "¿Quién está aquí?" que muestra los jugadores en sala.
 *
 * Botón flotante (👥) en la esquina superior derecha.
 * Al pulsar, abre un panel con la lista de nombres.
 * Se actualiza en tiempo real conforme entran/salen jugadores.
 */
export class UserList {
  private btn:   HTMLButtonElement
  private panel: HTMLDivElement
  private list:  HTMLUListElement
  private countBadge: HTMLSpanElement

  private _open = false
  private names: Map<string, string> = new Map()   // id → nombre
  private myName = ''

  constructor() {
    this.injectStyles()
    this.buildUI()
  }

  // ─── API ──────────────────────────────────────────────────────────────────

  /** Nombre del jugador local (se muestra con "(tú)") */
  setMyName(name: string) {
    this.myName = name
    this.refresh()
  }

  /** Sobreescribe el mapa completo de jugadores (bienvenida) */
  setPlayers(players: { id: string; name: string }[]) {
    this.names.clear()
    players.forEach(p => this.names.set(p.id, p.name))
    this.refresh()
  }

  /** Añade o actualiza un jugador */
  addPlayer(id: string, name: string) {
    this.names.set(id, name)
    this.refresh()
  }

  /** Elimina un jugador */
  removePlayer(id: string) {
    this.names.delete(id)
    this.refresh()
  }

  dispose() {
    this.btn.remove()
    this.panel.remove()
  }

  // ─── CONSTRUCCIÓN ─────────────────────────────────────────────────────────

  private buildUI() {
    // Botón flotante
    const btn = document.createElement('button')
    btn.id = 'ul-btn'
    btn.title = '¿Quién está aquí?'

    const icon = document.createElement('span')
    icon.textContent = '👥'
    icon.style.pointerEvents = 'none'

    const badge = document.createElement('span')
    badge.id = 'ul-badge'
    this.countBadge = badge

    btn.appendChild(icon)
    btn.appendChild(badge)
    btn.addEventListener('click', () => this.toggle())
    document.body.appendChild(btn)
    this.btn = btn

    // Panel
    const panel = document.createElement('div')
    panel.id = 'ul-panel'
    panel.style.display = 'none'

    const head = document.createElement('div')
    head.id = 'ul-head'

    const title = document.createElement('span')
    title.textContent = 'En la sala'
    title.style.cssText = 'color:#C8956C;font-size:11px;font-weight:bold;letter-spacing:.05em;'

    const close = document.createElement('button')
    close.id = 'ul-close'
    close.textContent = '✕'
    close.addEventListener('click', () => this.toggle())

    head.appendChild(title)
    head.appendChild(close)

    const list = document.createElement('ul')
    list.id = 'ul-list'
    this.list = list

    panel.appendChild(head)
    panel.appendChild(list)
    document.body.appendChild(panel)
    this.panel = panel
  }

  // ─── LÓGICA ───────────────────────────────────────────────────────────────

  private toggle() {
    this._open = !this._open
    this.panel.style.display = this._open ? 'flex' : 'none'
    if (this._open) this.refresh()
  }

  private refresh() {
    // Actualizar badge de conteo (otros + yo)
    const total = this.names.size + (this.myName ? 1 : 0)
    this.countBadge.textContent = String(total)

    if (!this._open) return

    this.list.innerHTML = ''

    // Mi propio nombre primero
    if (this.myName) {
      const li = this.makeItem(this.myName, true)
      this.list.appendChild(li)
    }

    // Ordenar el resto alfabéticamente
    const sorted = [...this.names.values()].sort((a, b) => a.localeCompare(b))
    sorted.forEach(name => {
      this.list.appendChild(this.makeItem(name, false))
    })

    // Vacío
    if (total === 0) {
      const li = document.createElement('li')
      li.style.cssText = 'color:#3A2010;font-size:11px;font-style:italic;padding:4px 0;'
      li.textContent = 'Solo estás tú...'
      this.list.appendChild(li)
    }
  }

  private makeItem(name: string, isSelf: boolean): HTMLLIElement {
    const li = document.createElement('li')
    li.className = 'ul-item' + (isSelf ? ' ul-self' : '')

    const dot = document.createElement('span')
    dot.className = 'ul-dot'

    const nm = document.createElement('span')
    nm.textContent = isSelf ? `${name} (tú)` : name

    li.appendChild(dot)
    li.appendChild(nm)
    return li
  }

  // ─── ESTILOS ──────────────────────────────────────────────────────────────

  private injectStyles() {
    if (document.getElementById('ul-styles')) return
    const s = document.createElement('style')
    s.id = 'ul-styles'
    s.textContent = `
      #ul-btn {
        position: fixed;
        top: 16px; right: 16px;
        width: 44px; height: 44px;
        background: rgba(8,6,4,.85);
        border: 1px solid rgba(60,36,12,.55);
        border-radius: 50%;
        font-size: 17px; cursor: pointer;
        z-index: 100; display: flex; align-items: center; justify-content: center;
        backdrop-filter: blur(4px);
        transition: background .15s;
        touch-action: manipulation;
      }
      #ul-btn:hover { background: rgba(30,18,6,.95); }

      #ul-badge {
        position: absolute; top: -4px; right: -4px;
        min-width: 16px; height: 16px;
        background: #C8956C; color: #0A0806;
        border-radius: 8px; font-size: 9px; font-weight: bold;
        display: flex; align-items: center; justify-content: center;
        padding: 0 3px; pointer-events: none;
        font-family: Arial, sans-serif;
      }

      #ul-panel {
        position: fixed;
        top: 68px; right: 16px;
        width: min(220px, calc(100vw - 32px));
        max-height: min(320px, 55vh);
        background: rgba(8,6,4,.94);
        border: 1px solid rgba(60,36,12,.55);
        border-radius: 12px;
        z-index: 100;
        flex-direction: column;
        backdrop-filter: blur(6px);
        font-family: Arial, sans-serif;
        overflow: hidden;
      }

      #ul-head {
        display: flex; align-items: center; justify-content: space-between;
        padding: 8px 12px; border-bottom: 1px solid rgba(40,24,8,.50); flex-shrink: 0;
      }

      #ul-close {
        background: none; border: none; color: #4A2E12;
        font-size: 12px; cursor: pointer; padding: 4px 6px; transition: color .15s;
      }
      #ul-close:hover { color: #C8956C; }

      #ul-list {
        flex: 1; overflow-y: auto; padding: 8px 12px;
        list-style: none; margin: 0; display: flex; flex-direction: column; gap: 6px;
        scrollbar-width: thin; scrollbar-color: #2E1A0A transparent;
      }
      #ul-list::-webkit-scrollbar { width: 3px; }
      #ul-list::-webkit-scrollbar-thumb { background: #2E1A0A; border-radius: 2px; }

      .ul-item {
        display: flex; align-items: center; gap: 7px;
        font-size: 12px; color: #C8956C;
      }
      .ul-self { color: #D4A96A; font-weight: bold; }

      .ul-dot {
        width: 7px; height: 7px; border-radius: 50%;
        background: #3A5A28; flex-shrink: 0;
      }
      .ul-self .ul-dot { background: #C8956C; }
    `
    document.head.appendChild(s)
  }
}
