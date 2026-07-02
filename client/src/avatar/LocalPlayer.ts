import {
  Scene,
  MeshBuilder,
  PBRMaterial,
  StandardMaterial,
  Color3,
  Color4,
  Vector3,
  TransformNode,
  ArcRotateCamera,
  Mesh,
  DynamicTexture,
  Animation,
} from '@babylonjs/core'
import { GLBAvatar } from './GLBAvatar'

// URL del modelo GLB — archivo colocado en client/public/models/
const GLB_URL = '/models/avatar.glb'

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface AvatarColors {
  skin:   [number, number, number]
  hair:   [number, number, number]
  jacket: [number, number, number]
  shirt:  [number, number, number]
  pants:  [number, number, number]
}

/**
 * LocalPlayer — avatar con materiales PBR, geometría detallada y
 * modo de personalización (cámara frontal, control desactivado).
 */
export class LocalPlayer {
  private scene:  Scene
  public  camera: ArcRotateCamera
  public  root:   TransformNode
  private speed = 0.055
  private keys:   Record<string, boolean> = {}
  private username = 'Tú'

  // Avatar GLB (cuando el modelo externo está disponible)
  private glbAvatar: GLBAvatar | null = null
  private usingGLB  = false

  // Raíz del avatar procedural (se oculta cuando carga el GLB)
  private proceduralRoot!: TransformNode

  // Materiales PBR del avatar procedural (fallback)
  private mSkin:   PBRMaterial
  private mHair:   PBRMaterial
  private mJacket: PBRMaterial
  private mShirt:  PBRMaterial
  private mPants:  PBRMaterial

  // Nameplate
  private nameplateTex!: DynamicTexture

  // Burbuja de chat
  private bubblePlane!: Mesh
  private bubbleTex!:   DynamicTexture
  private bubbleTimer:  ReturnType<typeof setTimeout> | null = null

  // Estado de la cámara para modo personalización
  private savedAlpha  = -Math.PI / 2
  private savedBeta   = Math.PI / 3
  private savedRadius = 8

  // Joystick virtual (móvil)
  private joyX = 0
  private joyY = 0

  private onKeyDown: (e: KeyboardEvent) => void
  private onKeyUp:   (e: KeyboardEvent) => void

  constructor(scene: Scene, camera: ArcRotateCamera) {
    this.scene  = scene
    this.camera = camera

    // Materiales PBR por defecto (avatar procedural)
    this.mSkin   = this.pbr('skin',   0.76, 0.56, 0.42, 0.82, 0.00)
    this.mHair   = this.pbr('hair',   0.10, 0.07, 0.04, 0.90, 0.00)
    this.mJacket = this.pbr('jacket', 0.14, 0.26, 0.52, 0.78, 0.00)
    this.mShirt  = this.pbr('shirt',  0.22, 0.42, 0.72, 0.88, 0.00)
    this.mPants  = this.pbr('pants',  0.12, 0.14, 0.22, 0.85, 0.00)

    this.root = new TransformNode('localPlayer', this.scene)
    this.root.position.set(0, 0, 4.5)
    this.camera.target = new Vector3(0, 1, 4.5)

    // proceduralRoot agrupa los meshes del avatar procedural —
    // se oculta completo cuando el GLB carga con éxito
    this.proceduralRoot = new TransformNode('proceduralRoot', this.scene)
    this.proceduralRoot.parent = this.root

    this.buildBody()
    this.buildNameplate()
    this.buildSpeechBubble()
    this.buildFloorRing()

    // Intentar cargar el GLB externo (Quaternius u otro)
    this.tryLoadGLB()

    this.onKeyDown = (e) => { this.keys[e.code] = true }
    this.onKeyUp   = (e) => { this.keys[e.code] = false }
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup',   this.onKeyUp)

    scene.onBeforeRenderObservable.add(() => this.update())
  }

  // ─── CARGA DE MODELO GLB ─────────────────────────────────────────────────

