import '@babylonjs/core/Debug/debugLayer'
import '@babylonjs/loaders/glTF'

import { AtlasEngine }      from './engine/scene'
import { Cafeteria }        from './world/cafeteria'
import { LocalPlayer }      from './avatar/LocalPlayer'
import { AvatarCustomizer } from './ui/AvatarCustomizer'
import { NetworkManager }   from './network/NetworkManager'
import { ChatUI }           from './ui/ChatUI'
import { RadioPlayer }      from './ui/RadioPlayer'
import { Joystick }         from './ui/Joystick'
import { UserList }         from './ui/UserList'

// ─── ELEMENTOS ────────────────────────────────────────────────────────────────
const canvas        = document.getElementById('atlas-canvas')   as HTMLCanvasElement
const loadingScreen = document.getElementById('loading-screen') as HTMLDivElement

// ─── PANTALLA DE BIENVENIDA ───────────────────────────────────────────────────
function buildWelcomeScreen(): HTMLDivElement {
  const screen = document.createElement('div')
  screen.style.cssText = `
    position: fixed; inset: 0; z-index: 150;
    background: rgba(8, 6, 4, 0.97);
    display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 18px;
    font-family: Arial, sans-serif;
  `
  screen.innerHTML = `
    <h1 style="
      color:#D4A96A; font-size:52px; font-weight:bold;
      letter-spacing:.18em; margin:0;
    ">ATLAS</h1>
    <div style="width:60px; height:1px; background:#C8956C"></div>
    <p style="
      color:#C8956C; font-size:15px; margin:0; letter-spacing:.06em;
    ">Un lugar para encontrarse</p>
    <button id="btn-start" style="
      margin-top:12px; padding:14px 42px;
      background:#C8956C; color:#0A0806;
      font-size:15px; font-weight:bold;
      border:none; border-radius:8px;
      cursor:pointer; letter-spacing:.05em;
      font-family:Arial,sans-serif;
      transition:background .2s;
    ">Crear mi avatar</button>
  `
  const btn = screen.querySelector<HTMLButtonElement>('#btn-start')!
  btn.onmouseenter = () => { btn.style.background = '#D4A96A' }
  btn.onmouseleave = () => { btn.style.background = '#C8956C' }
  document.body.appendChild(screen)
  return screen
}

// ─── BOOT ─────────────────────────────────────────────────────────────────────
async function boot() {
  try {
    // 1. Motor + escena
    const atlas  = new AtlasEngine(canvas)
    new Cafeteria(atlas.scene)
    const player = new LocalPlayer(atlas.scene, atlas.camera)

    // Esperar a que la escena esté lista, con timeout de 6s por si los
    // shaders tardan demasiado en compilar (WebGL integrado lento)
    await Promise.race([
      atlas.scene.whenReadyAsync(),
      new Promise<void>(resolve => setTimeout(resolve, 6000)),
    ])

    // 2. Ocultar pantalla de carga
    loadingScreen.style.transition = 'opacity 0.8s ease'
    loadingScreen.style.opacity    = '0'
    setTimeout(() => { loadingScreen.style.display = 'none' }, 800)

    // 3. Pantalla de bienvenida
    const welcome  = buildWelcomeScreen()
    const btnStart = welcome.querySelector<HTMLButtonElement>('#btn-start')!

    btnStart.addEventListener('click', async () => {
      welcome.remove()

      // 4. Creador de avatar propio de Atlas
      const customizer = new AvatarCustomizer(player, canvas)
      const selection  = await customizer.open()
      customizer.dispose()

      // 5. Conectar al servidor y anunciar identidad
      const net = new NetworkManager(atlas.scene, player)
      net.sendIdentity(
        selection.name,
        selection.skin,
        selection.hair,
        selection.jacket,
        selection.pants,
      )

      // 6. Chat
      const chat = new ChatUI()
      chat.onSend    = (text) => net.sendChat(text)
      chat.onWhisper = (target, text) => net.sendWhisper(target, text)

      net.onChat = (_, name, text, isSelf) => {
        chat.addMessage(name, text, isSelf)
      }
      net.onWhisper = (fromName, toName, text, isSelf) => {
        chat.addWhisperMessage(fromName, toName, text, isSelf)
      }
      net.onWhisperError = (targetName) => {
        chat.addSystemMessage(`⚠ @${targetName} no está en la sala`)
      }

      // WASD se bloquea si el chat tiene el foco
      window.addEventListener('keydown', (e) => {
        if (chat.hasFocus) e.stopImmediatePropagation()
      }, true)

      // 6b. Joystick (móvil)
      const joystick = new Joystick()
      joystick.onChange = (x, y) => player.setJoystickDir(x, y)

      // 6c. Lista de presentes
      const userList = new UserList()
      userList.setMyName(selection.name)
      net.onPlayersUpdate = (players) => {
        userList.setPlayers(players)
      }

      // 7. Radio — emisora sincronizada de sala
      const radio = new RadioPlayer()
      // Cuando el usuario cambia estación con sync ON → avisar al servidor
      radio.onSync = (cat, idx, url, label) => net.sendRadioChange(cat, idx, url, label)
      // Cuando el servidor informa un cambio → aplicar en el radio local
      net.onRadioChange = (cat, idx, url, label) => radio.applyRemoteState(cat, idx, url, label)

      console.log('[Atlas] Bienvenido. WASD para moverte. Enter para chatear.')
    })

  } catch (err) {
    console.error('[Atlas] Error al iniciar:', err)
    const txt = loadingScreen.querySelector('p')
    if (txt) txt.textContent = 'Error al cargar. Recarga la pagina.'
  }
}

boot()
