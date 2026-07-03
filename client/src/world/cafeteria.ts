import {
  Scene,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  PointLight,
  Mesh,
  DynamicTexture,
} from '@babylonjs/core'

/**
 * Cafetería Atlas — espacio más amplio (22 × 14 m) con techo alto (5 m).
 * Ambiente cálido de cafetería urbana: barra, mesas, sofás, plantas,
 * cuadros, lámparas colgantes y luz de ventana.
 */
export class Cafeteria {
  private scene: Scene

  // Dimensiones de la sala
  private W = 22    // ancho
  private D = 14    // profundidad
  private H = 5     // altura del techo

  constructor(scene: Scene) {
    this.scene = scene
    this.build()
  }

  private build() {
    this.createFloor()
    this.createWalls()
    this.createCeiling()
    this.createMoldings()
    this.createLighting()
    this.createBar()
    this.createTables()
    this.createSofaCorner()
    this.createPlants()
    this.createDecorations()
    this.createWindows()
    this.createWallArt()
    this.createCeilingBeams()
  }

  // ─── MATERIALES REUTILIZABLES ────────────────────────────────────────────

  private mat(name: string, r: number, g: number, b: number, spec = 0.05): StandardMaterial {
    const m = new StandardMaterial(name, this.scene)
    m.diffuseColor  = new Color3(r, g, b)
    m.specularColor = new Color3(spec, spec, spec)
    return m
  }

  // ─── SUELO ────────────────────────────────────────────────────────────────

  private createFloor() {
    // Tablones de madera simulados con dos capas (base + veta)
    const floor = MeshBuilder.CreateGround(
      'floor', { width: this.W, height: this.D, subdivisions: 1 }, this.scene
    )
    floor.material = this.mat('floorMat', 0.38, 0.26, 0.14, 0.08)
    floor.receiveShadows = true

    // Franja decorativa en el borde del suelo
    const border = MeshBuilder.CreateGround(
      'floorBorder', { width: this.W + 0.4, height: this.D + 0.4 }, this.scene
    )
    border.position.y = -0.01
    border.material = this.mat('borderMat', 0.22, 0.14, 0.07)
  }

  // ─── PAREDES ──────────────────────────────────────────────────────────────

  private createWalls() {
    const wm = this.mat('wallMat', 0.91, 0.85, 0.74)

    const walls: [string, number, number, number, number, number, number][] = [
      // [name, w, h, d,  x,    y,    z]
      ['wallBack',  this.W,       this.H, 0.22,  0,           this.H/2, -(this.D/2)],
      ['wallLeft',  0.22,         this.H, this.D, -(this.W/2), this.H/2, 0],
      ['wallRight', 0.22,         this.H, this.D,  (this.W/2), this.H/2, 0],
      // Frente izquierdo
      ['wallFrontL', 7,           this.H, 0.22, -7.5, this.H/2,  (this.D/2)],
      // Frente derecho
      ['wallFrontR', 7,           this.H, 0.22,  7.5, this.H/2,  (this.D/2)],
      // Marco superior puerta (4 m de ancho)
      ['doorTop',    4,           0.8,    0.22,  0,   this.H - 0.4, (this.D/2)],
    ]

    walls.forEach(([n, w, h, d, x, y, z]) => {
      const mesh = MeshBuilder.CreateBox(n, { width: w, height: h, depth: d }, this.scene)
      mesh.position.set(x, y, z)
      mesh.material = wm
      mesh.receiveShadows    = true
      mesh.checkCollisions   = true   // ← la cámara no las atraviesa
    })

    // Zócalo de madera oscura (rodapié)
    const baseMat = this.mat('baseMat', 0.25, 0.15, 0.08)
    const baseH = 0.18
    const bases: [string, number, number, number, number, number][] = [
      ['baseBack',   this.W, -(this.D/2)],
      ['baseFrontL', 7,      (this.D/2)],
      ['baseFrontR', 7,      (this.D/2)],
    ]
    ;[
      ['baseBack',   this.W,    0,           baseH/2, -(this.D/2)],
      ['baseLeft',   0,         this.D,  -(this.W/2), baseH/2, 0],
      ['baseRight',  0,         this.D,   (this.W/2), baseH/2, 0],
    ].forEach(([n, wx, wz, bx, by, bz]: any) => {
      const b = MeshBuilder.CreateBox(n + '_base', {
        width:  wx || 0.18,
        height: baseH,
        depth:  wz || 0.18,
      }, this.scene)
      b.position.set(bx || 0, by, bz || 0)
      b.material = baseMat
    })
  }

  // ─── TECHO ────────────────────────────────────────────────────────────────