  private async tryLoadGLB() {
    const glb = new GLBAvatar(this.scene, this.root)
    const ok  = await glb.load(GLB_URL)

    if (ok) {
      this.proceduralRoot.setEnabled(false)
      this.glbAvatar = glb
      this.usingGLB  = true
      glb.addCharacterLight()
      glb.playIdle()
      console.log('[Atlas] Modo GLB activo.')
    }
  }

  /**
   * Carga un modelo GLB desde cualquier URL y reemplaza el avatar actual.
   * Util para futuros sistemas de avatar (Avaturn, GLB propio, etc.)
   */
  async loadAvatarFromURL(url: string): Promise<boolean> {
    const glb = new GLBAvatar(this.scene, this.root)
    const ok  = await glb.load(url)

    if (ok) {
      this.glbAvatar?.dispose()
      this.proceduralRoot.setEnabled(false)
      this.glbAvatar = glb
      this.usingGLB  = true
      glb.addCharacterLight()
      glb.playIdle()
      console.log('[Atlas] GLB externo cargado:', url)
    }

    return ok
  }

  // ─── API DE PERSONALIZACIÓN ───────────────────────────────────────────────

  updateSkin(r: number, g: number, b: number) {
    if (this.usingGLB && this.glbAvatar) {
      this.glbAvatar.updateSkin(r, g, b)
    } else {
      this.mSkin.albedoColor.set(r, g, b)
    }
  }

  updateHair(r: number, g: number, b: number) {
    if (this.usingGLB && this.glbAvatar) {
      this.glbAvatar.updateHair(r, g, b)
    } else {
      this.mHair.albedoColor.set(r, g, b)
    }
  }

  updateOutfit(
    jacket: [number, number, number],
    shirt:  [number, number, number],
    pants:  [number, number, number],
  ) {
    if (this.usingGLB && this.glbAvatar) {
      this.glbAvatar.updateJacket(...jacket)
      this.glbAvatar.updatePants(...pants)
    } else {
      this.mJacket.albedoColor.set(...jacket)
      this.mShirt.albedoColor.set(...shirt)
      this.mPants.albedoColor.set(...pants)
    }
  }

  updateNameplate(name: string) {
    this.username = name || 'Tú'
    this.drawNameplate(this.username)
  }

  /** Recibe dirección del joystick virtual (x,y ∈ [-1,1]). y<0=adelante, y>0=atrás */
  setJoystickDir(x: number, y: number) {
    this.joyX = x
    this.joyY = y
  }

  /** Activa la vista de personalización: cámara frontal, sin control de ratón */
  enterCustomizerMode() {
    this.savedAlpha  = this.camera.alpha
    this.savedBeta   = this.camera.beta
    this.savedRadius = this.camera.radius

    // Rotar avatar para mirar hacia la cámara
    this.root.rotation.y = 0

    // Cámara en frente del avatar a altura media
    this.camera.alpha  = Math.PI / 2   // cámara al frente (ve cara +Z)
    this.camera.beta   = Math.PI / 2.6 // ligeramente elevada
    this.camera.radius = 3.8
    this.camera.target = new Vector3(
      this.root.position.x,
      1.0,
      this.root.position.z,
    )

    // Desactivar control de ratón para no interferir con la UI
    this.camera.detachControl()
  }

  /** Restaura la cámara en tercera persona al entrar al mundo */
  exitCustomizerMode(canvas: HTMLCanvasElement) {
    this.camera.alpha  = this.savedAlpha
    this.camera.beta   = this.savedBeta
    this.camera.radius = this.savedRadius
    this.camera.attachControl(canvas, true)
  }

  // ─── CONSTRUCCIÓN DEL AVATAR ─────────────────────────────────────────────

