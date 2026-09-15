# The interactive figures added to the project pages must work, and must work from the keyboard.
from _lib import Browser, BASE, check

with Browser() as b:
    # --- 長恨: the corpus grid recolours and opens records ---
    p = b.page()
    p.goto(BASE + "/projects/janghan/")
    p.wait_for_load_state("networkidle")
    cells = p.locator(".cg-cell")
    check(cells.count() == 98, f"corpus grid has one cell per textual item ({cells.count()})")
    check(p.locator(".cg-mode").count() == 3, "three readings of the corpus")
    first = p.locator(".cg-cell").first
    bg = lambda: p.evaluate("getComputedStyle(document.querySelector('.cg-cell')).backgroundColor")
    a = bg()
    p.locator(".cg-mode[data-mode='witnesses']").click()
    check(bg() != a, "recolouring by witnesses changes the cells")
    check(p.locator("#cg-legend span").count() >= 4, "legend follows the mode")
    # the instrument opens on a real record rather than an empty panel
    primed = p.locator("#cg-detail .d-title").inner_text().strip()
    check(primed != "", "the grid opens showing a record")
    p.locator(".cg-cell").nth(6).focus()
    check(p.locator("#cg-detail .d-title").inner_text().strip() != primed, "focusing another cell changes the record")
    first.focus()
    href = p.locator("#cg-detail a").get_attribute("href")
    check(href.startswith("/janghan/item/"), "the record links into the edition")
    check(p.request.get(BASE + href).status == 200, f"that edition page exists ({href})")

    # the place locator is drawn from the coded evidence
    check(p.locator("#fig-places svg").count() == 1, "place locator rendered")
    check(p.locator("#fig-places details.fig-table tbody tr").count() >= 15, "every counted place is in the table")

    # --- Buddhist Bridges: the network slices switch and light ---
    n = b.page()
    n.goto(BASE + "/projects/buddhist-bridges/")
    n.wait_for_load_state("networkidle")
    check(n.locator(".nw-mode").count() == 2, "two period slices")
    check(n.locator("[data-panel='b2'] circle").count() == 9, "Koryŏ circle has nine records")
    check(n.locator("[data-panel='b6']").is_hidden(), "the modern web starts hidden")
    n.locator(".nw-mode[data-slice='b6']").click()
    check(n.locator("[data-panel='b6']").is_visible(), "switching shows the modern web")
    node = n.locator("[data-panel='b6'] .nw-node").first
    node.hover()
    check(n.locator(".nw-edge.lit").count() >= 1, "hovering a record lights its ties")
    check(n.locator("#silence svg").count() == 1, "the silence is drawn with its excluded candidates")
    check(n.locator("#silence details.fig-table tbody tr").count() >= 5, "excluded candidates are tabulated")

    # --- Hallyu: the print series and its annotations ---
    h = b.page()
    h.goto(BASE + "/projects/hallyu-indian-press/")
    h.wait_for_load_state("networkidle")
    txt = h.locator("#series").inner_text()
    for phrase in ["2018", "2017", "partial"]:
        check(phrase in txt, f"series figure annotates {phrase}")
    rows = h.locator("#series details.fig-table tbody tr")
    check(rows.count() == 22, f"series table has one row per year plus a total ({rows.count()})")
    check("4,796" in h.locator("main").inner_text() or "4796" in h.locator("main").inner_text(), "print total stated")
    # isolating a paper recomputes the stack without rescaling the axis
    shown = lambda: h.locator("#hs-total").inner_text()
    all_shown = shown()
    h.locator(".hs-toggle input[data-paper='TOI']").uncheck()
    check(shown() != all_shown, f"hiding a paper recomputes the total ({all_shown} -> {shown()})")
    top = h.evaluate("getComputedStyle(document.querySelector('#series svg')).height")
    h.locator(".hs-toggle input[data-paper='IE']").uncheck()
    # the last visible paper is refused rather than allowed to empty the chart, so click it
    # directly: uncheck() would throw on a state that deliberately does not change
    h.locator(".hs-toggle input[data-paper='HT']").click()
    check(h.locator(".hs-toggle input[data-paper='HT']").is_checked(), "the last visible paper cannot be hidden")
    check(h.evaluate("getComputedStyle(document.querySelector('#series svg')).height") == top, "the axis does not rescale")
    # the annotations describe whole-year totals, so they recede while a paper is hidden
    h.wait_for_timeout(350)  # let the 200ms opacity transition settle before measuring
    faded = h.evaluate("getComputedStyle(document.querySelector('.hs-anno')).opacity")
    check(float(faded) < 0.5, f"annotations recede on a partial selection ({faded})")
    h.locator(".hs-toggle input[data-paper='TOI']").check()
    h.locator(".hs-toggle input[data-paper='IE']").check()
    h.wait_for_timeout(350)
    check(float(h.evaluate("getComputedStyle(document.querySelector('.hs-anno')).opacity")) == 1.0,
          "annotations return when every paper is shown")
    check("all three papers" in h.locator("#hs-total").inner_text(), "the readout names the full selection")
    check(b.errors == [], f"no console errors: {b.errors}")

# Runtime-injected parts of the figures must actually be styled: Astro's scoped attribute never
# reaches elements written by a client script, so their rules have to be global.
with Browser() as b:
    p = b.page()
    p.goto(BASE + "/projects/janghan/")
    p.wait_for_load_state("networkidle")
    sw = p.locator("#cg-legend .sw").first
    box = sw.bounding_box()
    check(box and box["width"] >= 10 and box["height"] >= 10, f"legend swatches are rendered, not collapsed ({box})")
    p.locator(".cg-cell").first.focus()
    size = p.evaluate("getComputedStyle(document.querySelector('#cg-detail .d-title')).fontSize")
    check(float(size.replace("px", "")) >= 15, f"the record panel is styled ({size})")
    check(b.errors == [], f"no console errors: {b.errors}")
