import {
  Scene,
  TransformNode,
  Vector3,
  StandardMaterial,
  Color3,
  MeshBuilder,
  DynamicTexture,
  Mesh,
  Observer,
} from '@babylonjs/core'
import { GLBAvatar } from './GLBAvatar'

type RGB = [number, number, number]

/**
 * RemotePlayer — avatar de otro usuario en la sala.
 *
 * Carga el mismo GLB que el jugador local (/models/avatar.glb),
 * aplica los colores recibidos por WebSocket, y hace lerp
 * suave hacia la posición/rotación objetivo.
 */
export class RemotePlayer {
  private scene:      Scene
  public  root:       TransformNode
  private glbAvatar:  GLBAvatar | null = null
  private nameplateTex: DynamicTexture | null = null
  private bubblePlane:  Mesh | null = null
  private bubbleTex:    DynamicTexture | null = null
  private bubbleTimer:  ReturnType<typeof setTimeout> | null = null

  private targetPos   = new Vector3(0, 0, 0)
  private targetRY    = 0
  private lastMoveAt  = 0          // timestamp del último movimiento recibido
  private _wasMoving  = false

  private _obs: Observer<any> | null = null

  // Avatar actual cargado y últimos colores recibidos (para reaplicar tras cargar)
  private currentUrl = ''
  private _colors: { skin: RGB; hair: RGB; jacket: RGB; pants: RGB; isDoll: boolean } | null = null

  constructor(scene: Scene, id: string) {
    this.scene = scene
    this.root  = new TransformNode(`remote_${id}`, scene)

    // El avatar concreto se carga en applyIdentity() cuando llega la identidad
    // del jugador (que trae su avatarUrl). spawnRemote la llama de inmediato,
    // así que no hace falta cargar un GLB por defecto aquí.
    this.buildNameplate()
    this.buildSpeechBubble()

    // Loop de actualización (lerp)
    this._obs = scene.onBeforeRenderObservable.add(() => this.update())
  }

  // ─── API ──────────────────────────────────────────────────────────────────

  moveTo(x: number, y: number, z: number, ry: number) {
    const dist = Vector3.Distance(this.targetPos, new Vector3(x, y, z))
    if (dist > 0.02) this.lastMoveAt = Date.now()
    this.targetPos.set(x, y, z)
    this.targetRY = ry
  }

  applyIdentity(name: string, skin: RGB, hair: RGB, jacket: RGB, pants: RGB, avatarUrl?: string) {
    this.drawNameplate(name)

    const url = avatarUrl || '/models/avatar.glb'
    const isDoll = url.includes('avatar_doll')   // solo el muñeco es recolorable
    this._colors = { skin, hair, jacket, pants, isDoll }

    if (url !== this.currentUrl) {
      this.currentUrl = url
      this.loadAvatar(url)      // cambió de avatar → cargar el nuevo
    } else {
      this.applyColors()        // mismo avatar → solo actualizar color (si es muñeco)
    }
  }

  private loadAvatar(url: string) {
    this.glbAvatar?.dispose()
    this.glbAvatar = null
    const glb = new GLBAvatar(this.scene, this.root)
    glb.load(url).then(ok => {
      if (!ok) return
      this.glbAvatar = glb
      glb.playIdle()
      glb.addCharacterLight()
      this.applyColors()
    })
  }

  private applyColors() {
    // Los avatares realistas usan textura horneada: tintarlos se ve mal, así
    // que solo se aplica color al muñeco estilizado.
    if (!this.glbAvatar || !this._colors || !this._colors.isDoll) return
    const { skin, hair, jacket, pants } = this._colors
    this.glbAvatar.updateSkin(...skin)
    this.glbAvatar.updateHair(...hair)
    this.glbAvatar.updateJacket(...jacket)
    this.glbAvatar.updatePants(...pants)
  }

