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
    check(b.errors == [], f"no console errors: {b.errors}")
