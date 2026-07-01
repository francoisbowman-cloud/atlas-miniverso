import {
  Scene,
  SceneLoader,
  AbstractMesh,
  PBRMaterial,
  StandardMaterial,
  Color3,
  Vector3,
  TransformNode,
  AnimationGroup,
  PointLight,
  Observer,
} from '@babylonjs/core'

/**
 * GLBAvatar — carga un modelo GLB externo y expone métodos para
 * personalizar colores en tiempo real.
 *
 * Compatible con cualquier modelo GLB:
 *   - Maya FBX cm (Nathan / Renderpeople)
 *   - Blender m   (Atlas avatar propio, exportado con Y-up)
 *
 * La escala se normaliza automáticamente a 1.75 m de altura.
 * Los pies se alinean al suelo (Y=0) por bounding box.
 * La rotación correctiva se detecta automáticamente via bounding box
 * (no hay que configurarla manualmente por modelo).
 */
export class GLBAvatar {
  private scene:      Scene
  public  root:       TransformNode
  private corrective: TransformNode | null = null

  private skinMeshes:   AbstractMesh[] = []
  private hairMeshes:   AbstractMesh[] = []
  private jacketMeshes: AbstractMesh[] = []
  private pantsMeshes:  AbstractMesh[] = []

  public animations: AnimationGroup[] = []
  public loaded = false
  private characterLight: PointLight | null = null

  // ─── ANIMACION PROCEDURAL ────────────────────────────────────────────────
  private _animMode:     'idle' | 'walk' | 'none' = 'none'
  private _animTime      = 0
  private _animObserver: Observer<any> | null = null
  private _groundY       = 0   // offset Y para alinear pies con el suelo

  constructor(scene: Scene, root: TransformNode) {
    this.scene = scene
    this.root  = root
  }

  // ─── CARGA DEL GLB ────────────────────────────────────────────────────────

