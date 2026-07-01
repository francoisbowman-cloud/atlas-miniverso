# -*- coding: utf-8 -*-
"""
avatar_factory.py — Puente Python ↔ Blender headless para generar avatares de Atlas.

Envuelve create_avatar.py: arma un config.json, invoca Blender en background,
y deja el resultado en client/public/models/ (avatar.glb por defecto, o
variantes nombradas en client/public/models/variants/).

Uso típico (por Cowork, vía el conector MCP, o directo):
    from avatar_factory import generate_avatar, list_variants, set_default

    generate_avatar({"gender": "M", "height": 1.05, "build": 1.1,
                      "jacket_hex": "#7a1f1f"}, name="chico_alto")
    set_default("chico_alto")   # lo copia sobre avatar.glb (el que carga el cliente)
"""

import json
import os
import re
import shutil
import subprocess
import sys
import time

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(PROJECT_DIR, "client", "public", "models")
VARIANTS_DIR = os.path.join(MODELS_DIR, "variants")
DEFAULT_AVATAR = os.path.join(MODELS_DIR, "avatar.glb")
GENERATOR_SCRIPT = os.path.join(PROJECT_DIR, "create_avatar.py")

os.makedirs(VARIANTS_DIR, exist_ok=True)

_BLENDER_CANDIDATES = [
    os.environ.get("ATLAS_BLENDER_EXE"),
    r"C:\Program Files\Blender Foundation\Blender 5.1\blender.exe",
    r"C:\Program Files\Blender Foundation\Blender 4.5\blender.exe",
    r"C:\Program Files\Blender Foundation\Blender 4.2\blender.exe",
]

DEFAULT_PARAMS = {
    "gender": "F",
    "height": 1.0,
    "build": 1.0,
    "skin_hex": "#C28E69",
    "hair_hex": "#1A120B",
    "jacket_hex": "#234285",
    "pant_hex": "#1F2438",
}


def find_blender():
    for cand in _BLENDER_CANDIDATES:
        if cand and os.path.isfile(cand):
            return cand
    base = r"C:\Program Files\Blender Foundation"
    if os.path.isdir(base):
        for entry in sorted(os.listdir(base), reverse=True):
            exe = os.path.join(base, entry, "blender.exe")
            if os.path.isfile(exe):
                return exe
    return None


def _safe_name(text):
    return re.sub(r"[^a-zA-Z0-9_-]", "_", text)[:60]


def generate_avatar(params=None, name=None, set_as_default=False, timeout=90):
    """Genera un avatar .glb con Blender a partir de parámetros.

    Args:
        params: dict con cualquiera de gender/height/build/skin_hex/hair_hex/
                jacket_hex/pant_hex (ver DEFAULT_PARAMS). Los que falten usan
                el valor por defecto.
        name: nombre de la variante (sin extensión). Si es None y
              set_as_default=False, se genera un nombre automático.
        set_as_default: si True, escribe directamente sobre avatar.glb (el
                        que carga GLBAvatar.ts en el cliente) en vez de una
                        variante aparte.

    Returns:
        dict {"ok": True, "path": ruta, "name": nombre} o {"ok": False, "error": ...}
    """
    blender_exe = find_blender()
    if not blender_exe:
        return {"ok": False, "error": "No se encontró Blender instalado en este sistema."}

    cfg = dict(DEFAULT_PARAMS)
    cfg.update(params or {})

    if set_as_default:
        out_path = DEFAULT_AVATAR
        base_name = "avatar"
    else:
        base_name = _safe_name(name or f"avatar_{cfg['gender'].lower()}_{int(time.time())}")
        out_path = os.path.join(VARIANTS_DIR, base_name + ".glb")

    cfg["out_path"] = out_path.replace("\\", "/")
    cfg_path = os.path.join(VARIANTS_DIR, "_cfg_" + base_name + ".json")
    with open(cfg_path, "w", encoding="utf-8") as f:
        json.dump(cfg, f, ensure_ascii=False, indent=2)

    cmd = [blender_exe, "--background", "--factory-startup", "--python", GENERATOR_SCRIPT,
           "--", "--config", cfg_path]

    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout,
                               encoding="utf-8", errors="replace")
    except subprocess.TimeoutExpired:
        return {"ok": False, "error": f"Blender no respondió en {timeout}s."}
    finally:
        if os.path.exists(cfg_path):
            os.remove(cfg_path)

    result = None
    for line in (proc.stdout or "").splitlines():
        if line.startswith("ATLAS_RESULT:"):
            try:
                result = json.loads(line[len("ATLAS_RESULT:"):])
            except json.JSONDecodeError:
                pass

    if not result or not result.get("ok"):
        tail = (proc.stdout or "")[-600:] + "\n" + (proc.stderr or "")[-600:]
        return {"ok": False, "error": f"Blender no generó el avatar. Salida:\n{tail}"}

    return {"ok": True, "path": out_path, "name": base_name, "config": cfg}


def list_variants():
    if not os.path.isdir(VARIANTS_DIR):
        return []
    return sorted(f[:-4] for f in os.listdir(VARIANTS_DIR) if f.endswith(".glb"))


def set_default(variant_name):
    """Copia una variante ya generada sobre avatar.glb (el que carga el cliente)."""
    src = os.path.join(VARIANTS_DIR, _safe_name(variant_name) + ".glb")
    if not os.path.isfile(src):
        return {"ok": False, "error": f"No existe la variante '{variant_name}'."}
    shutil.copyfile(src, DEFAULT_AVATAR)
    return {"ok": True, "default": DEFAULT_AVATAR, "source": variant_name}


if __name__ == "__main__":
    # Prueba manual: python avatar_factory.py [nombre]
    name = sys.argv[1] if len(sys.argv) > 1 else None
    r = generate_avatar({"gender": "F"}, name=name)
    print(json.dumps(r, ensure_ascii=False, indent=2))
