# Script to update the .ts files based on all_spells.tsv
import csv
import re
import unicodedata
from pathlib import Path

# ==== CONFIG ====
tsv_file = Path("all_spells.tsv")   # same folder
general_file = Path("generalSpells.ts")
arcane_file = Path("arcane.ts")
divine_file = Path("divine.ts")

# ==== HELPERS ====
def strip_accents(text: str) -> str:
    return ''.join(c for c in unicodedata.normalize('NFD', text)
                   if unicodedata.category(c) != 'Mn')

def to_camel(name: str) -> str:
    # remove accents, non-alphanum, then camelCase
    clean = strip_accents(name)
    parts = re.split(r'[^A-Za-z0-9]+', clean)
    parts = [p for p in parts if p]
    if not parts:
        return ""
    return parts[0].lower() + ''.join(p.capitalize() for p in parts[1:])

def load_spells(tsv_file: Path):
    spells = []
    with open(tsv_file, encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")
        for row in reader:
            if not row.get("nome"):
                continue
            name = row["nome"].strip()
            circle = int(row.get("circle", "0") or "0")
            spell_type = row.get("type", "").strip().lower()
            enum_key = to_camel(name)

            # Build aprimoramentos
            aprimoramentos = []
            for i in range(1, 14):
                addpm = row.get(f"addPM.{i}") or row.get(f"addpm.{i}")
                txt = row.get(f"text.{i}") or row.get(f"txt.{i}")
                if addpm and txt:
                    aprimoramentos.append(f"\n      {{\n        addPM: {addpm},\n        text: `{txt.strip()}`\n      }}")
            aprimoramentos.append("\n    ")

            spell_obj = {
                "name": name,
                "circle": circle,
                "type": spell_type,
                "enum_key": enum_key,
                "execucao": row.get("execucao", ""),
                "alcance": row.get("alcance", ""),
                "area": row.get("area", ""),
                "alvo": row.get("alvo", ""),
                "duracao": row.get("duracao", ""),
                "school": row.get("school", ""),
                "resistencia": row.get("resistencia", ""),
                "description": row.get("description", ""),
                "aprimoramentos": aprimoramentos,
                "publicacao": row.get("publicacao", ""),
            }
            spells.append(spell_obj)
    # print(spells)
    return spells

def build_enum_block(circle, spells):
    enum_lines = [f"export enum spellsCircle{circle}Names {{"]
    for sp in spells:
        enum_lines.append(f"  {sp['enum_key']} = \"{sp['name']}\",")
    enum_lines.append("}")
    return "\n".join(enum_lines)

def build_record_block(circle, spells):
    lines = [f"export const spellsCircle{circle}: Record<spellsCircle{circle}Names, Spell> = {{"]
    for sp in spells:
        aprim = f"[{', '.join(sp['aprimoramentos'])}]" if sp['aprimoramentos'] else "[]"
        lines.append(f"  [spellsCircle{circle}Names.{sp['enum_key']}]: {{")
        lines.append(f"    nome: \"{sp['name']}\",")
        if sp['execucao']:      lines.append(f"    execucao: \"{sp['execucao'].capitalize()}\",")
        if sp['alcance']:       lines.append(f"    alcance: \"{sp['alcance'].capitalize()}\",")
        if sp['area']:          lines.append(f"    area: \"{sp['area'].capitalize()}\",")
        if sp['alvo']:          lines.append(f"    alvo: \"{sp['alvo'].capitalize()}\",")
        if sp['duracao']:       lines.append(f"    duracao: \"{sp['duracao'].capitalize()}\",")
        if sp['resistencia']:   lines.append(f"    resistencia: \"{sp['resistencia'].capitalize()}\",")
        if sp['school']:        lines.append(f"    school: \"{sp['school'].capitalize()}\",")
        lines.append(f"    description:\n      `{sp['description']}`,")
        if aprim:               lines.append(f"    aprimoramentos: {aprim},")
        if sp['publicacao']:    lines.append(f"    publicacao: `{sp['publicacao']}`,")
        lines.append("  },")
    lines.append("};")
    return "\n".join(lines)


SCHOOLS = ["Abjur", "Adiv", "Conv", "Encan", "Evoc", "Ilusão", "Necro", "Trans"]

def build_circle_block_grouped(kind, circle, spells):
    # kind = "arcane" or "divine"
    lines = [f"export const {kind}SpellsCircle{circle}: SpellCircle = {{"]
    for school in SCHOOLS:
        refs = [
            f"    c{circle}.{sp['enum_key']}"
            for sp in spells
            if sp["school"].lower().startswith(school.lower())
        ]
        arr = ",\n".join(refs)
        lines.append(f"  {school}: [\n{arr}\n  ],")
    lines.append("};")
    return "\n".join(lines)

def replace_or_append(content: str, pattern: str, replacement: str) -> str:
    regex = re.compile(pattern, re.S)
    if regex.search(content):
        return regex.sub(replacement, content)
    else:
        return content.rstrip() + "\n\n" + replacement + "\n"

# ==== MAIN PROCESS ====
all_spells = load_spells(tsv_file)

# Group by circle
circles = {i: [] for i in range(1, 6)}
for sp in all_spells:
    if 1 <= sp["circle"] <= 5:
        circles[sp["circle"]].append(sp)

# --- update generalSpells.ts ---
gen_content = general_file.read_text(encoding="utf-8")

for c in range(1, 6):
    enum_block = build_enum_block(c, circles[c])
    record_block = build_record_block(c, circles[c])
    gen_content = replace_or_append(gen_content,
        rf"export enum spellsCircle{c}Names.*?\n}}",
        enum_block)
    gen_content = replace_or_append(gen_content,
        rf"export const spellsCircle{c}:.*?\n}};",
        record_block)

general_file.write_text(gen_content, encoding="utf-8")

# --- update arcane.ts ---
arc_content = arcane_file.read_text(encoding="utf-8")
for c in range(1, 6):
    arcane_spells = [sp for sp in circles[c] if "arcana" in sp["type"] or "universal" in sp["type"]]
    block = build_circle_block_grouped("arcane", c, arcane_spells)
    arc_content = replace_or_append(arc_content,
        rf"export const arcaneSpellsCircle{c}:.*?\n}};",
        block)
arcane_file.write_text(arc_content, encoding="utf-8")

# --- update divine.ts ---
div_content = divine_file.read_text(encoding="utf-8")
for c in range(1, 6):
    divine_spells = [sp for sp in circles[c] if "divina" in sp["type"] or "universal" in sp["type"]]
    block = build_circle_block_grouped("divine", c, divine_spells)
    div_content = replace_or_append(div_content,
        rf"export const divineSpellsCircle{c}:.*?\n}};",
        block)
divine_file.write_text(div_content, encoding="utf-8")

print("Update complete.")