  showSpeechBubble(text: string) {
    if (!this.bubblePlane || !this.bubbleTex) return
    if (this.bubbleTimer) clearTimeout(this.bubbleTimer)

    const ctx = this.bubbleTex.getContext()
    ctx.clearRect(0, 0, 512, 112)
    ctx.fillStyle = 'rgba(255, 253, 240, 0.92)'
    this.pill(ctx, 6, 6, 500, 100, 50); ctx.fill()
    ctx.strokeStyle = 'rgba(200, 149, 108, 0.60)'
    ctx.lineWidth = 3
    this.pill(ctx, 6, 6, 500, 100, 50); ctx.stroke()
    ctx.fillStyle = '#1A0E06'
    ctx.font = 'bold 38px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const MAX = 22
    const display = text.length > MAX ? text.slice(0, MAX - 1) + '…' : text
    ctx.fillText(display, 256, 56)
    this.bubbleTex.update()

    this.bubblePlane.isVisible = true
    this.bubbleTimer = setTimeout(() => {
      if (this.bubblePlane) this.bubblePlane.isVisible = false
    }, 4000)
  }

  dispose() {
    if (this.bubbleTimer) clearTimeout(this.bubbleTimer)
    if (this._obs) this.scene.onBeforeRenderObservable.remove(this._obs)
    this.glbAvatar?.dispose()
    this.nameplateTex?.dispose()
    this.bubbleTex?.dispose()
    this.root.dispose()
  }

  // ─── LOOP ─────────────────────────────────────────────────────────────────

  private update() {
    // Lerp posición y rotación
    this.root.position = Vector3.Lerp(this.root.position, this.targetPos, 0.14)
    const dr = this.targetRY - this.root.rotation.y
    // Normalizar ángulo para evitar giros de 360°
    const drNorm = ((dr + Math.PI) % (2 * Math.PI)) - Math.PI
    this.root.rotation.y += drNorm * 0.14

    // Detectar si está caminando (recibió movimiento en los últimos 250 ms)
    const isMoving = Date.now() - this.lastMoveAt < 250
    if (this.glbAvatar) {
      if (isMoving  && !this._wasMoving) this.glbAvatar.playWalk()
      if (!isMoving &&  this._wasMoving) this.glbAvatar.playIdle()
    }
    this._wasMoving = isMoving
  }

  // ─── NAMEPLATE ────────────────────────────────────────────────────────────

  private buildNameplate() {
    const plane = MeshBuilder.CreatePlane('rp_nplate', { width: 1.4, height: 0.28 }, this.scene)
    plane.position.set(0, 2.52, 0)
    plane.parent = this.root
    plane.billboardMode = Mesh.BILLBOARDMODE_ALL

    this.nameplateTex = new DynamicTexture('rp_nTex', { width: 512, height: 104 }, this.scene)
    this.nameplateTex.hasAlpha = true
    this.drawNameplate('...')

    const mat = new StandardMaterial('rp_nMat', this.scene)
    mat.diffuseTexture  = this.nameplateTex
    mat.emissiveColor   = Color3.White()
    mat.disableLighting = true
    mat.backFaceCulling = false
    plane.material = mat
  }

  private drawNameplate(text: string) {
    if (!this.nameplateTex) return
    const ctx = this.nameplateTex.getContext()
    ctx.clearRect(0, 0, 512, 104)
    ctx.fillStyle = 'rgba(10, 8, 6, 0.80)'
    this.pill(ctx, 8, 8, 496, 88, 44)
    ctx.fill()
    ctx.fillStyle = '#F5E6C8'
    ctx.font = 'bold 44px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text.slice(0, 20), 256, 54)
    this.nameplateTex.update()
  }

  private buildSpeechBubble() {
    const plane = MeshBuilder.CreatePlane('bubble_rp', { width: 1.8, height: 0.40 }, this.scene)
    plane.position.set(0, 2.98, 0)
    plane.parent = this.root
    plane.billboardMode = Mesh.BILLBOARDMODE_ALL
    plane.isVisible = false
    this.bubblePlane = plane

    this.bubbleTex = new DynamicTexture('bubbleTex_rp', { width: 512, height: 112 }, this.scene)
    this.bubbleTex.hasAlpha = true

    const mat = new StandardMaterial('bubbleMat_rp', this.scene)
    mat.diffuseTexture  = this.bubbleTex
    mat.emissiveColor   = Color3.White()
    mat.disableLighting = true
    mat.backFaceCulling = false
    plane.material = mat
  }

  private pill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath()
    ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y)
    ctx.quadraticCurveTo(x+w, y, x+w, y+r); ctx.lineTo(x+w, y+h-r)
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h); ctx.lineTo(x+r, y+h)
    ctx.quadraticCurveTo(x, y+h, x, y+h-r); ctx.lineTo(x, y+r)
    ctx.quadraticCurveTo(x, y, x+r, y); ctx.closePath()
  }
}
