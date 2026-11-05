# The Hallyu events register's map instrument: it loads its data, clusters, filters by year and by
# organiser, searches by place, lists every record for the keyboard, keeps its state in the address,
# and renders on the explore page at full height. Runtime-injected markup is styled globally.
from _lib import Browser, BASE, check

with Browser() as b:
    p = b.page()
    p.goto(BASE + "/projects/hallyu-india-events/")
    p.wait_for_load_state("networkidle")
    p.wait_for_function("document.querySelector('.hm-status') && /mapped occurrences/.test(document.querySelector('.hm-status').textContent)", timeout=20000)
    status = p.locator(".hm-status").inner_text()
    check("of 577 mapped occurrences" in status, f"the register loaded in full ({status})")
    check(p.locator(".hm-clw").count() >= 5, f"records cluster at the India view ({p.locator('.hm-clw').count()})")
    # the base map is drawn from Natural Earth's India point-of-view release, and the land is actually visible
    check(p.locator(".leaflet-tile").count() == 0, "no tile server is used")
    india = p.locator("path.hm-land--in").first.bounding_box()
    check(india and india["width"] > 150 and india["height"] > 150, f"India is drawn at the India view ({india})")
    check(p.locator("path.hm-land").count() >= 10, "the neighbouring countries are drawn")
    check(p.locator(".hm-lbl--city").count() >= 4, "the busiest cities are named")
    check("Natural Earth" in p.locator(".leaflet-control-attribution").inner_text(), "the boundaries are attributed")
    check(p.locator(".hm-pill").count() >= 4, "the toolbar carries its four tools")
    check(p.locator("#map details.fig-table tbody tr").count() >= 30, "the figure's table lists every city")

    # legend opens, lists the six marks, and closes on Escape
    p.locator(".hm-pill[data-panel='legend']").click()
    check(p.locator(".hm-panel[aria-label='Legend']").is_visible(), "legend panel opens")
    sw = p.locator(".hm-panel[aria-label='Legend'] .hm-sw").first.bounding_box()
    check(sw and sw["width"] >= 12 and sw["height"] >= 12, f"legend swatches are rendered, not collapsed ({sw})")
    p.keyboard.press("Escape")
    check(p.locator(".hm-panel[aria-label='Legend']").is_hidden(), "Escape closes the panel")

    # a year alone, then the organiser filter, both reflected in the address
    p.locator(".hm-yr[data-year='2019']").click()
    check("for 2019;" in p.locator(".hm-status").inner_text(), "selecting a year narrows the map to it")
    check("from=2019" in p.url and "to=2019" in p.url, f"the year is in the address ({p.url})")
    p.locator(".hm-pill[data-panel='filters']").click()
    p.locator(".hm-radio input[value='commercial']").check()
    n = int(p.locator(".hm-status b").first.inner_text())
    check(0 < n < 20, f"commercial K-pop in 2019 is a small set ({n})")
    check("who=commercial" in p.url, "the organiser filter is in the address")
    p.locator(".hm-pill.hm-pill--ghost").click()
    check("of 577 mapped" in p.locator(".hm-status").inner_text() and "from=" not in p.url, "reset restores the default view and address")

    # search by place, keyboard-first
    p.locator(".hm-pill[data-panel='find']").click()
    p.keyboard.type("imph")
    p.wait_for_timeout(200)
    opts = p.locator(".hm-opt")
    check(opts.count() >= 2 and "Imphal" in opts.first.inner_text(), f"search finds the place ({opts.count()} matches)")
    p.keyboard.press("ArrowDown")
    p.keyboard.press("Enter")
    p.wait_for_timeout(1500)
    check(p.evaluate("document.querySelector('[data-hallyu-map]').hallyuMap.map.getZoom()") >= 10, "choosing a place zooms to it")

    # the list is the keyboard route: every record, each opening its full detail
    p.locator(".hm-pill[data-panel='list']").click()
    rows = p.locator(".hm-list tbody tr")
    check(rows.count() >= 100, f"the list carries the selection ({rows.count()} rows)")
    rows.first.locator("button").click()
    p.wait_for_timeout(300)
    check(p.locator(".hm-list .hm-detail .hm-rec h4").count() == 1, "a row opens its record with sources")
    check(p.locator(".hm-list .hm-detail .hm-rec-src a").count() >= 1, "the record cites at least one source")
    size = p.evaluate("getComputedStyle(document.querySelector('.hm-list .hm-detail .hm-rec h4')).fontFamily")
    check("Playfair" in size, f"the record panel is styled by the site's tokens ({size})")

    # a record link resolves on the explore page and opens that record
    e = b.page()
    e.goto(BASE + "/projects/hallyu-india-events/explore/?id=HI-2019-0066")
    e.wait_for_load_state("networkidle")
    e.wait_for_function("document.querySelector('.leaflet-popup .hm-rec')", timeout=20000)
    check("Diphu" in e.locator(".leaflet-popup .hm-rec").inner_text(), "the explore page opens the record named in the address")
    h = e.evaluate("document.querySelector('.hm-map').getBoundingClientRect().height")
    check(h >= 480, f"the explore map fills the viewport ({h}px)")
    check(e.locator("h1").inner_text().startswith("Hallyu Events in India"), "the sheet under the map names the project")

    # phone: the map comes first and nothing overflows
    m = b.page(375, 812)
    m.goto(BASE + "/projects/hallyu-india-events/")
    m.wait_for_load_state("networkidle")
    m.wait_for_function("document.querySelector('.hm-status') && /mapped/.test(document.querySelector('.hm-status').textContent)", timeout=20000)
    sw_, iw = m.evaluate("[document.documentElement.scrollWidth, window.innerWidth]")
    check(sw_ <= iw, f"no horizontal overflow at 375px ({sw_} <= {iw})")
    check(m.evaluate("document.querySelector('.hm-map').getBoundingClientRect().height") >= 400, "the map keeps its height on a phone")
    check(b.errors == [], f"no console errors: {b.errors}")
    check(b.bad_requests() == [], f"no failed resource loads: {b.bad_requests()[:5]}")
