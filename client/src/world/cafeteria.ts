import {
  Scene,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  PointLight,
  Mesh,
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
    // ── Cuadros en la pared del fondo ──
    const frameMat = this.mat('frameMat', 0.18, 0.12, 0.06)
    const canvasMats = [
      this.mat('canvas0', 0.65, 0.38, 0.22),  // naranja cálido
      this.mat('canvas1', 0.22, 0.35, 0.52),  // azul suave
      this.mat('canvas2', 0.42, 0.55, 0.30),  // verde oliva
    ]

    const paintings: [number, number][] = [[-6, 2.8], [0, 2.8], [6, 2.8]]
    paintings.forEach(([px, py], i) => {
      const frame = MeshBuilder.CreateBox(`frame${i}`, { width: 1.10, height: 0.85, depth: 0.06 }, this.scene)
      frame.position.set(px, py, -(this.D/2) + 0.06)
      frame.material = frameMat

      const canvas = MeshBuilder.CreateBox(`canvas${i}`, { width: 0.90, height: 0.66, depth: 0.05 }, this.scene)
      canvas.position.set(px, py, -(this.D/2) + 0.08)
      canvas.material = canvasMats[i % canvasMats.length]
    })

    // ── Lámpara de pie en rincón sofá ──
    const lampMat = this.mat('lampMat', 0.28, 0.24, 0.20, 0.25)
    const lampPole = MeshBuilder.CreateCylinder('lampPole', {
      diameter: 0.05, height: 1.65, tessellation: 8,
    }, this.scene)
    lampPole.position.set((this.W/2) - 2.2, 0.83, -(this.D/2) + 1.2)
    lampPole.material = lampMat

    const lampShade = MeshBuilder.CreateCylinder('lampShade', {
      diameterTop: 0.12, diameterBottom: 0.34, height: 0.28, tessellation: 16,
    }, this.scene)
    lampShade.position.set((this.W/2) - 2.2, 1.80, -(this.D/2) + 1.2)
    lampShade.material = this.mat('lampShade', 0.82, 0.70, 0.48)

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
      let bx = -(this.W/2) + 0.14
      for (let b = 0; b < 6; b++) {
        const bw = 0.07 + (b % 3) * 0.02
        const bh = 0.26 + (b % 2) * 0.06
        const book = MeshBuilder.CreateBox(`book${row}_${b}`, {
          width: 0.14, height: bh, depth: bw,
        }, this.scene)
        book.position.set(bx, 0.38 + row * 0.72 + bh / 2, -2.0 + b * 0.30)
        book.material = this.mat(`bookMat${row}${b}`, ...bookColors[(row * 6 + b) % bookColors.length], 0.06)
        bx += 0.02
      }
    }

    // ── Mostrador de caja / punto de pedidos ──
    const cashMat = this.mat('cashMat', 0.22, 0.14, 0.07)
    const cash = MeshBuilder.CreateBox('cashDesk', { width: 1.2, height: 1.05, depth: 0.60 }, this.scene)
    cash.position.set(-3.5, 0.53, -(this.D/2) + 2.2)
    cash.material = cashMat

    const cashTop = MeshBuilder.CreateBox('cashTop', { width: 1.22, height: 0.05, depth: 0.62 }, this.scene)
    cashTop.position.set(-3.5, 1.08, -(this.D/2) + 2.2)
    cashTop.material = this.mat('cashTopMat', 0.75, 0.72, 0.68, 0.18)
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
