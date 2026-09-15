# Every project resolves to the same three routes and the same five slots.
from _lib import Browser, BASE, check

SLUGS = ["janghan", "buddhist-bridges", "hallyu-indian-press"]

# The contract's budget, enforced rather than aspirational: prose only, excluding figure
# captions and the data tables underneath them, which belong to the figures.
PROSE_MIN, PROSE_MAX = 700, 1000
# Measured on the live DOM, not a clone: innerText on a detached node ignores rendering and
# would count collapsed data tables and hidden instrument panels as prose.
PROSE_JS = """
(() => {
  const words = (t) => (t && t.trim()) ? t.trim().split(/\\s+/).length : 0;
  const main = document.querySelector('main');
  let figs = 0;
  main.querySelectorAll('figure').forEach((f) => { figs += words(f.innerText); });
  return words(main.innerText) - figs;
})()
"""

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
        words = p.evaluate(PROSE_JS)
        check(PROSE_MIN <= words <= PROSE_MAX, f"{slug}: prose within budget ({words} words, {PROSE_MIN}-{PROSE_MAX})")
        check(p.locator("main figure").count() <= 4, f"{slug}: at most four figures")

        p.goto(f"{BASE}/projects/{slug}/data/")
        p.wait_for_load_state("networkidle")
        check(p.locator("h1").inner_text().strip() == "Method and data", f"{slug}: data page")
        cite = p.locator(".cite").inner_text()
        check("accessed" in cite, f"{slug}: data page carries a citation with an accessed date")
        check("pending" not in p.locator("main").inner_text().lower(), f"{slug}: no pending-DOI placeholder")
    check(b.errors == [], f"no console errors: {b.errors}")
