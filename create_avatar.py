"""
create_avatar.py — Generador paramétrico de avatares para Atlas (Blender background).

Uso por defecto (idéntico al script original, usado por run_avatar.bat):
  blender --background --python create_avatar.py
  → genera client/public/models/avatar.glb

Uso paramétrico (variantes, para el pipeline de Cowork vía avatar_factory.py):
  blender --background --python create_avatar.py -- --config variante.json
  → genera el GLB en la ruta que indique el config, con género/altura/
    complexión/colores propios.

Geometría: humanoid de bajo poligonaje construido con primitivas (conos,
cilindros, esferas), pensado para hardware modesto (el objetivo de Atlas
corre en equipos como un Intel HD 620 con 128MB de VRAM dedicada) — nada
de esculpido de alta resolución ni subsurf pesado.

Materiales — 4 nombres exactos, sin texturas, que GLBAvatar.ts reconoce en
classifyMeshes() y recolorea en tiempo real vía StandardMaterial:
  skin   → cabeza, cuello, manos
  hair   → cabello, cejas/ojos (convención heredada)
  jacket → torso, hombros, brazos
  pant   → cadera, piernas, pies

El exportador GLTF de Blender convierte Z-up (Blender) → Y-up (glTF) al
exportar, por lo que GLBAvatar.ts no necesita rotación correctiva para
estos avatares.
"""

import json
import os
import sys

import bpy

DEFAULT_CONFIG = {
    "gender": "F",         # 'F' o 'M' — afecta proporciones hombro/cadera
    "height": 1.0,          # multiplicador sobre 1.75 m
    "build": 1.0,           # multiplicador de complexión (grosor)
    "skin_hex": "#C28E69",
    "hair_hex": "#1A120B",
    "jacket_hex": "#234285",
    "pant_hex": "#1F2438",
    "out_path": None,       # se resuelve a client/public/models/avatar.glb si es None
}


def _get_config():
    argv = sys.argv
    if "--" in argv:
        args = argv[argv.index("--") + 1:]
        if "--config" in args:
            path = args[args.index("--config") + 1]
            with open(path, "r", encoding="utf-8") as f:
                user_cfg = json.load(f)
            cfg = dict(DEFAULT_CONFIG)
            cfg.update(user_cfg)
            return cfg
    return dict(DEFAULT_CONFIG)


def _hex_to_rgba(hexstr):
    h = hexstr.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4))
    return (r, g, b, 1.0)


print("[Atlas] Iniciando creación de avatar...")
CFG = _get_config()
GENDER = CFG.get("gender", "F")
HEIGHT_MUL = float(CFG.get("height", 1.0))
BUILD_MUL = float(CFG.get("build", 1.0))

# ─── Limpiar escena por defecto ────────────────────────────────────────────
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()
for mesh in list(bpy.data.meshes):
    bpy.data.meshes.remove(mesh)

# ─── Materiales ─────────────────────────────────────────────────────────────
# Los nombres deben contener los keywords de classifyMeshes() en GLBAvatar.ts:
# skin → ['skin', 'body', 'face', 'head', 'flesh']
# hair → ['hair', 'eyebrow', 'beard']
# jacket → ['jacket', 'shirt', 'torso', 'chest', 'cloth', 'top', 'upper']
# pant → ['pant', 'leg', 'bottom', 'shoe', 'boot', 'foot', 'lower']

def new_mat(name, rgba):
    """Crea un material con Principled BSDF y el color base fijado.
    Necesario para que el exportador glTF escriba baseColorFactor
    correctamente (con use_nodes=False, Blender exporta el gris por
    defecto sin importar diffuse_color). GLBAvatar.ts igualmente
    reemplaza el material en runtime, pero este color base evita un
    destello de maniquí gris antes de que corra updateSkin()/etc.,
    y hace útil inspeccionar el GLB fuera del cliente."""
    m = bpy.data.materials.new(name=name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = rgba
        if "Roughness" in bsdf.inputs:
            bsdf.inputs["Roughness"].default_value = 0.75
    m.diffuse_color = rgba
    return m


MAT = {
    'skin':   new_mat('skin', _hex_to_rgba(CFG["skin_hex"])),
    'hair':   new_mat('hair', _hex_to_rgba(CFG["hair_hex"])),
    'jacket': new_mat('jacket', _hex_to_rgba(CFG["jacket_hex"])),
    'pant':   new_mat('pant', _hex_to_rgba(CFG["pant_hex"])),
}


def assign(obj, key):
    mat = MAT[key]
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)


