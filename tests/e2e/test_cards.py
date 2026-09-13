from _lib import Browser, BASE, check

with Browser() as b:
    for w, cols in [(1440, 2), (768, 2), (375, 1)]:
        p = b.page(w, 900)
        p.goto(BASE + "/projects/")
        p.wait_for_load_state("networkidle")
        cards = p.locator(".project-card")
        check(cards.count() == 3, f"{w}: three cards")
        xs = p.evaluate("[...document.querySelectorAll('.project-card')].map(c => Math.round(c.getBoundingClientRect().left))")
        check(len(set(xs)) == cols, f"{w}: {cols} column(s) ({xs})")
        c = cards.first
        check(c.locator(".card-year").inner_text().strip() != "", f"{w}: year label")
        check(c.locator("h3 a").count() == 1 and c.locator("a.btn").inner_text().strip() == "View project", f"{w}: title link + button")
        check(p.evaluate("getComputedStyle(document.querySelector('.project-card')).borderRadius") == "24px", f"{w}: 24px radius")
        for y in range(0, p.evaluate("document.body.scrollHeight"), 400):
            p.evaluate(f"window.scrollTo(0, {y})")
            p.wait_for_timeout(120)
        p.wait_for_timeout(900)
        check(p.evaluate("[...document.querySelectorAll('.fade-up')].every(e => e.classList.contains('is-in'))"), f"{w}: cards faded in")
        check(p.evaluate("document.querySelector('.section-heading').textContent.trim()") == "Digital editions and datasets", f"{w}: first section heading")
        for slug in ["janghan", "buddhist-bridges", "hallyu"]:
            r = p.request.get(BASE + f"/art/{slug}.png")
            check(r.status == 200 and len(r.body()) > 8000, f"{w}: art {slug} served")
    check(b.errors == [], f"no console errors: {b.errors}")