  async load(url: string): Promise<boolean> {
    try {
      const { file, keepTextures } = await GLBAvatar.prepareFile(url)

      return new Promise((resolve) => {
        SceneLoader.ImportMesh(
          '', '', file, this.scene,

          (meshes, _ps, _sk, animGroups) => {
            const rootMesh = meshes[0]
            let needsRotation = false

            if (rootMesh) {
              this.corrective = new TransformNode('glbCorrect', this.scene)
              this.corrective.parent   = this.root
              this.corrective.position = Vector3.Zero()
              rootMesh.parent   = this.corrective
              rootMesh.position = Vector3.Zero()

              // ── Detección automática de orientación ──────────────────────
              // Si el modelo viene en Z-up (sin conversión Y-up), aparecerá
              // acostado: su dimensión Z será mucho mayor que Y.
              // El exportador de Blender convierte a Y-up por defecto, así que
              // los avatares creados con create_avatar.py NO necesitan corrección.
              rootMesh.computeWorldMatrix(true)
              const bbCheck = rootMesh.getHierarchyBoundingVectors()
              const sizeY   = bbCheck.max.y - bbCheck.min.y
              const sizeZ   = bbCheck.max.z - bbCheck.min.z
              needsRotation = sizeZ > sizeY * 1.5   // modelo acostado → Z-up sin convertir
              if (needsRotation) {
                this.corrective.rotation.x = -Math.PI / 2
              }

              // ── Auto-escala universal: normaliza altura a 1.75 m ─────────
              // Calcular tras la posible rotación correctiva
              rootMesh.computeWorldMatrix(true)
              const bb0  = rootMesh.getHierarchyBoundingVectors()
              const rawH = bb0.max.y - bb0.min.y
              if (rawH > 0.001) {
                rootMesh.scaling.scaleInPlace(1.75 / rawH)
              }

              // ── Alinear pies al suelo (Y=0) ──────────────────────────────
              rootMesh.computeWorldMatrix(true)
              const { min } = rootMesh.getHierarchyBoundingVectors()
              this._groundY = -min.y
              this.corrective.position.y = this._groundY
            }

            this.classifyMeshes(meshes)

            if (!keepTextures) {
              meshes.forEach(m => {
                if (!m.material) return
                if (m.material.name === 'MI_Eyes') return
                const std = new StandardMaterial(m.material.name + '_atlas', this.scene)
                std.backFaceCulling = false
                m.material = std
              })
              this.updateSkin(0.76, 0.56, 0.42)
              this.updateHair(0.10, 0.07, 0.04)
              this.updateJacket(0.14, 0.26, 0.52)
              this.updatePants(0.12, 0.14, 0.22)
            } else {
              // Avatares realistas texturizados: convertir PBR → StandardMaterial
              // conservando la textura de color horneada. El material PBR de glTF
              // consume demasiados uniform buffers y no compila en GPUs integradas
              // (Intel HD 620: GL_MAX_VERTEX_UNIFORM_BUFFERS = 12). StandardMaterial
              // es mucho más ligero y conserva el look realista vía diffuseTexture.
              meshes.forEach(m => {
                const src = m.material
                if (!(src instanceof PBRMaterial)) return
                const std = new StandardMaterial(src.name + '_std', this.scene)
                std.diffuseTexture = src.albedoTexture           // color de piel/ropa horneado
                std.specularColor  = new Color3(0.05, 0.05, 0.05) // piel/tela: casi sin brillo
                std.backFaceCulling = src.backFaceCulling
                if (src.albedoTexture && (src.albedoTexture as any).hasAlpha) {
                  std.diffuseTexture!.hasAlpha = true
                  std.useAlphaFromDiffuseTexture = true
                }
                m.material = std
              })
            }

            this.animations = animGroups
            this.playIdle()
            this.loaded = true
            console.log(
              `[Atlas] GLB cargado. texturas=${keepTextures ? 'originales' : 'custom'} ` +
              `rotacion=${needsRotation ? 'corregida' : 'Y-up OK'}. ` +
              `groundY=${this._groundY.toFixed(3)}. ` +
              `Animaciones:`, animGroups.map(a => a.name)
            )
            resolve(true)
          },

          undefined,

          (_scene, message) => {
            console.warn('[Atlas] GLB no disponible, usando avatar procedural:', message)
            resolve(false)
          }
        )
      })
    } catch (err) {
      console.warn('[Atlas] Error preparando GLB:', err)
      return false
    }
  }

  // ─── PREPARACION DEL GLB (un solo fetch) ─────────────────────────────────
  // keepTextures=true  → PNG/JPEG embebidas seguras, GLB intacto
  // keepTextures=false → strip de texturas + reconstruccion del GLB

  // ─── PREPARACION DEL GLB (un solo fetch) ─────────────────────────────────
  // keepTextures=true  → PNG/JPEG embebidas seguras, GLB intacto, PBR original
  // keepTextures=false → strip de texturas + StandardMaterial con colores custom
  //
  // La detección de rotación (needsCorrectiveRotation) ya no está aquí —
  // se detecta automáticamente en el callback via bounding box.

