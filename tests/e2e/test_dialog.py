from _lib import Browser, BASE, check

with Browser() as b:
    p = b.page()
    p.goto(BASE + "/projects/buddhist-bridges/")
    p.wait_for_load_state("networkidle")
    btn = p.locator("button[data-person]").first
    btn.focus()
    btn.press("Enter")
    d = p.locator("dialog#person-dialog")
    check(p.evaluate("document.getElementById('person-dialog').open"), "dialog opens")
    check(d.locator("#person-dialog-title").inner_text().strip() != "", "record has a name")
    check(d.locator("button.close").inner_text().strip() == "Close", "Close button")
    p.keyboard.press("Escape")
    check(not p.evaluate("document.getElementById('person-dialog').open"), "Escape closes")
    check(p.evaluate("document.activeElement === document.querySelector('button[data-person]')"), "focus returns to opener")
    check(p.locator("figure").count() >= 4, "figures on the project page")
    # era tab in the chronology opens a panel with lifelines
    p.locator("button.era-tab[data-era='B2']").click()
    check(p.locator("#era-panel svg g.life").count() >= 1, "era panel renders lifelines")
    p.locator("#era-panel svg g.life").first.click()
    check(p.evaluate("document.getElementById('person-dialog').open"), "lifeline opens record")
    p.locator("dialog#person-dialog button.close").click()
    check(b.errors == [], f"no console errors: {b.errors}")
