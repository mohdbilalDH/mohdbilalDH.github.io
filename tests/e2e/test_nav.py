from _lib import Browser, BASE, ROUTES, check

CURRENT = {
    "/projects/": "Projects", "/publications/": "Publications", "/visualizations/": "Visualizations",
    "/cv/": "CV", "/contact/": "Contact", "/projects/janghan/": "Projects",
    "/projects/buddhist-bridges/": "Projects", "/projects/buddhist-bridges/explore/": "Projects",
    "/projects/hallyu-indian-press/": "Projects",
}

with Browser() as b:
    p = b.page()
    for r in ROUTES:
        resp = p.goto(BASE + r)
        p.wait_for_load_state("networkidle")
        expected = 404 if r == "/no-such-page/" else 200
        check(resp.status == expected, f"{r} -> {expected}")
        check(p.locator("h1").count() == 1, f"{r} has one h1")
        check(p.locator("a.skip-link").count() == 1 and p.locator("main#main").count() == 1, f"{r} landmarks")
        if r in CURRENT:
            check(p.locator("header nav a[aria-current='page']").text_content().strip().endswith(CURRENT[r]), f"{r} current nav = {CURRENT[r]}")
    errs = [e for e in b.errors if "no-such-page" not in e]
    check(errs == [], f"no console errors: {errs}")