  private createCeiling() {
    const ceil = MeshBuilder.CreateBox(
      'ceiling', { width: this.W, height: 0.30, depth: this.D }, this.scene
    )
    ceil.position.set(0, this.H + 0.15, 0)
    const m = this.mat('ceilingMat', 0.95, 0.92, 0.86)
    m.backFaceCulling = false
    ceil.material = m
    ceil.checkCollisions = true   // ← la cámara no lo atraviesa
  }

  // ─── MOLDURAS ─────────────────────────────────────────────────────────────

  private createMoldings() {
    const mm = this.mat('moldMat', 0.82, 0.75, 0.62)

    // Cornisa perimetral (donde pared encuentra techo)
    const molds: [string, number, number, number, number, number][] = [
      ['mBack',   this.W,    0.14, 0.14, 0,          this.H - 0.07, -(this.D/2) + 0.07],
      ['mFront',  this.W,    0.14, 0.14, 0,          this.H - 0.07,  (this.D/2) - 0.07],
      ['mLeft',   0.14, 0.14, this.D,  -(this.W/2) + 0.07, this.H - 0.07, 0],
      ['mRight',  0.14, 0.14, this.D,   (this.W/2) - 0.07, this.H - 0.07, 0],
    ]
    molds.forEach(([n, w, h, d, x, y, z]) => {
      const m = MeshBuilder.CreateBox(n, { width: w, height: h, depth: d }, this.scene)
      m.position.set(x, y, z)
      m.material = mm
    })
  }

  // ─── ILUMINACIÓN ──────────────────────────────────────────────────────────

  private createLighting() {
    const bulbMat = this.mat('bulbMat', 1, 0.95, 0.7)
    ;(bulbMat as any).emissiveColor = new Color3(1, 0.9, 0.55)

    // Lámparas colgantes sobre las mesas (5 luces)
    const pendants: [number, number][] = [
      [-5, -2], [0, -2], [5, -2],
      [-3,  2], [3,  2],
    ]

    pendants.forEach(([px, pz], i) => {
      // Cable
      const cable = MeshBuilder.CreateCylinder(`cable${i}`, {
        diameter: 0.025, height: 1.2, tessellation: 6,
      }, this.scene)
      cable.position.set(px, this.H - 0.6, pz)
      cable.material = this.mat(`cableMat${i}`, 0.1, 0.08, 0.06)

      // Tulipa (pantalla cónica)
      const shade = MeshBuilder.CreateCylinder(`shade${i}`, {
        diameterTop: 0.10, diameterBottom: 0.38, height: 0.22, tessellation: 16,
      }, this.scene)
      shade.position.set(px, this.H - 1.32, pz)
      shade.material = this.mat(`shadeMat${i}`, 0.14, 0.10, 0.06)

      // Bombilla
      const bulb = MeshBuilder.CreateSphere(`bulb${i}`, { diameter: 0.10, segments: 8 }, this.scene)
      bulb.position.set(px, this.H - 1.22, pz)
      bulb.material = bulbMat

      // Luz puntual
      const light = new PointLight(`pendant${i}`, new Vector3(px, this.H - 1.4, pz), this.scene)
      light.diffuse   = new Color3(1, 0.80, 0.48)
      light.specular  = new Color3(0.15, 0.10, 0.05)
      light.intensity = 0.90
      light.range     = 6
    })

    // Luz de barra (más fría, como luz de trabajo)
    const barLight = new PointLight('barLight', new Vector3(-8.5, 2.8, -(this.D/2) + 2), this.scene)
    barLight.diffuse   = new Color3(1, 0.92, 0.76)
    barLight.intensity = 0.7
    barLight.range     = 6

    // Luz de entrada (simula luz natural de la puerta)
    const doorLight = new PointLight('doorLight', new Vector3(0, 2.5, (this.D/2) - 1), this.scene)
    doorLight.diffuse   = new Color3(0.95, 0.90, 0.80)
    doorLight.intensity = 0.35
    doorLight.range     = 5

    // Luz de rincón sofás (íntima y cálida)
    const sofaLight = new PointLight('sofaLight', new Vector3(8, 2.2, -(this.D/2) + 3), this.scene)
    sofaLight.diffuse   = new Color3(1, 0.72, 0.36)
    sofaLight.intensity = 0.55
    sofaLight.range     = 5
  }

  // ─── BARRA ────────────────────────────────────────────────────────────────

