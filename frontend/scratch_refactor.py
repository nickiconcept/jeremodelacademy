import re

css_path = r"c:\Users\N Concept World\Desktop\Nicholas'_Projects\Jere Model Academy\frontend\src\index.css"
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Replace .app-container mobile block
css = re.sub(
    r"\.app-container\s*\{\s*flex-direction:\s*column;\s*min-height:\s*100dvh;\s*\}",
    ".app-container { display: flex; flex-direction: column; height: 100dvh !important; overflow: hidden; min-height: 0; }",
    css, count=1
)

# Replace .main-content mobile block
css = re.sub(
    r"\.main-content\s*\{\s*padding:[^}]*\}",
    ".main-content { padding: 14px !important; flex-grow: 1; overflow-y: auto; overflow-x: hidden; min-height: 0 !important; max-height: none !important; }",
    css, count=1
)

# Replace .mobile-bottom-nav mobile block
old_nav = r"\.mobile-bottom-nav\s*\{[\s\S]*?(?=\.mobile-bottom-nav__item\s*\{)"
new_nav = """.mobile-bottom-nav {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    align-items: end;
    min-height: 76px;
    padding: 7px 6px calc(7px + env(safe-area-inset-bottom));
    flex-shrink: 0;
    z-index: 1001;
  }
  """
css = re.sub(old_nav, new_nav, css, count=1)

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)
print('Done!')
