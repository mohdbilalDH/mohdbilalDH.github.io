# Person records are pages, not modals: linkable, citable and indexable.
from _lib import Browser, BASE, check

with Browser() as b:
    p = b.page()
    p.goto(BASE + "/projects/buddhist-bridges/people/P-0001/")
    p.wait_for_load_state("networkidle")
    check(p.locator("h1").inner_text().strip().startswith("Hyech'o"), "person page names the mediator")
    check(p.locator(".ident").inner_text().strip().startswith("P-0001"), "record id on the page")
    check(p.locator(".rec dt").count() >= 6, "record fields rendered")
    check(p.locator(".srclist li").count() >= 5, "sources listed with the record")
    check(p.locator(".ap b").inner_text().strip().lower().startswith("reading the grades"), "confidence legend beside the grades")
    cite = p.locator(".cite").inner_text()
    check("P-0001" in cite and "accessed" in cite, "citation string with accessed date")
    check(p.locator(".sideways a").count() >= 2, "sideways links into the rest of the record")
    check(p.evaluate("document.querySelectorAll('dialog#person-dialog').length") == 0, "no person dialog anywhere")

    # the register links to the page
    r = b.page()
    r.goto(BASE + "/projects/buddhist-bridges/explore/")
    r.wait_for_load_state("networkidle")
    href = r.locator(".reg-row .name a").first.get_attribute("href")
    check(href.startswith("/projects/buddhist-bridges/people/"), "register name links to the person page")

    # the argument page keeps its chronology and links into records
    a = b.page()
    a.goto(BASE + "/projects/buddhist-bridges/")
    a.wait_for_load_state("networkidle")
    check(a.locator("figure").count() >= 4, "figures on the argument page")
    check(a.locator("a[href^='/projects/buddhist-bridges/people/']").count() >= 2, "prose links to person pages")
    a.locator("button.era-tab[data-era='B2']").click()
    check(a.locator("#era-panel svg g.life").count() >= 1, "era panel renders lifelines")
    check(b.errors == [], f"no console errors: {b.errors}")
