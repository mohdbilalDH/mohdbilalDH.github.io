from _lib import Browser, BASE, check

with Browser() as b:
    p = b.page()
    p.goto(BASE + "/cv/")
    p.wait_for_load_state("networkidle")
    check(p.locator("a.btn--primary[href='/files/mohd-bilal-cv.pdf'][download]").count() == 1, "one primary download button")
    check(p.locator("a.btn--primary").count() == 1, "exactly one primary button on the page")
    r = p.request.get(BASE + "/files/mohd-bilal-cv.pdf")
    check(r.status == 200 and r.headers.get("content-type", "").startswith("application/pdf"), "PDF served")
    txt = p.locator("main").inner_text()
    for s in ["Research profile", "Education", "Publications", "Conference presentations", "Academic training",
              "Awards", "Languages", "Relic, Axis, and Adaptation", "Jawaharlal Nehru University"]:
        check(s in txt, f"CV contains {s}")
    check("Khan" not in txt, "no Khan")

    # Awards and fellowships sit immediately before publications.
    heads = [h.strip() for h in p.locator("main h2").all_inner_texts()]
    check(heads.index("Awards & fellowships") + 1 == heads.index("Publications"),
          f"awards immediately before publications: {heads}")
    # The two corrected affiliations.
    check("Graduate School of Korean Studies, The Academy of Korean Studies" in txt,
          "current affiliation is the Graduate School of Korean Studies")
    check("Graduate School of International Studies (GSIS)" in txt, "exchange year is SNU GSIS")
    # The withdrawn paper, and the heading it sat under, are gone.
    check("Under review" not in txt and "Remakes and Adaptations" not in txt, "no under-review paper")
    # The 2026 Chungbuk conference is listed.
    check("Framing Heritage: A Digital Humanities Analysis" in txt
          and "2026 Global K-culture Conference" in txt
          and "August 20\u201322, 2026" in txt, "2026 Global K-culture Conference listed")
    check(b.errors == [], f"no console errors: {b.errors}")
