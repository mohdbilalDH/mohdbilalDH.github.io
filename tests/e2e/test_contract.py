# Every project resolves to the same three routes and the same five slots.
from _lib import Browser, BASE, check

SLUGS = ["janghan", "buddhist-bridges", "hallyu-indian-press"]

with Browser() as b:
    p = b.page()
    for slug in SLUGS:
        p.goto(f"{BASE}/projects/{slug}/")
        p.wait_for_load_state("networkidle")
        check(p.locator(".claim .chip--kind").count() == 1, f"{slug}: declares a kind")
        check(p.locator(".claim .chip--state").count() == 1, f"{slug}: declares a state")
        check(len(p.locator(".claim-q").inner_text().strip()) > 40, f"{slug}: states a question")
        check(p.locator(".claim-q").inner_text().strip().endswith("?"), f"{slug}: the question is a question")
        check(len(p.locator(".claim-f").inner_text().strip()) > 80, f"{slug}: states a finding")
        check(p.locator(".ko-summary summary").count() == 1, f"{slug}: has a Korean summary")
        # inner_text applies the CSS uppercase on .mark kickers; compare case-insensitively
        heads = [h.lower() for h in p.locator("section.section h2").all_inner_texts()]
        check(any("limits" in h for h in heads), f"{slug}: has a limits section")
        check(p.locator(f"a[href='/projects/{slug}/data/']").count() >= 1, f"{slug}: links to its data page")
        # argument pages carry at most one door onward
        check(p.locator("a.door").count() <= 1, f"{slug}: at most one explore door")

        p.goto(f"{BASE}/projects/{slug}/data/")
        p.wait_for_load_state("networkidle")
        check(p.locator("h1").inner_text().strip() == "Method and data", f"{slug}: data page")
        cite = p.locator(".cite").inner_text()
        check("accessed" in cite, f"{slug}: data page carries a citation with an accessed date")
        check("pending" not in p.locator("main").inner_text().lower(), f"{slug}: no pending-DOI placeholder")
    check(b.errors == [], f"no console errors: {b.errors}")