  private createBar() {
    const darkWood = this.mat('barWood',   0.18, 0.10, 0.05, 0.12)
    const marble   = this.mat('barTop',    0.82, 0.80, 0.78, 0.18)
    const metal    = this.mat('barMetal',  0.40, 0.38, 0.36, 0.25)

    // Cuerpo del mostrador (L-shape: frente + lateral)
    const front = MeshBuilder.CreateBox('barFront', { width: 7, height: 1.1, depth: 0.75 }, this.scene)
    front.position.set(-7.5, 0.55, -(this.D/2) + 2)
    front.material = darkWood

    const side = MeshBuilder.CreateBox('barSide', { width: 0.75, height: 1.1, depth: 2.5 }, this.scene)
    side.position.set(-10.75, 0.55, -(this.D/2) + 3.25)
    side.material = darkWood

    // Encimera de mármol
    const topFront = MeshBuilder.CreateBox('barTopF', { width: 7.2, height: 0.08, depth: 0.95 }, this.scene)
    topFront.position.set(-7.5, 1.14, -(this.D/2) + 2)
    topFront.material = marble

    const topSide = MeshBuilder.CreateBox('barTopS', { width: 0.95, height: 0.08, depth: 2.7 }, this.scene)
    topSide.position.set(-10.75, 1.14, -(this.D/2) + 3.25)
    topSide.material = marble

    // Repisa trasera (detrás de la barra)
    const backShelf = MeshBuilder.CreateBox('backShelf', { width: 6.5, height: 3.2, depth: 0.28 }, this.scene)
    backShelf.position.set(-7.5, 1.6, -(this.D/2) + 0.24)
    backShelf.material = darkWood

    // Estantes (3 niveles)
    for (let i = 0; i < 3; i++) {
      const shelf = MeshBuilder.CreateBox(`shelf${i}`, { width: 6.3, height: 0.06, depth: 0.30 }, this.scene)
      shelf.position.set(-7.5, 0.85 + i * 0.85, -(this.D/2) + 0.38)
      shelf.material = marble
    }

    // Botellas decorativas en la repisa
    const bottleColors = [
      [0.18, 0.38, 0.22],
      [0.45, 0.28, 0.10],
      [0.20, 0.20, 0.42],
      [0.52, 0.12, 0.12],
    ]
    for (let shelf = 0; shelf < 2; shelf++) {
      for (let b = 0; b < 6; b++) {
        const bottle = MeshBuilder.CreateCylinder(`bottle_${shelf}_${b}`, {
          diameterBottom: 0.09, diameterTop: 0.04, height: 0.28 + Math.random() * 0.12,
          tessellation: 8,
        }, this.scene)
        bottle.position.set(-10.5 + b * 1.1, 0.98 + shelf * 0.85, -(this.D/2) + 0.38)
        const ci = (shelf * 6 + b) % bottleColors.length
        bottle.material = this.mat(`bottleMat${shelf}${b}`, ...bottleColors[ci] as [number,number,number], 0.20)
      }
    }

    // Máquina de café (espresso)
    const machine = MeshBuilder.CreateBox('espresso', { width: 0.55, height: 0.52, depth: 0.36 }, this.scene)
    machine.position.set(-5.2, 1.40, -(this.D/2) + 1.62)
    machine.material = this.mat('machineMat', 0.20, 0.18, 0.18, 0.30)

    const machineTop = MeshBuilder.CreateBox('espressoTop', { width: 0.56, height: 0.06, depth: 0.37 }, this.scene)
    machineTop.position.set(-5.2, 1.66, -(this.D/2) + 1.62)
    machineTop.material = metal

    // Taburetes de la barra (5)
    const stoolMat = this.mat('stoolMat', 0.55, 0.32, 0.16)
    const legMat   = this.mat('stoolLeg', 0.42, 0.40, 0.38, 0.20)
    for (let i = 0; i < 5; i++) {
      const seat = MeshBuilder.CreateCylinder(`stoolSeat${i}`, {
        diameter: 0.38, height: 0.07, tessellation: 16,
      }, this.scene)
      seat.position.set(-9.5 + i * 1.4, 0.80, -(this.D/2) + 3.0)
      seat.material = stoolMat

      const leg = MeshBuilder.CreateCylinder(`stoolLeg${i}`, {
        diameterTop: 0.06, diameterBottom: 0.10, height: 0.76, tessellation: 8,
      }, this.scene)
      leg.position.set(-9.5 + i * 1.4, 0.38, -(this.D/2) + 3.0)
      leg.material = legMat
    }
  }

  // ─── MESAS Y SILLAS ───────────────────────────────────────────────────────

