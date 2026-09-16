# The Korean CV mirrors the English one: same sections in the same order, same entries, and
# publication and presentation titles left in the language they were published in.
from _lib import Browser, BASE, check

SECTIONS = ["연구 개요", "학력", "연구 및 실무 경력", "수상 및 장학",
            "논문", "학술대회 발표", "학술 연수", "학회 활동", "언어"]

with Browser() as b:
    p = b.page()

    # The English CV links to it, and not as a second primary button.
    p.goto(BASE + "/cv/")
    p.wait_for_load_state("networkidle")
    link = p.locator("a[href='/cv/ko/']")
    check(link.count() == 1, "the English CV links to the Korean one")
    check("btn--primary" not in (link.get_attribute("class") or ""), "the Korean CV link is not a second primary button")

    p.goto(BASE + "/cv/ko/")
    p.wait_for_load_state("networkidle")
    check(p.title() == "이력서 · Mohd Bilal", "Korean CV title")
    check(p.locator("div.wrap[lang='ko']").count() == 1, "the Korean content region declares lang=ko")

    heads = [h.strip() for h in p.locator("main h2").all_inner_texts()]
    check(heads == SECTIONS, f"sections in the agreed order: {heads}")

    txt = p.locator("main").inner_text()
    # Awards sit immediately before publications, as on the English CV. Compare headings, not raw
    # page text: "논문" also occurs inside an earlier job description.
    check(heads.index("수상 및 장학") + 1 == heads.index("논문"),
          f"awards immediately before publications: {heads}")
    # The corrected affiliations, in Korean.
    check("한국학중앙연구원 한국학대학원" in txt, "affiliation is the Graduate School of Korean Studies")
    check("국제대학원(GSIS)" in txt and "서울대학교" in txt, "exchange year is SNU GSIS")
    # Every entry in the English record has a Korean counterpart.
    check(p.locator(".cv-item").count() >= 27, f"all entries present ({p.locator('.cv-item').count()})")
    # Titles are not translated, and dates are.
    check("Framing Heritage: A Digital Humanities Analysis" in txt, "titles stay in the published language")
    check("2026년 8월 20–22일" in txt, "conference dates rendered in Korean, day range kept")
    check("모드 빌랄" in txt and "Mohd Bilal" in txt, "name in both scripts")
    check("Khan" not in txt, "no Khan")
    # The withdrawn paper is gone from this surface too.
    check("Remakes and Adaptations" not in txt and "심사 중" not in txt, "no under-review paper")
    check(b.errors == [], f"no console errors: {b.errors}")
    check(b.bad_requests() == [], f"no failed loads: {b.bad_requests()}")
