import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  PointLight,
  Color3,
  Color4,
} from '@babylonjs/core'

export class AtlasEngine {
  public engine: Engine
  public scene: Scene
  public camera: ArcRotateCamera

  constructor(canvas: HTMLCanvasElement) {
    // Inicializar el motor con opciones optimizadas para hardware integrado
    this.engine = new Engine(canvas, true, {
      antialias: true,
      adaptToDeviceRatio: true,
      powerPreference: 'default', // No forzar GPU de alto rendimiento
    })

    // GPUs integradas (ej. Intel HD 620) reportan GL_MAX_VERTEX_UNIFORM_BUFFERS = 12,
    // el mínimo de WebGL2. Un avatar con skinning (84 huesos) + varias luces de la
    // cafetería + UBOs de escena/malla/material supera ese límite y el shader no
    // compila (el avatar realista no se ve). Desactivar los uniform buffers hace que
    // Babylon use uniforms normales, sin límite de bloques — correcto para el
    // hardware objetivo de Atlas, a costa de una diferencia de rendimiento mínima
    // dada la baja cantidad de objetos en escena.
    this.engine.disableUniformBuffers = true

    this.scene = new Scene(this.engine)

    // Fondo oscuro cálido — como el interior de la cafetería de noche
    this.scene.clearColor = new Color4(0.1, 0.08, 0.06, 1)

    // Cámara en tercera persona sobre el hombro
    this.camera = new ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 2.2,   // ángulo inicial más horizontal
      6,               // distancia inicial más corta
      Vector3.Zero(),
      this.scene
    )
    this.camera.lowerRadiusLimit = 3
    this.camera.upperRadiusLimit = 8              // limita zoom: a 8 m el techo queda fuera
    // β = ángulo vertical: 0 = cenital, π/2 = horizontal
    // Con radio 8 y β = π/2.5 (72°): altura cámara = 1.0 + 8·cos(72°) = 3.5 m < techo
    this.camera.lowerBetaLimit   = Math.PI / 2.5  // 72° — cámara no sube sobre el techo
    this.camera.upperBetaLimit   = Math.PI / 2.05 // 88° — casi horizontal como máximo
    // Colisiones: la cámara no atraviesa paredes ni techo
    this.scene.collisionsEnabled = true
    this.camera.checkCollisions  = true
    this.camera.collisionRadius  = new Vector3(0.3, 0.3, 0.3)
    this.camera.attachControl(canvas, true)

    // Luz ambiental suave — base de iluminación cálida
    const ambient = new HemisphericLight(
      'ambient',
      new Vector3(0, 1, 0),
      this.scene
    )
    ambient.intensity = 0.6
    ambient.diffuse = new Color3(1, 0.88, 0.70)    // Cálido ámbar
    ambient.groundColor = new Color3(0.35, 0.25, 0.12) // Rebote de suelo oscuro

    // Loop de render
    this.engine.runRenderLoop(() => {
      this.scene.render()
    })

    // Responsive
    window.addEventListener('resize', () => {
      this.engine.resize()
    })
  }

  dispose() {
    this.engine.dispose()
  }
}
