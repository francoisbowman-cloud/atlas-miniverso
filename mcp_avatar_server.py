# -*- coding: utf-8 -*-
"""
mcp_avatar_server.py — Conector MCP: modelado 3D de avatares para Atlas.

Da a Cowork/Claude control directo sobre la generación de avatares del
proyecto, sin depender de que un humano abra Blender. Todo corre local
(Blender ya instalado) — no requiere API de pago ni internet.

Registro: ver .mcp.json en la raíz de este proyecto.
Protocolo: MCP sobre stdio (JSON-RPC 2.0, un mensaje por línea).
"""

import json
import sys

import avatar_factory

PROTOCOL_VERSION = "2024-11-05"


def tool_generate(args):
    params = {k: args[k] for k in
              ("gender", "height", "build", "skin_hex", "hair_hex", "jacket_hex", "pant_hex")
              if k in args}
    r = avatar_factory.generate_avatar(
        params, name=args.get("name"), set_as_default=bool(args.get("set_as_default", False))
    )
    if not r.get("ok"):
        return "Error: " + r.get("error", "desconocido")
    where = "avatar.glb (por defecto, el que carga el cliente ahora)" if args.get("set_as_default") else f"variants/{r['name']}.glb"
    return f"Avatar generado en {where}.\nConfig: {json.dumps(r['config'], ensure_ascii=False)}"


def tool_list_variants(_args):
    variants = avatar_factory.list_variants()
    if not variants:
        return "No hay variantes generadas todavía."
    return f"{len(variants)} variante(s): " + ", ".join(variants)


def tool_set_default(args):
    name = args.get("name", "")
    r = avatar_factory.set_default(name)
    if not r.get("ok"):
        return "Error: " + r.get("error", "desconocido")
    return f"'{name}' ahora es el avatar por defecto (client/public/models/avatar.glb)."


TOOLS = [
    {
        "name": "atlas_avatar_generate",
        "description": (
            "Genera un avatar humanoid .glb para Atlas con Blender (local, sin API de pago). "
            "Respeta la convención de materiales que GLBAvatar.ts espera (skin/hair/jacket/pant, "
            "sin texturas) para que el customizador de colores del cliente siga funcionando. "
            "Parámetros de libertad creativa: gender ('F'/'M'), height y build (multiplicadores, "
            "~0.85-1.2), y colores base skin_hex/hair_hex/jacket_hex/pant_hex (hex '#rrggbb'). "
            "Por defecto crea una variante en client/public/models/variants/<name>.glb; con "
            "set_as_default=true sobreescribe directamente avatar.glb (el que el cliente carga)."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "name": {"type": "string", "description": "Nombre de la variante (sin .glb)."},
                "gender": {"type": "string", "enum": ["F", "M"]},
                "height": {"type": "number"},
                "build": {"type": "number"},
                "skin_hex": {"type": "string"},
                "hair_hex": {"type": "string"},
                "jacket_hex": {"type": "string"},
                "pant_hex": {"type": "string"},
                "set_as_default": {"type": "boolean",
                                    "description": "Si true, sobreescribe avatar.glb directamente."},
            },
        },
        "_fn": tool_generate,
    },
    {
        "name": "atlas_avatar_list_variants",
        "description": "Lista las variantes de avatar ya generadas en client/public/models/variants/.",
        "inputSchema": {"type": "object", "properties": {}},
        "_fn": tool_list_variants,
    },
    {
        "name": "atlas_avatar_set_default",
        "description": "Copia una variante ya generada sobre avatar.glb, el archivo que el cliente carga.",
        "inputSchema": {
            "type": "object",
            "properties": {"name": {"type": "string"}},
            "required": ["name"],
        },
        "_fn": tool_set_default,
    },
]

TOOL_BY_NAME = {t["name"]: t for t in TOOLS}


def _send(msg):
    sys.stdout.write(json.dumps(msg) + "\n")
    sys.stdout.flush()


def _result(req_id, result):
    _send({"jsonrpc": "2.0", "id": req_id, "result": result})


def _error(req_id, code, message):
    _send({"jsonrpc": "2.0", "id": req_id, "error": {"code": code, "message": message}})


def handle(msg):
    method = msg.get("method")
    req_id = msg.get("id")

    if method == "initialize":
        _result(req_id, {
            "protocolVersion": PROTOCOL_VERSION,
            "capabilities": {"tools": {}},
            "serverInfo": {"name": "atlas-avatar", "version": "1.0.0"},
        })
    elif method == "notifications/initialized":
        pass
    elif method == "tools/list":
        public = [{k: v for k, v in t.items() if not k.startswith("_")} for t in TOOLS]
        _result(req_id, {"tools": public})
    elif method == "tools/call":
        params = msg.get("params", {})
        name = params.get("name")
        args = params.get("arguments", {}) or {}
        tool = TOOL_BY_NAME.get(name)
        if not tool:
            _error(req_id, -32602, f"Herramienta desconocida: {name}")
            return
        try:
            text = tool["_fn"](args)
        except Exception as exc:
            text = f"Error ejecutando {name}: {exc}"
        _result(req_id, {"content": [{"type": "text", "text": text}]})
    elif method == "ping":
        _result(req_id, {})
    else:
        if req_id is not None:
            _error(req_id, -32601, f"Método no soportado: {method}")


def main():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            msg = json.loads(line)
        except json.JSONDecodeError:
            continue
        handle(msg)


if __name__ == "__main__":
    main()
