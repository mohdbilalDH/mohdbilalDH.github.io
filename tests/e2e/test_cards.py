# The projects index is a DH project directory: every entry states its method, its span, its
# status, one line of scope and size, and its headline counts, over an image from its own material.
from _lib import Browser, BASE, check

with Browser() as b:
    for w, cols in [(1440, 2), (768, 2), (375, 1)]:
        p = b.page(w, 900)
        p.goto(BASE + "/projects/")
        p.wait_for_load_state("networkidle")
        cards = p.locator(".pcard")
        check(cards.count() == 3, f"{w}: three project entries")
        xs = p.evaluate("[...document.querySelectorAll('.card-row.cols-2 .pcard')].map(c => Math.round(c.getBoundingClientRect().left))")
        check(len(set(xs)) == cols, f"{w}: {cols} column(s) in the two-up row ({xs})")

        c = cards.first
        check(c.locator(".pcard-kind").text_content().strip() != "", f"{w}: entry names its method")
        check(c.locator(".pcard-dates").text_content().strip() != "", f"{w}: entry states its span")
        check(c.locator(".pcard-state").text_content().strip() != "", f"{w}: entry states its status")
        check(len(c.locator(".pcard-blurb").inner_text().strip()) > 80, f"{w}: entry has a scope line")
        counts = c.locator(".pcard-counts > div")
        check(counts.count() == 3, f"{w}: entry carries three headline counts")
        check(c.locator("h3.pcard-title a").count() == 1, f"{w}: title links to the project")
        check(c.locator("a.btn").inner_text().strip() == "View project", f"{w}: view-project affordance")

        # the image is the project's own material, served and sized
        for slug in ["janghan", "buddhist-bridges", "hallyu"]:
            r = p.request.get(BASE + f"/art/{slug}.png")
            check(r.status == 200 and len(r.body()) > 6000, f"{w}: art {slug} served")
        alt = c.locator(".pcard-art img").get_attribute("alt")
        check(alt and len(alt) > 60 and p.locator("h3.pcard-title").first.inner_text().strip()[:12] not in alt,
              f"{w}: card image alt describes the image, not the project ({alt!r})")

        # the single-card row reads as a feature above 900px
        feat = p.locator(".pcard--feature")
        check(feat.count() == 1, f"{w}: one feature entry")
        if w >= 900:
            box = feat.locator(".pcard-art").bounding_box()
            body = feat.locator(".pcard-body").bounding_box()
            check(abs(box["y"] - body["y"]) < 40, f"{w}: the feature lays image beside text")

        check(p.locator(".section-heading").first.text_content().strip() == "Digital editions and datasets",
              f"{w}: first section heading")
    check(b.errors == [], f"no console errors: {b.errors}")
    check(b.bad_requests() == [], f"no failed resource loads: {b.bad_requests()[:5]}")
