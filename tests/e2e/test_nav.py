from _lib import Browser, BASE, ROUTES, check

# Four nav items. Project routes all mark Projects current, including data and person pages.
CURRENT = {
    "/about/": "About", "/method/": "Method", "/writing/": "Writing",
    "/projects/": "Projects", "/projects/janghan/": "Projects", "/projects/janghan/data/": "Projects",
    "/projects/buddhist-bridges/": "Projects", "/projects/buddhist-bridges/explore/": "Projects",
    "/projects/buddhist-bridges/data/": "Projects",
    "/projects/buddhist-bridges/people/P-0001/": "Projects",
    "/projects/hallyu-indian-press/": "Projects", "/projects/hallyu-indian-press/data/": "Projects",
}
RETIRED = {"/publications/": "/writing", "/visualizations/": "/method", "/contact/": "/about"}

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
    check(p.locator("header nav a").count() == 4, "nav has four items")
    # Retired routes keep working: GitHub Pages has no server redirects, so these are
    # meta-refresh stubs. Assert where they land rather than racing the refresh.
    for r, dest in RETIRED.items():
        p.goto(BASE + r)
        p.wait_for_url(f"**{dest}**", timeout=5000)
        check(p.url.endswith(dest) or dest in p.url, f"retired {r} lands on {dest}")
    errs = [e for e in b.errors if "no-such-page" not in e]
    check(errs == [], f"no console errors: {errs}")