  private createTables() {
    const tableMat  = this.mat('tableMat',  0.50, 0.34, 0.18, 0.10)
    const chairMat  = this.mat('chairMat',  0.30, 0.20, 0.10)
    const cushMat   = this.mat('cushMat',   0.62, 0.42, 0.28)
    const metalMat  = this.mat('metalMat',  0.38, 0.36, 0.34, 0.22)

    // Posiciones de mesas (x, z)
    const tablePos: [number, number, number][] = [
      // Fila central
      [-4, 0, -1], [0, 0, -1], [4, 0, -1],
      // Fila delantera
      [-4, 0,  3], [0, 0,  3], [4, 0,  3],
      // Mesa alta junto a ventana derecha
      [9, 0.35, -2],
    ]

    tablePos.forEach(([px, py, pz], i) => {
      const isHigh = py > 0   // mesa alta (bar table)
      const h = isHigh ? 1.08 : 0.76

      // Tablero
      const top = MeshBuilder.CreateCylinder(`tableTop${i}`, {
        diameter: isHigh ? 0.70 : 1.10, height: 0.06, tessellation: 24,
      }, this.scene)
      top.position.set(px, py + h, pz)
      top.material = tableMat

      // Pie central
      const leg = MeshBuilder.CreateCylinder(`tableLeg${i}`, {
        diameterTop: 0.06, diameterBottom: 0.14, height: h, tessellation: 8,
      }, this.scene)
      leg.position.set(px, py + h / 2, pz)
      leg.material = metalMat

      // Base cruciforme
      const baseX = MeshBuilder.CreateBox(`baseX${i}`, { width: 0.60, height: 0.04, depth: 0.10 }, this.scene)
      baseX.position.set(px, py + 0.02, pz)
      baseX.material = metalMat
      const baseZ = MeshBuilder.CreateBox(`baseZ${i}`, { width: 0.10, height: 0.04, depth: 0.60 }, this.scene)
      baseZ.position.set(px, py + 0.02, pz)
      baseZ.material = metalMat

      // Sillas alrededor (skip para mesa alta — taburetes)
      if (!isHigh) {
        const chairAngles = [0, Math.PI / 2, Math.PI, -Math.PI / 2]
        const r = 0.76
        chairAngles.forEach((angle, j) => {
          const cx = px + Math.sin(angle) * r
          const cz = pz + Math.cos(angle) * r

          // Asiento
          const seat = MeshBuilder.CreateBox(`seat${i}_${j}`, {
            width: 0.44, height: 0.06, depth: 0.44,
          }, this.scene)
          seat.position.set(cx, 0.46, cz)
          seat.material = cushMat

          // Respaldo
          const back = MeshBuilder.CreateBox(`back${i}_${j}`, {
            width: 0.44, height: 0.52, depth: 0.05,
          }, this.scene)
          back.position.set(
            cx + Math.sin(angle) * 0.22,
            0.72,
            cz + Math.cos(angle) * 0.22,
          )
          back.rotation.y = -angle
          back.material = chairMat

          // Patas (2 frontales)
          for (const side of [-0.17, 0.17]) {
            const legX = Math.cos(angle) * side
            const legZ = -Math.sin(angle) * side
            const cl = MeshBuilder.CreateCylinder(`chairLeg${i}${j}${side}`, {
              diameter: 0.04, height: 0.46, tessellation: 6,
            }, this.scene)
            cl.position.set(cx + legX, 0.23, cz + legZ)
            cl.material = metalMat
          }
        })
      }
    })
  }

  // ─── RINCÓN DE SOFÁS ──────────────────────────────────────────────────────

