from _lib import Browser, BASE, check

with Browser() as b:
    p = b.page()
    p.goto(BASE + "/")
    p.wait_for_load_state("networkidle")
    check(p.title() == "Mohd Bilal — Korean Studies & Digital Humanities", "home title")
    check(p.locator("h1").inner_text().strip() == "Mohd Bilal", "display name h1")
    check(p.locator("a.btn--primary[href='/projects/']").count() == 1, "primary action to projects")
    check(p.locator("a.btn--secondary[href='/files/mohd-bilal-cv.pdf'][download]").count() == 1, "CV download action")
    check(p.locator("header nav a[aria-current='page']").count() == 0, "home has no current nav item")
    check(p.locator("main .prose p").count() >= 3, "bio paragraphs rendered")
    check(p.locator(".project-table tbody tr").count() == 3, "three project rows on home")
    check("Relic, Axis, and Adaptation" in p.locator("main").inner_text(), "forthcoming article in Recent")
    check(b.errors == [], f"no console errors: {b.errors}")
