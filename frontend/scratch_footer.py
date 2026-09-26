import re

css_path = r"c:\Users\N Concept World\Desktop\Nicholas'_Projects\Jere Model Academy\frontend\src\pages\LandingPage.css"
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Replace .lp-footer__grid
css = re.sub(
    r"\.lp-footer__grid\s*\{[^}]*\}",
    ".lp-footer__grid {\n  display: grid;\n  grid-template-columns: 1.6fr 1fr 1fr 1fr;\n  gap: 32px;\n  padding-bottom: 30px;\n}",
    css, count=1
)

# Replace .lp-footer__logo to add wrapper and remove blend mode
css = re.sub(
    r"\.lp-footer__logo\s*\{[^}]*\}",
    ".lp-footer__logo-wrap {\n  display: inline-block;\n  background: rgba(255, 255, 255, 0.95);\n  padding: 10px 16px;\n  border-radius: 12px;\n  margin-bottom: 16px;\n  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);\n}\n.lp-footer__logo {\n  height: 40px;\n  width: auto;\n  display: block;\n}",
    css, count=1
)

# Replace links button hover
css = re.sub(
    r"\.lp-footer__links button\s*\{[^}]*\}",
    ".lp-footer__links button, .lp-footer__legal button {\n  background: none;\n  border: none;\n  color: rgba(255,255,255,0.55);\n  font-family: 'Poppins', sans-serif;\n  font-size: 0.875rem;\n  cursor: pointer;\n  padding: 0;\n  transition: all 0.25s ease;\n  display: flex;\n  align-items: center;\n}",
    css, count=1
)
css = re.sub(
    r"\.lp-footer__links button:hover\s*\{[^}]*\}",
    ".lp-footer__links button:hover, .lp-footer__legal button:hover { color: var(--lp-accent); transform: translateX(5px); }",
    css, count=1
)

# Replace .lp-footer__bottom
css = re.sub(
    r"\.lp-footer__bottom\s*\{[^}]*\}",
    ".lp-footer__bottom {\n  border-top: 1px solid rgba(255,255,255,0.08);\n  padding: 20px 0;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  flex-wrap: wrap;\n  gap: 16px;\n}\n.lp-footer__legal {\n  display: flex;\n  gap: 24px;\n}",
    css, count=1
)

# Add heading classes
css = re.sub(
    r"\.lp-footer__heading\s*\{[^}]*\}",
    ".lp-footer__heading-desktop {\n  font-size: 0.9rem;\n  font-weight: 700;\n  color: var(--lp-white);\n  margin: 0 0 12px;\n  letter-spacing: 0.3px;\n}\n.lp-footer__heading-btn {\n  display: none;\n}",
    css, count=1
)

# Fix media query 1024
css = re.sub(
    r"\.lp-footer__grid\s*\{\s*grid-template-columns:\s*1fr\s*1fr;\s*\}",
    ".lp-footer__grid { grid-template-columns: 1fr 1fr; }",
    css
)

# Add mobile overrides
mobile_css = """
  .lp-footer__grid { grid-template-columns: 1fr; gap: 8px; }
  .lp-footer__col--brand { text-align: center; margin-bottom: 24px; }
  .lp-footer__socials { justify-content: center; }
  .lp-footer__logo-wrap { margin: 0 auto 16px auto; display: inline-flex; }
  .lp-footer__heading-desktop { display: none; }
  .lp-footer__heading-btn {
    display: flex; justify-content: space-between; align-items: center; width: 100%;
    background: transparent; border: none; border-bottom: 1px solid rgba(255,255,255,0.08);
    color: var(--lp-white); font-size: 1rem; font-weight: 600; padding: 16px 0; cursor: pointer;
  }
  .lp-footer__heading-btn svg { transition: transform 0.3s ease; }
  .lp-footer__links, .lp-footer__contact { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; }
  .lp-footer__links.open, .lp-footer__contact.open { max-height: 350px; margin-top: 12px; padding-bottom: 12px; }
  .lp-footer__bottom { flex-direction: column; text-align: center; }
"""
# inject right before .lp-about__badge { right: 0
css = css.replace(".lp-footer__grid   { grid-template-columns: 1fr; }", mobile_css)


with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)
print('Done!')
