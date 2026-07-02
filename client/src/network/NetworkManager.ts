import { Scene } from '@babylonjs/core'
import { LocalPlayer } from '../avatar/LocalPlayer'
import { RemotePlayer } from '../avatar/RemotePlayer'

type RGB = [number, number, number]

interface PlayerData {
  id:     string
  name:   string
  x:      number
  y:      number
  z:      number
  ry:     number
  skin:   RGB
  hair:   RGB
  jacket: RGB
  pants:  RGB
}

/**
 * NetworkManager — sincroniza al jugador local con el servidor WebSocket
 * y renderiza los avatares de los demás jugadores en la escena.
 *
 * Protocolo:
 *   Server → Client:  welcome | player_join | player_move | player_identity |
 *                     player_leave | chat | radio_state
 *   Client → Server:  identity | move | chat | radio_change
 */
export class NetworkManager {
  private ws:             WebSocket
  private scene:          Scene
  private localPlayer:    LocalPlayer
  private remotePlayers = new Map<string, RemotePlayer>()
  private myId          = ''

  // Callback de chat: (id, name, text, isSelf)
  onChat: ((id: string, name: string, text: string, isSelf: boolean) => void) | null = null

  // Callback de susurro: (fromName, toName, text, isSelf)
  onWhisper: ((fromName: string, toName: string, text: string, isSelf: boolean) => void) | null = null

  // Callback de error de susurro: (targetName)
  onWhisperError: ((targetName: string) => void) | null = null

  // Callback de radio: (category, idx, customUrl?, customLabel?)
  onRadioChange: ((category: string, idx: number, customUrl?: string, customLabel?: string) => void) | null = null

  // Identidad pendiente (puede enviarse antes de que abra el WS)
  private pendingIdentity: object | null = null

  // Intervalo de envío de posición
  private sendInterval: ReturnType<typeof setInterval> | null = null
  private lastSent = { x: 0, y: 0, z: 0, ry: 0 }

  constructor(scene: Scene, localPlayer: LocalPlayer) {
    this.scene       = scene
    this.localPlayer = localPlayer
    this.connect()
  }

  // ─── CONEXIÓN ─────────────────────────────────────────────────────────────

  private connect() {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws'
    const url   = `${proto}://${location.host}/ws`

    try {
      this.ws = new WebSocket(url)
    } catch (err) {
      console.warn('[Atlas WS] No se pudo crear WebSocket:', err)
      return
    }

    this.ws.onopen = () => {
      console.log('[Atlas WS] Conectado')
      if (this.pendingIdentity) {
        this.send(this.pendingIdentity)
        this.pendingIdentity = null
      }
      this.sendInterval = setInterval(() => this.sendPosition(), 50)
    }

    this.ws.onmessage = (e) => {
      try { this.handleMessage(JSON.parse(e.data)) } catch { /* ignorar */ }
    }

    this.ws.onclose = () => {
      console.log('[Atlas WS] Desconectado')
      if (this.sendInterval) clearInterval(this.sendInterval)
    }

    this.ws.onerror = () => {
      console.warn('[Atlas WS] Error — el servidor puede no estar corriendo.')
    }
  }

  // ─── MENSAJES ENTRANTES ───────────────────────────────────────────────────

  private handleMessage(msg: any) {
    switch (msg.type) {
      case 'welcome':
        this.myId = msg.id
        console.log(`[Atlas WS] ID local: ${this.myId.slice(0, 8)}`)
        ;(msg.players as PlayerData[]).forEach(p => this.spawnRemote(p))
        // Aplicar estado de radio de la sala
        if (msg.radioState) {
          this.onRadioChange?.(
            msg.radioState.category,
            msg.radioState.idx,
            msg.radioState.customUrl,
            msg.radioState.customLabel,
          )
        }
        break

      case 'player_join':
        if (msg.id !== this.myId) this.spawnRemote(msg as PlayerData)
        break

      case 'player_move':
        this.remotePlayers.get(msg.id)?.moveTo(msg.x, msg.y, msg.z, msg.ry)
        break

      case 'player_identity': {
        const rp = this.remotePlayers.get(msg.id)
        if (rp) rp.applyIdentity(msg.name, msg.skin, msg.hair, msg.jacket, msg.pants)
        break
      }

      case 'player_leave':
        this.remotePlayers.get(msg.id)?.dispose()
        this.remotePlayers.delete(msg.id)
        console.log(`[Atlas WS] Jugador salió: ${(msg.id as string).slice(0, 8)}`)
        break

      case 'chat': {
        const isSelf = msg.id === this.myId
        if (isSelf) {
          this.localPlayer.showSpeechBubble(msg.text)
        } else {
          this.remotePlayers.get(msg.id)?.showSpeechBubble(msg.text)
        }
        this.onChat?.(msg.id, msg.name, msg.text, isSelf)
        break
      }

      case 'radio_state':
        // El servidor retransmite radio_state a todos cada vez que alguien cambia
        this.onRadioChange?.(msg.category, msg.idx, msg.customUrl, msg.customLabel)
        break

      case 'whisper':
        this.onWhisper?.(msg.fromName, msg.toName, msg.text, msg.isSelf === true)
        break

      case 'whisper_error':
        this.onWhisperError?.(msg.targetName)
        break
    }
  }

  // ─── REMOTES ──────────────────────────────────────────────────────────────

  private spawnRemote(data: PlayerData) {
    if (this.remotePlayers.has(data.id)) return
    const rp = new RemotePlayer(this.scene, data.id)
    rp.moveTo(data.x, data.y, data.z, data.ry)
    rp.applyIdentity(data.name, data.skin, data.hair, data.jacket, data.pants)
    this.remotePlayers.set(data.id, rp)
    console.log(`[Atlas WS] Jugador en sala: ${data.id.slice(0, 8)} (${data.name})`)
  }

  // ─── MENSAJES SALIENTES ───────────────────────────────────────────────────

  sendIdentity(name: string, skin: RGB, hair: RGB, jacket: RGB, pants: RGB) {
    const data = { type: 'identity', name, skin, hair, jacket, pants }
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send(data)
    } else {
      this.pendingIdentity = data
    }
  }

  sendChat(text: string) {
    this.send({ type: 'chat', text })
  }

  sendRadioChange(category: string, idx: number, customUrl?: string, customLabel?: string) {
    this.send({ type: 'radio_change', category, idx, customUrl, customLabel })
  }

  sendWhisper(targetName: string, text: string) {
    this.send({ type: 'whisper', targetName, text })
  }

  private sendPosition() {
    const pos = this.localPlayer.root.position
    const ry  = this.localPlayer.root.rotation.y
    const dx  = Math.abs(pos.x - this.lastSent.x)
    const dz  = Math.abs(pos.z - this.lastSent.z)
    const dr  = Math.abs(ry   - this.lastSent.ry)

    if (dx > 0.005 || dz > 0.005 || dr > 0.01) {
      this.send({ type: 'move', x: pos.x, y: pos.y, z: pos.z, ry })
      this.lastSent = { x: pos.x, y: pos.y, z: pos.z, ry }
    }
  }

  private send(data: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  // ─── LIMPIEZA ─────────────────────────────────────────────────────────────

  dispose() {
    if (this.sendInterval) clearInterval(this.sendInterval)
    this.ws?.close()
    this.remotePlayers.forEach(rp => rp.dispose())
    this.remotePlayers.clear()
  }
}
