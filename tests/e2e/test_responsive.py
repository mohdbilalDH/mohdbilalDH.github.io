import os
from _lib import Browser, BASE, ROUTES, check

os.makedirs("tests/screenshots", exist_ok=True)
with Browser() as b:
    for w, h in [(375, 812), (768, 1024), (1280, 900)]:
        p = b.page(w, h)
        for r in ROUTES:
            p.goto(BASE + r)
            p.wait_for_load_state("networkidle")
            sw, iw = p.evaluate("[document.documentElement.scrollWidth, window.innerWidth]")
            check(sw <= iw, f"{r} @ {w}px no horizontal overflow ({sw} <= {iw})")
            if w < 900:
                small = p.evaluate(
                    "[...document.querySelectorAll('a, button')].filter(e => e.offsetParent && !e.closest('svg') && !(getComputedStyle(e).display === 'inline' && e.closest('p, li, dd, dt, figcaption, blockquote, td')) && e.getBoundingClientRect().height < 24).map(e => e.textContent.trim().slice(0,30))"
                )
                check(len(small) == 0, f"{r} @ {w}px no tiny tap targets: {small[:5]}")
            name = r.strip("/").replace("/", "-") or "home"
            p.screenshot(path=f"tests/screenshots/{w}-{name}.png", full_page=True)
    errs = [e for e in b.errors if "no-such-page" not in e]
    check(errs == [], f"no console errors: {errs}")
