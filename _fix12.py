#!/usr/bin/env python3
"""BATCH A / FIX-12: Add qnt-block after Q07 (substances + reactive vs spontaneous hypomania)."""

FILE = '/var/www/psytest/bar.html'

with open(FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# Marker: end of Q07 answers div + closing qc div, before Q8 comment
OLD = '</div></div>\n\n  <!-- Q8:'

# Insert qnt between </div>(ans) and </div>(qc)
NEW = """</div>
    <div class="qnt"><strong>Что считать подъёмом?</strong> Оценивайте только спонтанные подъёмы — не вызванные алкоголем, стимуляторами или бессонницей. Подъём, вызванный интересной деятельностью и пропорциональный ей — вариант нормы. Подъём, при котором вы спите менее 5 часов без усталости, окружающие замечают изменения в вашем поведении, вы не можете остановиться — может быть гипоманией, даже если есть внешняя «причина».</div></div>

  <!-- Q8:"""

assert OLD in content, "Marker not found!"
assert content.count(OLD) == 1, f"Not unique: {content.count(OLD)}"
content = content.replace(OLD, NEW)
print("FIX-12 OK: qnt-block inserted after Q07")

with open(FILE, 'w', encoding='utf-8') as f:
    f.write(content)

print("DONE")