  private buildBody() {
    const r = this.proceduralRoot

    // Materiales adicionales fijos
    const mShoes  = this.pbr('shoes',  0.06, 0.05, 0.04, 0.60, 0.10)
    const mBelt   = this.pbr('belt',   0.04, 0.04, 0.04, 0.50, 0.20)
    const mButton = this.pbr('button', 0.70, 0.60, 0.20, 0.30, 0.80) // botones dorados
    const mEye    = this.pbr('eye',    0.05, 0.05, 0.06, 0.10, 0.10)
    const mWhite  = this.pbr('white',  0.95, 0.93, 0.90, 0.90, 0.00) // esclerótica

    // ── ZAPATOS ────────────────────────────────────────────────────────────
    for (const sx of [-0.115, 0.115]) {
      // Cuerpo del zapato
      const shoe = MeshBuilder.CreateBox(`shoe${sx}`, { width:0.21, height:0.09, depth:0.32 }, this.scene)
      shoe.position.set(sx, 0.045, 0.02); shoe.parent = r; shoe.material = mShoes
      // Punta del zapato (ligeramente más baja y saliente)
      const toe = MeshBuilder.CreateBox(`toe${sx}`, { width:0.18, height:0.06, depth:0.10 }, this.scene)
      toe.position.set(sx, 0.030, 0.19); toe.parent = r; toe.material = mShoes
      // Suela
      const sole = MeshBuilder.CreateBox(`sole${sx}`, { width:0.22, height:0.025, depth:0.36 }, this.scene)
      sole.position.set(sx, 0.012, 0.02); sole.parent = r
      const soleMat = this.pbr(`sole${sx}`, 0.03, 0.03, 0.03, 0.55, 0.00)
      sole.material = soleMat
    }

    // ── TOBILLOS ───────────────────────────────────────────────────────────
    for (const sx of [-0.115, 0.115]) {
      const ankle = MeshBuilder.CreateCylinder(`ankle${sx}`, { diameterTop:0.13, diameterBottom:0.12, height:0.12, tessellation:10 }, this.scene)
      ankle.position.set(sx, 0.16, 0); ankle.parent = r; ankle.material = this.mPants
    }

    // ── ESPINILLAS ─────────────────────────────────────────────────────────
    for (const sx of [-0.115, 0.115]) {
      const shin = MeshBuilder.CreateCylinder(`shin${sx}`, { diameterTop:0.18, diameterBottom:0.14, height:0.34, tessellation:12 }, this.scene)
      shin.position.set(sx, 0.34, 0); shin.parent = r; shin.material = this.mPants
    }

    // ── RODILLAS ───────────────────────────────────────────────────────────
    for (const sx of [-0.115, 0.115]) {
      const knee = MeshBuilder.CreateSphere(`knee${sx}`, { diameter:0.20, segments:8 }, this.scene)
      knee.position.set(sx, 0.53, 0); knee.scaling.set(1, 0.75, 0.85)
      knee.parent = r; knee.material = this.mPants
    }

    // ── MUSLOS ─────────────────────────────────────────────────────────────
    for (const sx of [-0.115, 0.115]) {
      const thigh = MeshBuilder.CreateCylinder(`thigh${sx}`, { diameterTop:0.25, diameterBottom:0.20, height:0.40, tessellation:12 }, this.scene)
      thigh.position.set(sx, 0.73, 0); thigh.parent = r; thigh.material = this.mPants
    }

    // ── CADERA / PELVIS ────────────────────────────────────────────────────
    const hip = MeshBuilder.CreateCylinder('hip', { diameterTop:0.52, diameterBottom:0.50, height:0.18, tessellation:16 }, this.scene)
    hip.position.set(0, 0.96, 0); hip.parent = r; hip.material = this.mPants

    // ── CINTURÓN ───────────────────────────────────────────────────────────
    const belt = MeshBuilder.CreateCylinder('belt', { diameter:0.53, height:0.05, tessellation:20 }, this.scene)
    belt.position.set(0, 1.07, 0); belt.parent = r; belt.material = mBelt
    // Hebilla
    const buckle = MeshBuilder.CreateBox('buckle', { width:0.06, height:0.04, depth:0.03 }, this.scene)
    buckle.position.set(0, 1.07, -0.27); buckle.parent = r
    const buckMat = this.pbr('buckle', 0.75, 0.65, 0.20, 0.25, 0.90)
    buckle.material = buckMat

    // ── TORSO / CAMISA ─────────────────────────────────────────────────────
    const torso = MeshBuilder.CreateCylinder('torso', { diameterTop:0.58, diameterBottom:0.46, height:0.62, tessellation:16 }, this.scene)
    torso.position.set(0, 1.24, 0); torso.parent = r; torso.material = this.mShirt

    // Cuello de camisa (visible sobre chaqueta)
    const collar = MeshBuilder.CreateCylinder('collar', { diameterTop:0.20, diameterBottom:0.22, height:0.10, tessellation:12 }, this.scene)
    collar.position.set(0, 1.58, 0); collar.parent = r; collar.material = this.mShirt

    // ── CHAQUETA (ligeramente más ancha que torso — efecto 3D de ropa) ────
    // Panel izquierdo
    const jL = MeshBuilder.CreateBox('jL', { width:0.30, height:0.58, depth:0.32 }, this.scene)
    jL.position.set(-0.15, 1.24, 0); jL.parent = r; jL.material = this.mJacket
    // Panel derecho
    const jR = MeshBuilder.CreateBox('jR', { width:0.30, height:0.58, depth:0.32 }, this.scene)
    jR.position.set( 0.15, 1.24, 0); jR.parent = r; jR.material = this.mJacket

    // Solapas (inclinadas, mostrando camisa debajo)
    for (const [sx, rz] of [[-0.06, 0.28], [0.06, -0.28]] as [number,number][]) {
      const lapel = MeshBuilder.CreateBox(`lapel${sx}`, { width:0.10, height:0.22, depth:0.33 }, this.scene)
      lapel.position.set(sx, 1.36, 0); lapel.rotation.z = rz
      lapel.parent = r; lapel.material = this.mShirt
    }

    // Botones de la chaqueta (3 botones dorados)
    for (let i = 0; i < 3; i++) {
      const btn = MeshBuilder.CreateSphere(`btn${i}`, { diameter:0.035, segments:6 }, this.scene)
      btn.position.set(0.01, 1.42 - i * 0.10, -0.27)
      btn.parent = r; btn.material = mButton
    }

    // ── HOMBROS ────────────────────────────────────────────────────────────
    for (const sx of [-0.32, 0.32]) {
      const sh = MeshBuilder.CreateSphere(`sh${sx}`, { diameter:0.26, segments:10 }, this.scene)
      sh.position.set(sx, 1.42, 0); sh.scaling.set(1, 0.85, 0.90)
      sh.parent = r; sh.material = this.mJacket
    }

    // ── BRAZOS SUPERIORES ──────────────────────────────────────────────────
    for (const sx of [-0.32, 0.32]) {
      const ua = MeshBuilder.CreateCylinder(`ua${sx}`, { diameterTop:0.18, diameterBottom:0.15, height:0.42, tessellation:10 }, this.scene)
      ua.position.set(sx, 1.15, 0); ua.parent = r; ua.material = this.mJacket
    }

    // ── CODOS ──────────────────────────────────────────────────────────────
    for (const sx of [-0.32, 0.32]) {
      const elbow = MeshBuilder.CreateSphere(`elbow${sx}`, { diameter:0.16, segments:7 }, this.scene)
      elbow.position.set(sx, 0.92, 0); elbow.scaling.set(1, 0.80, 0.85)
      elbow.parent = r; elbow.material = this.mJacket
    }

    // ── BRAZOS INFERIORES ──────────────────────────────────────────────────
    for (const sx of [-0.32, 0.32]) {
      const la = MeshBuilder.CreateCylinder(`la${sx}`, { diameterTop:0.15, diameterBottom:0.12, height:0.36, tessellation:10 }, this.scene)
      la.position.set(sx, 0.73, 0); la.parent = r; la.material = this.mShirt
    }

    // ── MUÑECAS ────────────────────────────────────────────────────────────
    for (const sx of [-0.32, 0.32]) {
      const wr = MeshBuilder.CreateCylinder(`wr${sx}`, { diameter:0.11, height:0.07, tessellation:8 }, this.scene)
      wr.position.set(sx, 0.535, 0); wr.parent = r; wr.material = this.mSkin
    }

    // ── MANOS ──────────────────────────────────────────────────────────────
    for (const sx of [-0.32, 0.32]) {
      const hand = MeshBuilder.CreateSphere(`hand${sx}`, { diameter:0.16, segments:8 }, this.scene)
      hand.position.set(sx, 0.46, 0); hand.scaling.set(1.1, 0.85, 0.70)
      hand.parent = r; hand.material = this.mSkin

      // Pulgar
      const thumb = MeshBuilder.CreateSphere(`thumb${sx}`, { diameter:0.07, segments:5 }, this.scene)
      thumb.position.set(sx > 0 ? sx + 0.09 : sx - 0.09, 0.49, -0.03)
      thumb.parent = r; thumb.material = this.mSkin
    }

    // ── CUELLO ─────────────────────────────────────────────────────────────
    const neck = MeshBuilder.CreateCylinder('neck', { diameterTop:0.18, diameterBottom:0.20, height:0.18, tessellation:10 }, this.scene)
    neck.position.set(0, 1.62, 0); neck.parent = r; neck.material = this.mSkin

    // ── CABEZA ─────────────────────────────────────────────────────────────
    const head = MeshBuilder.CreateSphere('head', { diameter:0.46, segments:14 }, this.scene)
    head.position.set(0, 1.86, 0); head.scaling.set(1.0, 1.08, 0.95)
    head.parent = r; head.material = this.mSkin

    // ── OREJAS ─────────────────────────────────────────────────────────────
    for (const sx of [-0.24, 0.24]) {
      const ear = MeshBuilder.CreateSphere(`ear${sx}`, { diameter:0.10, segments:6 }, this.scene)
      ear.position.set(sx, 1.84, -0.02); ear.scaling.set(0.40, 0.65, 0.55)
      ear.parent = r; ear.material = this.mSkin
    }

    // ── OJOS ───────────────────────────────────────────────────────────────
    // La cara mira hacia -Z (hacia la cámara desde atrás)
    for (const sx of [-0.11, 0.11]) {
      // Esclerótica (blanco del ojo)
      const white = MeshBuilder.CreateSphere(`eyeW${sx}`, { diameter:0.09, segments:7 }, this.scene)
      white.position.set(sx, 1.89, -0.20); white.scaling.set(1, 0.75, 0.60)
      white.parent = r; white.material = mWhite
      // Iris
      const iris = MeshBuilder.CreateSphere(`eyeI${sx}`, { diameter:0.065, segments:7 }, this.scene)
      iris.position.set(sx, 1.89, -0.228); iris.scaling.set(1, 0.75, 0.60)
      iris.parent = r; iris.material = mEye
    }

    // ── NARIZ ──────────────────────────────────────────────────────────────
    const nose = MeshBuilder.CreateSphere('nose', { diameter:0.062, segments:6 }, this.scene)
    nose.position.set(0, 1.82, -0.23); nose.scaling.set(0.85, 0.70, 0.55)
    nose.parent = r; nose.material = this.mSkin

    // ── LABIOS ─────────────────────────────────────────────────────────────
    const lipMat = this.pbr('lip', 0.68, 0.38, 0.32, 0.80, 0.00)
    const lips = MeshBuilder.CreateBox('lips', { width:0.14, height:0.030, depth:0.025 }, this.scene)
    lips.position.set(0, 1.765, -0.225); lips.parent = r; lips.material = lipMat

    // ── CEJAS ──────────────────────────────────────────────────────────────
    for (const sx of [-0.10, 0.10]) {
      const brow = MeshBuilder.CreateBox(`brow${sx}`, { width:0.095, height:0.020, depth:0.022 }, this.scene)
      brow.position.set(sx, 1.940, -0.216); brow.rotation.z = sx > 0 ? -0.12 : 0.12
      brow.parent = r; brow.material = this.mHair
    }

    // ── CABELLO ────────────────────────────────────────────────────────────
    // Cúpula principal
    const hTop = MeshBuilder.CreateSphere('hTop', { diameter:0.50, segments:12 }, this.scene)
    hTop.position.set(0, 1.97, 0.01); hTop.scaling.set(1.02, 0.72, 1.00)
    hTop.parent = r; hTop.material = this.mHair

    // Lados del cabello (más volumen)
    for (const sx of [-0.24, 0.24]) {
      const hSide = MeshBuilder.CreateSphere(`hS${sx}`, { diameter:0.30, segments:8 }, this.scene)
      hSide.position.set(sx, 1.88, 0.00); hSide.scaling.set(0.60, 0.90, 0.80)
      hSide.parent = r; hSide.material = this.mHair
    }

    // Parte trasera del cabello
    const hBack = MeshBuilder.CreateBox('hBack', { width:0.46, height:0.28, depth:0.14 }, this.scene)
    hBack.position.set(0, 1.82, 0.18); hBack.parent = r; hBack.material = this.mHair

    // Flequillo / frente
    const hFront = MeshBuilder.CreateBox('hFront', { width:0.38, height:0.10, depth:0.10 }, this.scene)
    hFront.position.set(0, 2.00, -0.18); hFront.parent = r; hFront.material = this.mHair
  }

