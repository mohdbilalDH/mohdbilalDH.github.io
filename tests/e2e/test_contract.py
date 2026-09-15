# Every project page carries the same identity, evidence and facts apparatus. The test asserts
# that apparatus exists and is populated — not that the prose is short. These are project pages,
# not articles, so there is a floor on substance and no ceiling.
from _lib import Browser, BASE, check

SLUGS = ["janghan", "buddhist-bridges", "hallyu-indian-press"]
MIN_PROSE = 900

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

        # --- identity ---
        check(p.locator(".phead-kind").count() == 1, f"{slug}: declares its kind and date span")
        check(p.locator("h1").count() == 1, f"{slug}: one h1")
        check(len(p.locator(".phead-sub").inner_text().strip()) > 20, f"{slug}: subtitle names the resource")
        cells = p.locator(".phead .scale-cell")
        check(cells.count() >= 5, f"{slug}: scale line has at least five counts ({cells.count()})")
        check(p.locator(".phead-status b").inner_text().strip() != "", f"{slug}: status stated")
        check("built" in p.locator(".phead-status").inner_text(), f"{slug}: build date in the header")
        check(p.locator(".ko-summary summary").count() == 1, f"{slug}: Korean summary present")

        # --- the exploration arc: question, then the interactive object, then evidence ---
        check(p.locator("nav.pnav a").count() >= 5, f"{slug}: in-page section navigation")
        rq = p.locator("section.rq .rq-body").inner_text().strip()
        check(rq.endswith("?") or "?" in rq, f"{slug}: the research question is a question")
        check(len(rq) > 60, f"{slug}: the question is stated in full")
        check(p.locator("section.rq .rq-status").count() == 1, f"{slug}: the question carries its status")
        order = p.evaluate("[...document.querySelectorAll('section[id]')].map(s => s.id).filter(id => ['question','explore','evidence','findings','limits','data'].includes(id))")
        check(order.index("question") < order.index("explore") < order.index("evidence"),
              f"{slug}: question precedes the interactive object, which precedes the evidence ({order})")
        check(order.index("evidence") < order.index("findings") < order.index("data"),
              f"{slug}: evidence precedes findings, which precede data ({order})")
        first_fig = p.evaluate("(() => { const f = document.querySelector('main figure.fig'); const e = document.getElementById('explore'); return !!(f && e && e.contains(f)); })()")
        check(first_fig, f"{slug}: the first figure sits inside the explore section, not at the bottom")

        # --- evidence ---
        figs = p.locator("main figure.fig")
        check(figs.count() >= 2, f"{slug}: at least two figures ({figs.count()})")
        titles = p.locator("main figure.fig .fig-title").count()
        check(titles == figs.count(), f"{slug}: every figure states its finding as a title")
        tables = p.locator("main figure.fig details.fig-table").count()
        check(tables == figs.count(), f"{slug}: every figure exposes its data as a table")
        words = p.evaluate(PROSE_JS)
        check(words >= MIN_PROSE, f"{slug}: substantive prose ({words} words, floor {MIN_PROSE})")

        # --- limits, always present, always before the facts block ---
        heads = [h.lower() for h in p.locator("section.section h2").all_inner_texts()]
        check(any("limits" in h for h in heads), f"{slug}: has a limits section")

        # --- facts block ---
        facts = p.locator("section.facts")
        check(facts.count() == 1, f"{slug}: project facts block")
        ftext = facts.inner_text().lower()
        for field in ["resources", "duration", "status", "version", "people", "licensing"]:
            check(field in ftext, f"{slug}: facts block states {field}")
        check(facts.locator(".reslist a").count() >= 2, f"{slug}: resources listed beside the page")
        cite = facts.locator(".cite").inner_text()
        check("accessed" in cite and "Bilal" in cite, f"{slug}: citation with accessed date")
        low = p.locator("main").inner_text().lower()
        for phrase in ["doi: pending", "doi pending", "pending zenodo", "will be made public", "returned go"]:
            check(phrase not in low, f"{slug}: no placeholder text — {phrase!r}")
        check(p.locator(f"a[href='/projects/{slug}/data/']").count() >= 1, f"{slug}: links to its data page")

        # A minted DOI must be a resolvable link everywhere the project cites itself, and a
        # project without one must say so rather than leaving the row blank.
        facts_html = facts.inner_html()
        if slug == "buddhist-bridges":
            check("10.5281/zenodo.22770860" in facts_html, f"{slug}: version DOI in the facts block")
            check("10.5281/zenodo.22770859" in facts_html, f"{slug}: concept DOI in the facts block")
            check('href="https://doi.org/10.5281/zenodo.22770860"' in facts_html, f"{slug}: version DOI is a link")
            check("zenodo.22770860" in cite, f"{slug}: the citation carries the DOI")
            check("v3.0.0" in cite, f"{slug}: the citation names the released version")
        else:
            check("No DOI has been minted" in facts.inner_text(), f"{slug}: states plainly that it has no DOI yet")

        # --- the data page still resolves and cites ---
        p.goto(f"{BASE}/projects/{slug}/data/")
        p.wait_for_load_state("networkidle")
        check(p.locator("h1").inner_text().strip() == "Method and data", f"{slug}: data page")
        check("accessed" in p.locator(".cite").inner_text(), f"{slug}: data page citation")
    check(b.errors == [], f"no console errors: {b.errors}")
    check(b.bad_requests() == [], f"no failed resource loads: {b.bad_requests()[:5]}")
