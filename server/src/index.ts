import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import { randomUUID } from 'crypto'
import { existsSync } from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 4000

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())

// ─── RUTAS HTTP ───────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'atlas-server',
    version: '0.1.0',
    players: players.size,
    timestamp: new Date().toISOString(),
  })
})

app.get('/api/rooms', (_req, res) => {
  res.json({
    rooms: [{
      id: 'cafe-01',
      name: 'La Cafetería',
      slug: 'cafeteria',
      capacity: 40,
      occupancy: players.size,
      is_active: true,
    }]
  })
})

// En producción: servir el cliente compilado (Vite build → client/dist/)
// En desarrollo: 404 normal (Vite dev server corre por separado)
const clientDist  = path.join(__dirname, '..', '..', 'client', 'dist')
const clientIndex = path.join(clientDist, 'index.html')
const serveClient = existsSync(clientIndex)

if (serveClient) {
  app.use(express.static(clientDist))
  // SPA fallback: cualquier ruta no-API devuelve index.html
  app.get('*', (_req, res) => res.sendFile(clientIndex))
} else {
  app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }))
}

// ─── TIPOS ───────────────────────────────────────────────────────────────────
type RGB = [number, number, number]

interface PlayerState {
  id:     string
  ws:     WebSocket
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

interface RadioState {
  category:     string   // 'somafm' | 'rd' | 'custom'
  idx:          number
  customUrl?:   string
  customLabel?: string
}

// ─── ESTADO DEL SERVIDOR ──────────────────────────────────────────────────────
const players  = new Map<string, PlayerState>()
let radioState: RadioState = { category: 'somafm', idx: 0 }

// Radio de chat de proximidad (metros, distancia XZ)
const CHAT_RADIUS = 4

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function send(ws: WebSocket, data: object) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data))
  }
}

function broadcast(data: object, excludeId?: string) {
  const json = JSON.stringify(data)
  for (const p of players.values()) {
    if (p.id !== excludeId && p.ws.readyState === WebSocket.OPEN) {
      p.ws.send(json)
    }
  }
}

function playerPublic(p: PlayerState) {
  const { ws: _ws, ...pub } = p
  return pub
}

/** Distancia en el plano XZ (ignorar altura Y) */
function distXZ(a: PlayerState, b: PlayerState): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.z - b.z) ** 2)
}

// ─── WEBSOCKET ────────────────────────────────────────────────────────────────
const httpServer = createServer(app)
const wss = new WebSocketServer({ server: httpServer, path: '/ws' })

wss.on('connection', (ws) => {
  const id = randomUUID()

  const player: PlayerState = {
    id, ws,
    name:   'Jugador',
    x: 0, y: 0, z: 4.5, ry: 0,
    skin:   [0.76, 0.56, 0.42],
    hair:   [0.10, 0.07, 0.04],
    jacket: [0.14, 0.26, 0.52],
    pants:  [0.12, 0.14, 0.22],
  }
  players.set(id, player)

  // 1. Bienvenida: ID propio + jugadores existentes + estado actual de la radio
  const existing = [...players.values()]
    .filter(p => p.id !== id)
    .map(playerPublic)

  send(ws, { type: 'welcome', id, players: existing, radioState })

  // 2. Notificar a todos que llegó un jugador nuevo
  broadcast({ type: 'player_join', ...playerPublic(player) }, id)

  console.log(`[Atlas WS] + ${id.slice(0, 8)} conectado (sala: ${players.size} jugadores)`)

  // 3. Mensajes del cliente
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString())

      // ── Movimiento ──
      if (msg.type === 'move') {
        player.x  = msg.x  ?? player.x
        player.y  = msg.y  ?? player.y
        player.z  = msg.z  ?? player.z
        player.ry = msg.ry ?? player.ry
        broadcast({ type: 'player_move', id, x: player.x, y: player.y, z: player.z, ry: player.ry }, id)
      }

      // ── Identidad ──
      if (msg.type === 'identity') {
        player.name   = msg.name   ?? player.name
        player.skin   = msg.skin   ?? player.skin
        player.hair   = msg.hair   ?? player.hair
        player.jacket = msg.jacket ?? player.jacket
        player.pants  = msg.pants  ?? player.pants
        broadcast({
          type: 'player_identity', id,
          name: player.name, skin: player.skin,
          hair: player.hair, jacket: player.jacket, pants: player.pants,
        }, id)
      }

      // ── Chat de proximidad ──
      // Solo llega a jugadores dentro de CHAT_RADIUS metros (más el emisor)
      if (msg.type === 'chat') {
        const text = String(msg.text ?? '').trim().slice(0, 200)
        if (text) {
          const json = JSON.stringify({ type: 'chat', id, name: player.name, text })
          for (const p of players.values()) {
            if (p.ws.readyState !== WebSocket.OPEN) continue
            // Siempre enviar al propio emisor, y a los que están cerca
            if (p.id === id || distXZ(player, p) <= CHAT_RADIUS) {
              p.ws.send(json)
            }
          }
        }
      }

      // ── Radio sincronizada ──
      // Cualquier usuario puede cambiar la estación de la sala.
      // Se hace broadcast a TODOS (los que tengan sync ON lo aplican).
      if (msg.type === 'radio_change') {
        radioState = {
          category:    String(msg.category    ?? 'somafm'),
          idx:         Number(msg.idx         ?? 0),
          customUrl:   msg.customUrl   ? String(msg.customUrl).slice(0, 500)   : undefined,
          customLabel: msg.customLabel ? String(msg.customLabel).slice(0, 80)  : undefined,
        }
        broadcast({ type: 'radio_state', ...radioState })
        console.log(`[Atlas Radio] Estación cambiada por ${id.slice(0, 8)}: ${radioState.category}[${radioState.idx}]`)
      }

    } catch { /* ignorar mensajes malformados */ }
  })

  // 4. Desconexión
  ws.on('close', () => {
    players.delete(id)
    broadcast({ type: 'player_leave', id })
    console.log(`[Atlas WS] - ${id.slice(0, 8)} salió (sala: ${players.size} jugadores)`)
  })
})

// ─── ARRANQUE ─────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`[Atlas Server] http://localhost:${PORT}`)
  console.log(`[Atlas Server] WebSocket en ws://localhost:${PORT}/ws`)
})

export { app, httpServer }