  private static async prepareFile(url: string): Promise<{
    file:         File
    keepTextures: boolean
  }> {
    const buf  = await fetch(url).then(r => r.arrayBuffer())
    const view = new DataView(buf)
    if (view.getUint32(0, true) !== 0x46546C67) throw new Error('No es un GLB valido')

    const jsonChunkLen = view.getUint32(12, true)
    const json = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 20, jsonChunkLen)))

    const images    = (json.images || []) as Array<{ mimeType?: string }>
    const safeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    const keepTextures = images.length > 0 &&
      images.every(img => safeTypes.includes(img.mimeType ?? ''))

    let file: File

    if (keepTextures) {
      file = new File([buf], 'avatar.glb', { type: 'model/gltf-binary' })
    } else {
      json.images   = []
      json.textures = []
      json.samplers = []
      if (json.materials) {
        for (const mat of json.materials) {
          const pbr = mat.pbrMetallicRoughness
          if (pbr) { delete pbr.baseColorTexture; delete pbr.metallicRoughnessTexture }
          delete mat.normalTexture; delete mat.occlusionTexture; delete mat.emissiveTexture
        }
      }
      const jsonRaw = new TextEncoder().encode(JSON.stringify(json))
      const jsonPad = (4 - (jsonRaw.length & 3)) & 3
      const jsonLen = jsonRaw.length + jsonPad
      const binData = new Uint8Array(buf, 20 + jsonChunkLen)
      const totalLen = 12 + 8 + jsonLen + binData.byteLength
      const out = new Uint8Array(totalLen)
      const dv  = new DataView(out.buffer)
      dv.setUint32(0, 0x46546C67, true); dv.setUint32(4, 2, true); dv.setUint32(8, totalLen, true)
      dv.setUint32(12, jsonLen, true);   dv.setUint32(16, 0x4E4F534A, true)
      out.set(jsonRaw, 20)
      out.fill(0x20, 20 + jsonRaw.length, 20 + jsonLen)
      out.set(binData, 20 + jsonLen)
      file = new File([out.buffer], 'avatar.glb', { type: 'model/gltf-binary' })
    }

    return { file, keepTextures }
  }

  // ─── CLASIFICACION DE MATERIALES ─────────────────────────────────────────

  private classifyMeshes(meshes: AbstractMesh[]) {
    meshes.forEach(mesh => {
      if (!mesh.material) return
      const mat = mesh.material.name

      if (mat === 'MI_Hair_1')             this.hairMeshes.push(mesh)
      else if (mat === 'MI_Eyes')           return
      else if (mat === 'MI_Superhero_Male') this.skinMeshes.push(mesh)
      else {
        const name = (mat + ' ' + mesh.name).toLowerCase()
        const skinKeys   = ['skin', 'body', 'face', 'head', 'flesh']
        const hairKeys   = ['hair', 'eyebrow', 'beard']
        const jacketKeys = ['jacket', 'shirt', 'torso', 'chest', 'cloth', 'top', 'upper']
        const pantsKeys  = ['pant', 'leg', 'bottom', 'shoe', 'boot', 'foot', 'lower']

        if      (skinKeys.some(k => name.includes(k)))   this.skinMeshes.push(mesh)
        else if (hairKeys.some(k => name.includes(k)))   this.hairMeshes.push(mesh)
        else if (jacketKeys.some(k => name.includes(k))) this.jacketMeshes.push(mesh)
        else if (pantsKeys.some(k => name.includes(k)))  this.pantsMeshes.push(mesh)
      }
    })
  }

  // ─── ACTUALIZACION DE COLORES ─────────────────────────────────────────────

  updateSkin(r: number, g: number, b: number)   { this.applyColor(this.skinMeshes,   r, g, b) }
  updateHair(r: number, g: number, b: number)   { this.applyColor(this.hairMeshes,   r, g, b) }
  updateJacket(r: number, g: number, b: number) { this.applyColor(this.jacketMeshes, r, g, b) }
  updatePants(r: number, g: number, b: number)  { this.applyColor(this.pantsMeshes,  r, g, b) }

  private applyColor(meshes: AbstractMesh[], r: number, g: number, b: number) {
    const color = new Color3(r, g, b)
    meshes.forEach(mesh => {
      if (mesh.material instanceof StandardMaterial) {
        mesh.material.diffuseColor = color
      } else if (mesh.material instanceof PBRMaterial) {
        mesh.material.albedoColor = color
      }
    })
  }

  // ─── LUZ DE PERSONAJE ────────────────────────────────────────────────────

  addCharacterLight() {
    // Se guarda la referencia para poder liberarla en dispose(). Antes se
    // perdía (nadie la almacenaba) y cada cambio de avatar dejaba una luz
    // nueva sin quitar la anterior — acumulación silenciosa en cada swap.
    const light = new PointLight('avatarLight', new Vector3(0, 2.2, -1.2), this.scene)
    light.diffuse   = new Color3(1.0, 0.97, 0.94)
    light.intensity = 1.4
    light.range     = 6
    light.parent    = this.root
    this.characterLight = light
    return light
  }

  // ─── ANIMACIONES ─────────────────────────────────────────────────────────

  playIdle() {
    this.animations.forEach(ag => ag.stop())

    // Sin fallback a animations[0] — evita usar la animacion de caminar en idle
    const keywords = ['idle', 'stand', 'breathing', 'survey', 'default']
    const anim = this.animations.find(ag =>
      keywords.some(k => ag.name.toLowerCase().includes(k))
    )

    if (anim) {
      anim.start(true, 1.0, anim.from, anim.to, false)
      console.log(`[Atlas] Animacion idle real: "${anim.name}"`)
      this._animMode = 'none'
    } else {
      this._animMode = 'idle'
      this._startProceduralLoop()
      console.log('[Atlas] Idle procedural activo')
    }
  }

  playWalk() {
    this.animations.forEach(ag => ag.stop())

    const keywords = ['walk', 'walking', 'run', 'move', 'locomotion']
    // Fallback a animations[0]: modelos con una sola anim de caminar (ej. Nathan "Take 001")
    const anim = this.animations.find(ag =>
      keywords.some(k => ag.name.toLowerCase().includes(k))
    ) ?? this.animations[0]

    if (anim) {
      anim.start(true, 1.0, anim.from, anim.to, false)
      console.log(`[Atlas] Animacion walk: "${anim.name}"`)
      this._animMode = 'none'
    } else {
      this._animMode = 'walk'
      this._startProceduralLoop()
    }
  }

  stopAll() {
    this.animations.forEach(ag => ag.stop())
    this._animMode = 'none'
  }

  get isWalking(): boolean {
    if (this._animMode === 'walk') return true
    return this.animations.some(ag =>
      ag.isPlaying && ['walk', 'run', 'move'].some(k => ag.name.toLowerCase().includes(k))
    )
  }

  // ─── LOOP PROCEDURAL ─────────────────────────────────────────────────────

  private _startProceduralLoop() {
    if (this._animObserver) return

    this._animObserver = this.scene.onBeforeRenderObservable.add(() => {
      if (!this.corrective) return

      const dt = this.scene.getEngine().getDeltaTime() / 1000
      this._animTime += dt
      const t    = this._animTime
      const base = this._groundY

      if (this._animMode === 'idle') {
        this.corrective.position.y = base + Math.sin(t * 1.25) * 0.015
      } else if (this._animMode === 'walk') {
        this.corrective.position.y = base + Math.abs(Math.sin(t * 4.2)) * 0.024
      } else {
        this.corrective.position.y = base + (this.corrective.position.y - base) * 0.88
      }
    })
  }

  dispose() {
    if (this._animObserver) {
      this.scene.onBeforeRenderObservable.remove(this._animObserver)
      this._animObserver = null
    }
    this.animations.forEach(ag => ag.stop())
    this.animations = []

    // Antes esto era un no-op: solo se quitaba el observer, pero las mallas,
    // materiales, texturas y el nodo `corrective` (con el GLB entero colgando
    // de él) seguían en la escena para siempre. Cada cambio de avatar dejaba
    // el modelo anterior flotando debajo/detrás del nuevo — eso es lo que se
    // veía como "avatares mezclados".
    if (this.corrective) {
      this.corrective.dispose(false, true)  // recursivo + libera materiales y texturas
      this.corrective = null
    }

    this.characterLight?.dispose()
    this.characterLight = null

    this.skinMeshes = []
    this.hairMeshes = []
    this.jacketMeshes = []
    this.pantsMeshes = []
    this.loaded = false
  }
}
