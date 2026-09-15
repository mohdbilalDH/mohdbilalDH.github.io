# The projects index is a list, not a card wall: it must stay legible from three projects to eight.
from _lib import Browser, BASE, check

with Browser() as b:
    for w in (1440, 768, 375):
        p = b.page(w, 900)
        p.goto(BASE + "/projects/")
        p.wait_for_load_state("networkidle")
        items = p.locator(".pindex .pitem")
        check(items.count() == 3, f"{w}: three project entries")
        first = items.first
        check(first.locator(".chip--kind").text_content().strip() in ("Edition", "Argument", "Investigation"),
              f"{w}: first entry declares a kind")
        check(first.locator(".pitem-state").text_content().strip() != "", f"{w}: entry declares a state")
        check(first.locator(".pitem-dates").text_content().strip() != "", f"{w}: entry declares a date span")
        check(len(first.locator(".pitem-finding").text_content().strip()) > 60, f"{w}: entry states a finding")
        check(first.locator("h3.pitem-title a").count() == 1, f"{w}: title links to the project")
        # every entry is one full-width row at every width; no grid to collapse
        xs = p.evaluate("[...document.querySelectorAll('.pitem')].map(c => Math.round(c.getBoundingClientRect().left))")
        check(len(set(xs)) == 1, f"{w}: single column of rows ({xs})")
        check(p.locator(".kinds .kind-row").count() == 3, f"{w}: the three kinds are glossed")
        # the retired card-art pipeline must be gone
        check(p.request.get(BASE + "/art/janghan.png").status == 404, f"{w}: card art no longer served")
        check(p.locator(".project-card").count() == 0, f"{w}: no image cards")
    check(b.errors == [], f"no console errors: {b.errors}")