  // ─── NAMEPLATE ───────────────────────────────────────────────────────────

  private buildNameplate() {
    const plane = MeshBuilder.CreatePlane('nameplate', { width:1.4, height:0.28 }, this.scene)
    plane.position.set(0, 2.52, 0)
    plane.parent = this.root
    plane.billboardMode = Mesh.BILLBOARDMODE_ALL

    this.nameplateTex = new DynamicTexture('nameTex', { width:512, height:104 }, this.scene)
    this.nameplateTex.hasAlpha = true
    this.drawNameplate('Tú')

    const mat = new StandardMaterial('nameplateMat', this.scene)
    mat.diffuseTexture  = this.nameplateTex
    mat.emissiveColor   = Color3.White()
    mat.disableLighting = true
    mat.backFaceCulling = false
    plane.material = mat
  }

  private drawNameplate(text: string) {
    const ctx = this.nameplateTex.getContext()
    ctx.clearRect(0, 0, 512, 104)
    ctx.fillStyle = 'rgba(10, 8, 6, 0.80)'
    this.pill(ctx, 8, 8, 496, 88, 44); ctx.fill()
    ctx.fillStyle = '#F5E6C8'
    ctx.font = 'bold 44px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 256, 54)
    this.nameplateTex.update()
  }

  // ─── BURBUJA DE CHAT ─────────────────────────────────────────────────────

