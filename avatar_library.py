# -*- coding: utf-8 -*-
"""
avatar_library.py — Gestión de la biblioteca de avatares realistas de Atlas.

La colección núcleo "los8" siempre se conserva. Modelos añadidos (Nathan u
otros) se registran como 'extra' y pueden retirarse de una sola vez.

Comandos:
  python avatar_library.py list          Lista qué hay y su clasificación.
  python avatar_library.py add <nombre>  Registra un .glb existente como extra.
  python avatar_library.py solo-los8     Borra todo .glb que no sea de los8.
                                          (--dry para simular sin borrar)
"""

import json
import os
import sys

DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                   "client", "public", "models", "realistic")
MANIFEST = os.path.join(DIR, "manifest.json")


def load():
    with open(MANIFEST, "r", encoding="utf-8") as f:
        return json.load(f)


def save(data):
    with open(MANIFEST, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def core_names(data):
    return set(data["collections"]["los8"]["avatares"])


def glb_files():
    return sorted(n[:-4] for n in os.listdir(DIR) if n.endswith(".glb"))


def cmd_list():
    data = load()
    core = core_names(data)
    extras = set(data.get("extras", []))
    print("Colección los8 (núcleo, se conserva):")
    for n in sorted(core):
        mark = "OK " if os.path.exists(os.path.join(DIR, n + ".glb")) else "FALTA"
        print(f"  [{mark}] {n}")
    presentes = set(glb_files())
    otros = sorted(presentes - core)
    print(f"\nExtras / no-núcleo en disco ({len(otros)}):")
    for n in otros:
        tag = "registrado" if n in extras else "sin registrar"
        print(f"  [{tag}] {n}")
    if not otros:
        print("  (ninguno)")


def cmd_add(name):
    name = name[:-4] if name.endswith(".glb") else name
    if not os.path.exists(os.path.join(DIR, name + ".glb")):
        print(f"No existe {name}.glb en {DIR}")
        return
    data = load()
    if name in core_names(data):
        print(f"{name} ya es parte de los8.")
        return
    extras = data.setdefault("extras", [])
    if name not in extras:
        extras.append(name)
        save(data)
    print(f"Registrado como extra: {name}")


def cmd_solo_los8(dry):
    data = load()
    core = core_names(data)
    borrados = []
    for n in glb_files():
        if n not in core:
            path = os.path.join(DIR, n + ".glb")
            borrados.append(n)
            if not dry:
                os.remove(path)
    if not dry:
        data["extras"] = []
        save(data)
    verbo = "Se borrarían" if dry else "Borrados"
    print(f"{verbo} {len(borrados)}: {', '.join(borrados) or '(ninguno)'}")
    print(f"Conservados (los8): {len(core)}")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "list"
    if cmd == "list":
        cmd_list()
    elif cmd == "add" and len(sys.argv) > 2:
        cmd_add(sys.argv[2])
    elif cmd == "solo-los8":
        cmd_solo_los8("--dry" in sys.argv)
    else:
        print(__doc__)
