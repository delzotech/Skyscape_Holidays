import re

with open("index.html", "r", encoding="utf-8-sig") as f:
    content = f.read()

new_content = re.sub(
    r'class="(pkg-img-inner|g-item)"\s*style="background-image:url\(\'([^\']+)\'\)"',
    r'class="\1 lazy-bg" data-bg="\2"',
    content
)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(new_content)
    
print("Updated HTML for lazy loading.")