  private createSofaCorner() {
    const sofaMat   = this.mat('sofaMat',   0.52, 0.30, 0.16, 0.06)
    const cushMat2  = this.mat('cushMat2',  0.68, 0.48, 0.30)
    const ctMat     = this.mat('coffeeMat', 0.28, 0.18, 0.08, 0.12)
    const ctTop     = this.mat('coffeeTop', 0.75, 0.72, 0.68, 0.20)

    // Sofá largo (pared derecha, al fondo)
    const sofaBase = MeshBuilder.CreateBox('sofaBase', { width: 3.4, height: 0.44, depth: 0.94 }, this.scene)
    sofaBase.position.set(8.5, 0.22, -(this.D/2) + 2.4)
    sofaBase.material = sofaMat

    const sofaBack = MeshBuilder.CreateBox('sofaBack', { width: 3.4, height: 0.72, depth: 0.20 }, this.scene)
    sofaBack.position.set(8.5, 0.80, -(this.D/2) + 0.64)
    sofaBack.material = sofaMat

    // Apoyabrazos
    for (const sx of [-1.7, 1.7]) {
      const arm = MeshBuilder.CreateBox(`sofaArm${sx}`, { width: 0.22, height: 0.58, depth: 0.94 }, this.scene)
      arm.position.set(8.5 + sx, 0.55, -(this.D/2) + 2.4)
      arm.material = sofaMat
    }

    // Cojines (3)
    for (let i = 0; i < 3; i++) {
      const c = MeshBuilder.CreateBox(`sofaCush${i}`, { width: 0.98, height: 0.14, depth: 0.84 }, this.scene)
      c.position.set(7.4 + i * 1.1, 0.50, -(this.D/2) + 2.4)
      c.material = cushMat2

      // Cojín de respaldo
      const cb = MeshBuilder.CreateBox(`sofaCushB${i}`, { width: 0.96, height: 0.56, depth: 0.14 }, this.scene)
      cb.position.set(7.4 + i * 1.1, 0.72, -(this.D/2) + 0.82)
      cb.material = cushMat2
    }

    // Sofá individual (perpendicular)
    const singleBase = MeshBuilder.CreateBox('singleBase', { width: 0.94, height: 0.44, depth: 1.8 }, this.scene)
    singleBase.position.set((this.W/2) - 1.6, 0.22, -(this.D/2) + 3.8)
    singleBase.material = sofaMat

    const singleBack = MeshBuilder.CreateBox('singleBack', { width: 0.18, height: 0.72, depth: 1.8 }, this.scene)
    singleBack.position.set((this.W/2) - 0.73, 0.80, -(this.D/2) + 3.8)
    singleBack.material = sofaMat

    // Mesa de centro
    const coffeeTop = MeshBuilder.CreateBox('coffeeTop', { width: 1.1, height: 0.06, depth: 0.70 }, this.scene)
    coffeeTop.position.set(8.5, 0.42, -(this.D/2) + 4.5)
    coffeeTop.material = ctTop

    const coffeeLeg = MeshBuilder.CreateBox('coffeeLeg', { width: 1.0, height: 0.36, depth: 0.60 }, this.scene)
    coffeeLeg.position.set(8.5, 0.20, -(this.D/2) + 4.5)
    coffeeLeg.material = ctMat

    // Alfombra bajo el área de sofás
    const rug = MeshBuilder.CreateGround('rug', { width: 4.5, height: 4 }, this.scene)
    rug.position.set(8.5, 0.005, -(this.D/2) + 3.2)
    rug.material = this.mat('rugMat', 0.44, 0.24, 0.14)
  }

  // ─── PLANTAS ──────────────────────────────────────────────────────────────

  private createPlants() {
    const potMat  = this.mat('potMat',  0.45, 0.32, 0.20)
    const soilMat = this.mat('soilMat', 0.22, 0.16, 0.10)
    const leafMat = this.mat('leafMat', 0.18, 0.38, 0.14)
    const darkLeaf = this.mat('darkLeaf', 0.12, 0.28, 0.10)

    const positions: [number, number, number, number][] = [
      // [x, z, potH, plantScale]
      [-(this.W/2) + 1.2, (this.D/2) - 1.2, 0.45, 1.0],   // entrada izq
      [ (this.W/2) - 1.2, (this.D/2) - 1.2, 0.45, 1.0],   // entrada der
      [-(this.W/2) + 1.0, -(this.D/2) + 1.5, 0.65, 1.3],  // rincón barra
      [ (this.W/2) - 1.0, -(this.D/2) + 1.5, 0.55, 1.1],  // rincón sofá
    ]

    positions.forEach(([px, pz, potH, sc], i) => {
      // Maceta
      const pot = MeshBuilder.CreateCylinder(`pot${i}`, {
        diameterBottom: 0.28 * sc, diameterTop: 0.34 * sc,
        height: potH * sc, tessellation: 16,
      }, this.scene)
      pot.position.set(px, (potH * sc) / 2, pz)
      pot.material = potMat

      // Tierra
      const soil = MeshBuilder.CreateCylinder(`soil${i}`, {
        diameter: 0.32 * sc, height: 0.04, tessellation: 12,
      }, this.scene)
      soil.position.set(px, potH * sc + 0.01, pz)
      soil.material = soilMat

      // Tronco
      const trunk = MeshBuilder.CreateCylinder(`trunk${i}`, {
        diameterBottom: 0.06 * sc, diameterTop: 0.04 * sc,
        height: 0.55 * sc * potH, tessellation: 8,
      }, this.scene)
      trunk.position.set(px, potH * sc + (0.55 * sc * potH) / 2, pz)
      trunk.material = this.mat(`trunkMat${i}`, 0.32, 0.22, 0.10)

      // Copa (3 esferas para dar volumen)
      const baseY = potH * sc + 0.55 * sc * potH
      const offsets: [number, number, number][] = [
        [0, 0, 0], [0.08 * sc, -0.05, 0.06 * sc], [-0.06 * sc, -0.08, -0.04 * sc],
      ]
      offsets.forEach(([ox, oy, oz], k) => {
        const leaf = MeshBuilder.CreateSphere(`leaf${i}_${k}`, {
          diameter: (0.42 + k * 0.06) * sc, segments: 7,
        }, this.scene)
        leaf.position.set(px + ox, baseY + 0.22 * sc + oy, pz + oz)
        leaf.material = k % 2 === 0 ? leafMat : darkLeaf
      })
    })
  }

