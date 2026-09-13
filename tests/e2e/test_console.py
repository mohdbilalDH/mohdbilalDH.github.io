from _lib import Browser, BASE, ROUTES, check

with Browser() as b:
    p = b.page()
    for r in ROUTES:
        p.goto(BASE + r)
        p.wait_for_load_state("networkidle")
    errs = [e for e in b.errors if "no-such-page" not in e]
    check(errs == [], f"zero console errors across routes: {errs}")
