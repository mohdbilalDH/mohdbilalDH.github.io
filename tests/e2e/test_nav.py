from _lib import Browser, BASE, ROUTES, check

# Six nav items: Visualizations was retired because it duplicated material the projects
# already carry. Every project route marks Projects current, data and person pages included.
CURRENT = {
    "/": "Home", "/about/": "About", "/projects/": "Projects",
    "/publications/": "Publications", "/cv/": "CV", "/contact/": "Contact",
    "/projects/janghan/": "Projects", "/projects/janghan/data/": "Projects",
    "/projects/buddhist-bridges/": "Projects", "/projects/buddhist-bridges/explore/": "Projects",
    "/projects/buddhist-bridges/data/": "Projects",
    "/projects/buddhist-bridges/people/P-0001/": "Projects",
    "/projects/hallyu-indian-press/": "Projects", "/projects/hallyu-indian-press/data/": "Projects",
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
    check(p.locator("header nav a").count() == 6, "navigation has six items")
    labels = [a.strip() for a in p.locator("header nav a").all_text_contents()]
    check("Visualizations" not in labels, f"Visualizations is gone from the nav ({labels})")
    # the retired route still resolves, into the projects that carry its figures
    p.goto(BASE + "/visualizations/")
    p.wait_for_url("**/projects**", timeout=5000)
    check("/projects" in p.url, f"/visualizations/ lands on the projects index ({p.url})")
    errs = [e for e in b.errors if "no-such-page" not in e]
    check(errs == [], f"no console errors: {errs}")