  // ─── DECORACIONES ─────────────────────────────────────────────────────────

  private createDecorations() {
    // ── Lámpara de pie en rincón sofá ──
    const lampPole = MeshBuilder.CreateCylinder('lampPole', {
      diameter: 0.05, height: 1.65, tessellation: 8,
    }, this.scene)
    lampPole.position.set((this.W/2) - 2.2, 0.83, -(this.D/2) + 1.2)
    lampPole.material = this.mat('lampMat', 0.28, 0.24, 0.20, 0.25)

    const lampShade = MeshBuilder.CreateCylinder('lampShade', {
      diameterTop: 0.12, diameterBottom: 0.34, height: 0.28, tessellation: 16,
    }, this.scene)
    lampShade.position.set((this.W/2) - 2.2, 1.80, -(this.D/2) + 1.2)
    lampShade.material = this.mat('lampShadeM', 0.82, 0.70, 0.48)

    const lampLight = new PointLight('lampLight', new Vector3((this.W/2) - 2.2, 1.6, -(this.D/2) + 1.2), this.scene)
    lampLight.diffuse   = new Color3(1, 0.75, 0.40)
    lampLight.intensity = 0.50
    lampLight.range     = 4

    // ── Estantería de libros en pared izquierda ──
    const bookshelf = MeshBuilder.CreateBox('bookshelf', { width: 0.28, height: 2.2, depth: 2.0 }, this.scene)
    bookshelf.position.set(-(this.W/2) + 0.24, 1.1, -1)
    bookshelf.material = this.mat('bookshelfMat', 0.25, 0.15, 0.08)

    const bookColors: [number, number, number][] = [
      [0.65, 0.18, 0.12], [0.18, 0.35, 0.55], [0.42, 0.55, 0.22],
      [0.70, 0.58, 0.18], [0.40, 0.22, 0.55],
    ]
    for (let row = 0; row < 3; row++) {
      for (let b = 0; b < 6; b++) {
        const bh = 0.26 + (b % 2) * 0.06
        const book = MeshBuilder.CreateBox(`book${row}_${b}`, {
          width: 0.14, height: bh, depth: 0.07 + (b % 3) * 0.02,
        }, this.scene)
        book.position.set(-(this.W/2) + 0.14, 0.38 + row * 0.72 + bh / 2, -2.0 + b * 0.30)
        book.material = this.mat(`bookMat${row}${b}`, ...bookColors[(row * 6 + b) % bookColors.length], 0.06)
      }
    }

    // ── Mostrador de caja / punto de pedidos ──
    const cash = MeshBuilder.CreateBox('cashDesk', { width: 1.2, height: 1.05, depth: 0.60 }, this.scene)
    cash.position.set(-3.5, 0.53, -(this.D/2) + 2.2)
    cash.material = this.mat('cashMat', 0.22, 0.14, 0.07)

    const cashTop = MeshBuilder.CreateBox('cashTop', { width: 1.22, height: 0.05, depth: 0.62 }, this.scene)
    cashTop.position.set(-3.5, 1.08, -(this.D/2) + 2.2)
    cashTop.material = this.mat('cashTopMat', 0.75, 0.72, 0.68, 0.18)
  }

  // ─── ARTE MURAL (NUEVO) ───────────────────────────────────────────────────