  private buildSpeechBubble() {
    this.bubblePlane = MeshBuilder.CreatePlane('bubble_local', { width: 1.8, height: 0.40 }, this.scene)
    this.bubblePlane.position.set(0, 2.98, 0)
    this.bubblePlane.parent = this.root
    this.bubblePlane.billboardMode = Mesh.BILLBOARDMODE_ALL
    this.bubblePlane.isVisible = false

    this.bubbleTex = new DynamicTexture('bubbleTex_local', { width: 512, height: 112 }, this.scene)
    this.bubbleTex.hasAlpha = true

    const mat = new StandardMaterial('bubbleMat_local', this.scene)
    mat.diffuseTexture  = this.bubbleTex
    mat.emissiveColor   = Color3.White()
    mat.disableLighting = true
    mat.backFaceCulling = false
    this.bubblePlane.material = mat
  }

  /** Muestra un mensaje sobre el avatar y lo oculta tras 4 segundos */
  showSpeechBubble(text: string) {
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
    // Truncar si el texto es muy largo
    const MAX = 22
    const display = text.length > MAX ? text.slice(0, MAX - 1) + '…' : text
    ctx.fillText(display, 256, 56)
    this.bubbleTex.update()

    this.bubblePlane.isVisible = true
    this.bubbleTimer = setTimeout(() => {
      this.bubblePlane.isVisible = false
    }, 4000)
  }