# ─── Helpers de geometría ────────────────────────────────────────────────────
# Blender usa Z como eje vertical; el exportador GLTF convierte a Y-up.

def sphere(name, loc, sx, sy, sz, mat_key, segs=16, rings=10):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=segs, ring_count=rings, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.scale = (sx, sy, sz)
    assign(o, mat_key)
    bpy.ops.object.shade_smooth()
    return o


def frustum(name, loc, r1, r2, h, mat_key, verts=16):
    """Cono truncado: r1 = radio inferior, r2 = radio superior, h = altura.
    Da forma natural (torso, muslos) sin editar mallas a mano."""
    bpy.ops.mesh.primitive_cone_add(
        radius1=r1, radius2=r2, depth=h, vertices=verts, location=loc
    )
    o = bpy.context.active_object
    o.name = name
    assign(o, mat_key)
    bpy.ops.object.shade_smooth()
    return o


def cylinder(name, loc, rx, ry, h, mat_key, verts=14):
    bpy.ops.mesh.primitive_cylinder_add(radius=1, depth=1, vertices=verts, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.scale = (rx, ry, h)
    assign(o, mat_key)
    bpy.ops.object.shade_smooth()
    return o


def box(name, loc, sx, sy, sz, mat_key):
    bpy.ops.mesh.primitive_cube_add(location=loc)
    o = bpy.context.active_object
    o.name = name
    o.scale = (sx, sy, sz)
    assign(o, mat_key)
    return o


# ─── Construcción del avatar ─────────────────────────────────────────────────
# Todas las medidas son para HEIGHT_MUL=1.0 (≈1.75 m). BUILD_MUL engorda o
# adelgaza el grosor sin tocar la altura. Los segmentos se solapan a
# propósito (overlap) para que no queden huecos visibles en las uniones,
# a diferencia de la v1 donde las piezas solo se tocaban en un punto.

B = BUILD_MUL
shoulder_w = 0.240 * (1.08 if GENDER == 'M' else 0.96)
hip_w      = 0.155 * (0.94 if GENDER == 'M' else 1.04)
chest_r    = 0.150 * (1.06 if GENDER == 'M' else 0.98) * B
waist_r    = 0.108 * B

print("[Atlas] Construyendo geometría...")

# ── PIES ─────────────────────────────────────────────────────────────────────
sphere('pant_shoe_l', (-0.095, 0.020, 0.060), 0.072 * B, 0.105, 0.062, 'pant', segs=12, rings=6)
sphere('pant_shoe_r', (0.095, 0.020, 0.060), 0.072 * B, 0.105, 0.062, 'pant', segs=12, rings=6)

# ── ESPINILLA / MUSLO (radios calzados con las esferas de rodilla/tobillo
#    y altura extendida para que el solape quede DENTRO del volumen vecino,
#    sin costura visible) ────────────────────────────────────────────────────
frustum('pant_leg_l', (-0.095, 0, 0.235), 0.060 * B, 0.058 * B, 0.400, 'pant', verts=14)
frustum('pant_leg_r', (0.095, 0, 0.235), 0.060 * B, 0.058 * B, 0.400, 'pant', verts=14)
sphere('pant_knee_l', (-0.095, 0, 0.400), 0.060 * B, 0.058, 0.060, 'pant', segs=10, rings=7)
sphere('pant_knee_r', (0.095, 0, 0.400), 0.060 * B, 0.058, 0.060, 'pant', segs=10, rings=7)
frustum('pant_thigh_l', (-0.095, 0, 0.650), 0.072 * B, 0.060 * B, 0.460, 'pant', verts=14)
frustum('pant_thigh_r', (0.095, 0, 0.650), 0.072 * B, 0.060 * B, 0.460, 'pant', verts=14)

# ── CADERA (radio inferior calzado con el muslo) ──────────────────────────────
frustum('pant_hips', (0, 0, 0.880), hip_w * B, 0.072 * B, 0.300, 'pant', verts=18)

# ── TORSO (más ancho en pecho, angosto en cintura; radio inferior calzado
#    con la cadera) ────────────────────────────────────────────────────────────
frustum('jacket_torso', (0, 0, 1.170), hip_w * B * 0.98, chest_r, 0.510, 'jacket', verts=18)

# ── HOMBROS ────────────────────────────────────────────────────────────────────
sphere('jacket_shoulder_l', (-shoulder_w, 0, 1.405), 0.095 * B, 0.088, 0.088, 'jacket', segs=12, rings=8)
sphere('jacket_shoulder_r', (shoulder_w, 0, 1.405), 0.095 * B, 0.088, 0.088, 'jacket', segs=12, rings=8)

# ── BRAZOS (con solape generoso en hombro/codo/muñeca) ─────────────────────────
arm_x_l, arm_x_r = -shoulder_w * 1.12, shoulder_w * 1.12
frustum('jacket_ua_l', (arm_x_l, 0, 1.190), 0.062 * B, 0.058 * B, 0.400, 'jacket', verts=12)
frustum('jacket_ua_r', (arm_x_r, 0, 1.190), 0.062 * B, 0.058 * B, 0.400, 'jacket', verts=12)
sphere('jacket_elbow_l', (arm_x_l, 0, 1.010), 0.058 * B, 0.052, 0.058, 'jacket', segs=10, rings=7)
sphere('jacket_elbow_r', (arm_x_r, 0, 1.010), 0.058 * B, 0.052, 0.058, 'jacket', segs=10, rings=7)
frustum('jacket_la_l', (arm_x_l, 0, 0.845), 0.056 * B, 0.048 * B, 0.340, 'jacket', verts=12)
frustum('jacket_la_r', (arm_x_r, 0, 0.845), 0.056 * B, 0.048 * B, 0.340, 'jacket', verts=12)

# ── MANOS ──────────────────────────────────────────────────────────────────────
sphere('skin_hand_l', (arm_x_l, 0, 0.660), 0.050 * B, 0.042, 0.062, 'skin', segs=12, rings=8)
sphere('skin_hand_r', (arm_x_r, 0, 0.660), 0.050 * B, 0.042, 0.062, 'skin', segs=12, rings=8)

# ── CUELLO (radio superior calzado con la base de la cabeza) ─────────────────
cylinder('skin_neck', (0, 0, 1.480), 0.046, 0.044, 0.170, 'skin', verts=12)

# ── CABEZA ──────────────────────────────────────────────────────────────────────
sphere('skin_head', (0, 0, 1.635), 0.132, 0.116, 0.138, 'skin', segs=18, rings=12)

# ── CEJAS (marcadores discretos, pegados a la superficie de la cara) ────────────
box('hair_eyebrow_l', (-0.048, -0.112, 1.660), 0.026, 0.008, 0.010, 'hair')
box('hair_eyebrow_r', (0.048, -0.112, 1.660), 0.026, 0.008, 0.010, 'hair')

# ── CABELLO (casquete + laterales + nuca, formas solapadas) ─────────────────────
sphere('hair_cap', (0, 0.005, 1.700), 0.140, 0.128, 0.098, 'hair', segs=18, rings=8)
sphere('hair_side_l', (-0.128, 0, 1.630), 0.050, 0.068, 0.095, 'hair', segs=10, rings=7)
sphere('hair_side_r', (0.128, 0, 1.630), 0.050, 0.068, 0.095, 'hair', segs=10, rings=7)
sphere('hair_back', (0, 0.075, 1.615), 0.118, 0.078, 0.118, 'hair', segs=14, rings=8)

print("[Atlas] Geometría creada.")

# ─── Escalar toda la figura según HEIGHT_MUL ──────────────────────────────────
bpy.ops.object.select_all(action='SELECT')
if HEIGHT_MUL != 1.0:
    bpy.ops.transform.resize(value=(1, 1, HEIGHT_MUL))
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
print("[Atlas] Escala aplicada.")

# ─── Ruta de exportación ───────────────────────────────────────────────────────
script_dir = os.path.dirname(os.path.abspath(__file__))
if CFG.get("out_path"):
    out_path = CFG["out_path"]
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
else:
    out_dir = os.path.join(script_dir, 'client', 'public', 'models')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'avatar.glb')

print(f"[Atlas] Exportando a: {out_path}")

# ─── Exportar GLB (sin texturas embebidas → GLBAvatar.ts usa StandardMaterial) ─
bpy.ops.export_scene.gltf(
    filepath=out_path,
    export_format='GLB',
    export_apply=True,
    export_normals=True,
    export_animations=False,
    export_skins=False,
    export_yup=True,
)

print(f"[Atlas] Avatar exportado correctamente: {out_path}")
print("[Atlas] Materiales: skin, hair, jacket, pant")
print("[Atlas] Tamaño del archivo:", os.path.getsize(out_path), "bytes")
print("ATLAS_RESULT:" + json.dumps({"ok": True, "out_path": out_path, "gender": GENDER}))