  private createWallArt() {
    // ── Panel de acento oscuro detrás de la barra (pared del fondo) ──
    // Crea profundidad visual: la zona de barra se separa del resto
    const accent = MeshBuilder.CreateBox('barAccent', { width: 8.0, height: 4.6, depth: 0.03 }, this.scene)
    accent.position.set(-7.5, 2.4, -(this.D/2) + 0.28)
    accent.material = this.mat('barAccentMat', 0.11, 0.08, 0.06)

    // ── Arte geométrico abstracto — 3 composiciones en pared del fondo ──

    // Composición 1 (izquierda): campo terracota + franja
    this.artPanel('art1bg',     -6.5, 2.90, 1.80, 1.40, 0.62, 0.30, 0.16)   // fondo terracota
    this.artPanel('art1stripe', -6.9, 2.90, 0.10, 1.40, 0.18, 0.08, 0.04)   // franja oscura
    this.artPanel('art1rect',   -6.2, 2.65, 0.80, 0.55, 0.80, 0.55, 0.28)   // cuadrado arena
    this.artFrame('art1frame',  -6.5, 2.90, 1.90, 1.50)                       // marco fino

    // Composición 2 (centro): líneas verticales minimalistas sobre fondo oscuro
    this.artPanel('art2bg',     0, 2.90, 2.00, 1.40, 0.14, 0.11, 0.09)       // fondo muy oscuro
    for (let i = 0; i < 5; i++) {
      const x = -0.72 + i * 0.36
      const h = 0.60 + (i % 3) * 0.28
      const warmth = 0.55 + i * 0.06
      this.artPanel(`art2line${i}`, x, 2.90, 0.055, h, warmth, warmth * 0.55, 0.20)
    }
    this.artFrame('art2frame', 0, 2.90, 2.10, 1.50)

    // Composición 3 (derecha): bloques de color superpuestos
    this.artPanel('art3bg',  6.5, 2.90, 1.80, 1.40, 0.28, 0.35, 0.42)       // fondo azul pizarra
    this.artPanel('art3r1',  6.1, 3.25, 1.00, 0.60, 0.72, 0.55, 0.28)       // rectángulo ámbar
    this.artPanel('art3r2',  6.8, 2.50, 0.70, 0.50, 0.55, 0.28, 0.22)       // cuadrado óxido
    this.artPanel('art3dot', 6.5, 2.90, 0.22, 0.22, 0.88, 0.80, 0.55)       // punto luz
    this.artFrame('art3frame', 6.5, 2.90, 1.90, 1.50)

    // ── Panel de listones de madera en pared derecha (sección inferior) ──
    // Decoración arquitectónica: tablones verticales de madera oscura
    const slatCount = 14
    const slatH     = 2.20
    const slatY     = slatH / 2
    const slatZ     = (this.W / 2) - 0.04   // pared derecha
    for (let i = 0; i < slatCount; i++) {
      const slat = MeshBuilder.CreateBox(`slat${i}`, {
        width: 0.08, height: slatH, depth: 0.05,
      }, this.scene)
      // Distribuidos a lo largo de z entre los marcos de ventana
      slat.position.set(slatZ, slatY, -5.5 + i * 0.40)
      // Alternamos dos tonos para dar profundidad
      const dark = i % 2 === 0
      slat.material = this.mat(`slatMat${i}`,
        dark ? 0.22 : 0.30,
        dark ? 0.13 : 0.18,
        dark ? 0.06 : 0.09,
        0.04,
      )
    }

    // ── Señal "ATLAS" tipo neón sobre la puerta de entrada ──
    this.buildAtlasSign()

    // ── Panel decorativo en pared lateral izquierda ──
    // Área geométrica: círculo grande difuminado (aproximado con esferas)
    const geoPanel = MeshBuilder.CreateBox('geoPanel', { width: 0.03, height: 3.0, depth: 3.0 }, this.scene)
    geoPanel.position.set(-(this.W/2) + 0.06, 2.6, 2)
    geoPanel.material = this.mat('geoPanelMat', 0.16, 0.12, 0.09)

    // Arco decorativo sobre el panel (semicírculo con cajas finas)
    const arcR  = 1.10
    const arcCX = -(this.W/2) + 0.05
    const arcCY = 2.80
    const arcCZ = 2.00
    for (let i = 0; i <= 10; i++) {
      const angle = Math.PI * (i / 10)  // 0 a π (media luna)
      const ay = arcCY + Math.sin(angle) * arcR
      const az = arcCZ + Math.cos(angle) * arcR
      const seg = MeshBuilder.CreateBox(`arc${i}`, { width: 0.04, height: 0.08, depth: 0.08 }, this.scene)
      seg.position.set(arcCX, ay, az)
      seg.material = this.mat(`arcMat${i}`, 0.70, 0.52, 0.28, 0.10)
    }
  }

  /** Crea un panel de color (caja plana) sobre la pared del fondo */
  private artPanel(name: string, x: number, y: number, w: number, h: number, r: number, g: number, b: number) {
    const p = MeshBuilder.CreateBox(name, { width: w, height: h, depth: 0.025 }, this.scene)
    p.position.set(x, y, -(this.D/2) + 0.09)
    p.material = this.mat(name + '_m', r, g, b, 0.04)
  }

  /** Marco fino de madera oscura alrededor de una composición */
  private artFrame(name: string, x: number, y: number, w: number, h: number) {
    const frameMat = this.mat(name + '_m', 0.16, 0.10, 0.05, 0.08)
    const thick    = 0.04
    const d        = 0.030

    // Superior
    const top = MeshBuilder.CreateBox(name + '_t', { width: w, height: thick, depth: d }, this.scene)
    top.position.set(x, y + h/2 - thick/2, -(this.D/2) + 0.07)
    top.material = frameMat
    // Inferior
    const bot = MeshBuilder.CreateBox(name + '_b', { width: w, height: thick, depth: d }, this.scene)
    bot.position.set(x, y - h/2 + thick/2, -(this.D/2) + 0.07)
    bot.material = frameMat
    // Izquierdo
    const lft = MeshBuilder.CreateBox(name + '_l', { width: thick, height: h, depth: d }, this.scene)
    lft.position.set(x - w/2 + thick/2, y, -(this.D/2) + 0.07)
    lft.material = frameMat
    // Derecho
    const rgt = MeshBuilder.CreateBox(name + '_r', { width: thick, height: h, depth: d }, this.scene)
    rgt.position.set(x + w/2 - thick/2, y, -(this.D/2) + 0.07)
    rgt.material = frameMat
  }

