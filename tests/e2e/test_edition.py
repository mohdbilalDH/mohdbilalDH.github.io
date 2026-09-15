# The 長恨 edition must not look or behave like a second website.
from _lib import Browser, BASE, check

with Browser() as b:
    p = b.page()
    p.goto(BASE + "/janghan/")
    p.wait_for_load_state("networkidle")
    check(p.locator("nav.site a").count() == 5, "edition nav has five items")
    labels = [a.strip() for a in p.locator("nav.site a").all_text_contents()]
    check(labels == ["The Magazine", "Contents", "Contributors", "Places", "Method & Data"], f"edition nav labels: {labels}")
    fam = p.evaluate("getComputedStyle(document.body).fontFamily")
    check(fam.startswith('"Mulish Variable"'), f"edition inherits the site body face ({fam})")
    h = p.evaluate("getComputedStyle(document.querySelector('h1, .hero h2')).fontFamily")
    check("Playfair" in h, f"edition inherits the site display face ({h})")
    check(p.request.get(BASE + "/janghan/voices.html").status == 404, "the Language page is retired")

    # a record page carries a citation
    r = b.page()
    r.goto(BASE + "/janghan/item/jh01.a01.html")
    r.wait_for_load_state("networkidle")
    check(r.locator(".recordcite").count() == 1, "item page carries a citation")
    cite = r.locator(".recordcite").inner_text()
    check("jh01.a01" in cite and "accessed" in cite, "citation names the record and the access date")
    check(r.locator("nav.site a").count() == 5, "record page nav also five items")

    # contents exposes the views that left the nav
    c = b.page()
    c.goto(BASE + "/janghan/contents.html")
    c.wait_for_load_state("networkidle")
    check(c.locator(".relviews a").count() >= 4, "contents links the related views")
    check(c.locator(".relviews a[href*='witnesses']").count() == 1, "witnesses reachable from contents")

    # the edition is findable
    s = p.request.get(BASE + "/janghan/sitemap.xml")
    check(s.status == 200 and s.text().count("<loc>") > 150, "edition sitemap lists its pages")
    rb = p.request.get(BASE + "/robots.txt")
    check("janghan/sitemap.xml" in rb.text(), "robots.txt points at the edition sitemap")
    check(b.errors == [], f"no console errors: {b.errors}")
