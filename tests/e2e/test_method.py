# The method page is the connective tissue of the portfolio and replaces the figure gallery.
from _lib import Browser, BASE, check

with Browser() as b:
    p = b.page()
    p.goto(BASE + "/method/")
    p.wait_for_load_state("networkidle")
    check(p.locator("h1").inner_text().strip() == "Method", "method page title")
    check(p.locator(".grammar .g-row").count() == 4, "four marks in the uncertainty grammar")
    check(p.locator(".grammar svg").count() == 4, "every mark is drawn, not described")
    text = p.locator("main").inner_text()
    for term in ["McCune-Reischauer", "kisaeng", "Chosŏn", "documented negatives", "Endings"]:
        check(term in text, f"method page states: {term}")
    check("10.5281/zenodo.14192758" in p.content(), "the uncertainty-gap survey is cited")
    check(p.locator("header nav a[aria-current='page']").text_content().strip() == "Method", "Method is current")
    check(b.errors == [], f"no console errors: {b.errors}")