  // ─── ANILLO DE SUELO ─────────────────────────────────────────────────────

  private buildFloorRing() {
    const ring = MeshBuilder.CreateTorus('floorRing', { diameter:0.88, thickness:0.022, tessellation:44 }, this.scene)
    ring.position.set(0, 0.01, 0); ring.parent = this.root
    const mat = new StandardMaterial('ringMat', this.scene)
    mat.diffuseColor  = new Color3(0.28, 0.50, 0.82)
    mat.emissiveColor = new Color3(0.12, 0.28, 0.60)
    mat.alpha = 0.55
    ring.material = mat
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────

  private pbr(name: string, r: number, g: number, b: number, roughness = 0.85, metallic = 0.0): PBRMaterial {
    const m = new PBRMaterial(name + '_pbr', this.scene)
    m.albedoColor = new Color3(r, g, b)
    m.roughness   = roughness
    m.metallic    = metallic
    return m
  }

  private pill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rad: number) {
    ctx.beginPath()
    ctx.moveTo(x+rad, y); ctx.lineTo(x+w-rad, y)
    ctx.quadraticCurveTo(x+w, y, x+w, y+rad); ctx.lineTo(x+w, y+h-rad)
    ctx.quadraticCurveTo(x+w, y+h, x+w-rad, y+h); ctx.lineTo(x+rad, y+h)
    ctx.quadraticCurveTo(x, y+h, x, y+h-rad); ctx.lineTo(x, y+rad)
    ctx.quadraticCurveTo(x, y, x+rad, y); ctx.closePath()
  }