  /** Señal luminosa "ATLAS" con letras emissive tipo neón suave */
  private buildAtlasSign() {
    // Letras representadas con DynamicTexture sobre un plano
    const plane = MeshBuilder.CreatePlane('atlasSign', { width: 3.2, height: 0.55 }, this.scene)
    plane.position.set(0, 4.20, (this.D/2) - 0.18)
    plane.rotation.y = Math.PI   // mira hacia el interior

    const tex = new DynamicTexture('atlasSignTex', { width: 512, height: 88 }, this.scene)
    tex.hasAlpha = true

    const ctx = tex.getContext()
    ctx.clearRect(0, 0, 512, 88)

    // Fondo oscuro transparente con borde redondeado
    ctx.fillStyle = 'rgba(8,5,3,0.65)'
    this.roundRect(ctx, 8, 8, 496, 72, 8)
    ctx.fill()

    // Texto
    ctx.fillStyle = '#D4A96A'
    ctx.font      = 'bold 46px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('ATLAS', 256, 44)

    // Sutil brillo (shadow)
    ctx.shadowColor   = '#C8956C'
    ctx.shadowBlur    = 12
    ctx.fillStyle     = '#F0D0A0'
    ctx.fillText('ATLAS', 256, 44)
    tex.update()

    const mat = new StandardMaterial('atlasSignMat', this.scene)
    mat.diffuseTexture  = tex
    mat.emissiveColor   = new Color3(0.6, 0.45, 0.22)
    mat.disableLighting = true
    mat.backFaceCulling = false
    plane.material = mat
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  // ─── VIGAS DE TECHO (NUEVO) ───────────────────────────────────────────────

  private createCeilingBeams() {
    const beamMat = this.mat('beamMat', 0.28, 0.18, 0.09, 0.05)

    // Vigas transversales (de pared a pared, eje X)
    const beamPositions = [-4, 0, 4]
    beamPositions.forEach((bz, i) => {
      const beam = MeshBuilder.CreateBox(`beam${i}`, {
        width: this.W - 0.40,
        height: 0.22,
        depth: 0.18,
      }, this.scene)
      beam.position.set(0, this.H - 0.12, bz)
      beam.material = beamMat
    })

    // Viga longitudinal central (eje Z)
    const ridgeBeam = MeshBuilder.CreateBox('ridgeBeam', {
      width: 0.18,
      height: 0.28,
      depth: this.D - 0.40,
    }, this.scene)
    ridgeBeam.position.set(0, this.H - 0.16, 0)
    ridgeBeam.material = beamMat
  }

  // ─── VENTANAS ─────────────────────────────────────────────────────────────

  private createWindows() {
    const frameMat  = this.mat('winFrame',  0.88, 0.82, 0.70)
    const glassMat  = this.mat('winGlass',  0.65, 0.75, 0.82, 0.12)
    glassMat.alpha  = 0.30

    // Ventanas en pared derecha (3 ventanas)
    const winPositions = [-3, 0, 3]
    winPositions.forEach((pz, i) => {
      // Marco exterior
      const outer = MeshBuilder.CreateBox(`winOut${i}`, { width: 0.12, height: 1.6, depth: 1.3 }, this.scene)
      outer.position.set((this.W/2) - 0.06, 2.4, pz)
      outer.material = frameMat

      // Vidrio
      const glass = MeshBuilder.CreateBox(`winGlass${i}`, { width: 0.04, height: 1.44, depth: 1.14 }, this.scene)
      glass.position.set((this.W/2) - 0.12, 2.4, pz)
      glass.material = glassMat

      // Alféizar
      const sill = MeshBuilder.CreateBox(`winSill${i}`, { width: 0.18, height: 0.06, depth: 1.46 }, this.scene)
      sill.position.set((this.W/2) - 0.10, 1.60, pz)
      sill.material = frameMat

      // Luz cálida que entra por la ventana
      const winLight = new PointLight(`winLight${i}`, new Vector3((this.W/2) - 1.5, 2.4, pz), this.scene)
      winLight.diffuse   = new Color3(1, 0.95, 0.80)
      winLight.intensity = 0.28
      winLight.range     = 5
    })
  }
}
