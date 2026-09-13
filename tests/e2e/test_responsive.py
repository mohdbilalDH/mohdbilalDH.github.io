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
                    "[...document.querySelectorAll('a, button')].filter(e => e.offsetParent && !e.closest('svg') && !((getComputedStyle(e).display === 'inline' || e.classList.contains('linklike')) && e.closest('p, li, dd, dt, figcaption, blockquote, td')) && e.getBoundingClientRect().height < 24).map(e => e.textContent.trim().slice(0,30))"
                )
                check(len(small) == 0, f"{r} @ {w}px no tiny tap targets: {small[:5]}")
            name = r.strip("/").replace("/", "-") or "home"
            # scroll through so scroll-triggered fade-ups have fired before the capture
            for y in range(0, p.evaluate("document.body.scrollHeight"), 500):
                p.evaluate(f"window.scrollTo(0, {y})")
                p.wait_for_timeout(60)
            p.evaluate("window.scrollTo(0, 0)")
            p.wait_for_timeout(700)
            p.screenshot(path=f"tests/screenshots/{w}-{name}.png", full_page=True)
    errs = [e for e in b.errors if "no-such-page" not in e]
    check(errs == [], f"no console errors: {errs}")