  // ─── LOOP ────────────────────────────────────────────────────────────────

  private _wasMoving = false

  private update() {
    const dir = Vector3.Zero()
    const a = this.camera.alpha
    const forward = new Vector3(-Math.sin(a), 0, -Math.cos(a))
    const right   = new Vector3( Math.cos(a), 0, -Math.sin(a))

    if (this.keys['KeyW'] || this.keys['ArrowUp'])    dir.addInPlace(forward)
    if (this.keys['KeyS'] || this.keys['ArrowDown'])  dir.subtractInPlace(forward)
    if (this.keys['KeyA'] || this.keys['ArrowLeft'])  dir.subtractInPlace(right)
    if (this.keys['KeyD'] || this.keys['ArrowRight']) dir.addInPlace(right)

    // Joystick virtual (móvil): y<0 = adelante, y>0 = atrás
    const JOY_DEAD = 0.15
    if (this.joyY < -JOY_DEAD) dir.addInPlace(forward)
    else if (this.joyY > JOY_DEAD) dir.subtractInPlace(forward)
    if (this.joyX > JOY_DEAD)  dir.addInPlace(right)
    else if (this.joyX < -JOY_DEAD) dir.subtractInPlace(right)

    const isMoving = dir.length() > 0

    if (isMoving) {
      dir.normalize().scaleInPlace(this.speed)
      const next = this.root.position.add(dir)
      // Límites de la cafetería ampliada (22 × 14 m)
      next.x = Math.max(-10.2, Math.min(10.2, next.x))
      next.z = Math.max(-6.2,  Math.min(6.2,  next.z))
      this.root.position = next
      this.root.rotation.y = Math.atan2(dir.x, dir.z)
    }

    // Transición idle ↔ walk
    if (this.usingGLB && this.glbAvatar) {
      if (isMoving && !this._wasMoving)  this.glbAvatar.playWalk()
      if (!isMoving && this._wasMoving)  this.glbAvatar.playIdle()
    }
    this._wasMoving = isMoving

    this.camera.target = Vector3.Lerp(
      this.camera.target,
      new Vector3(this.root.position.x, 1.0, this.root.position.z),
      0.12
    )
  }

  dispose() {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup',   this.onKeyUp)
    this.root.dispose()
  }
}
