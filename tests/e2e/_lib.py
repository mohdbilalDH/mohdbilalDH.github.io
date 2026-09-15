from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:4321"
ROUTES = ["/", "/about/", "/projects/", "/publications/", "/visualizations/", "/cv/", "/contact/",
          "/projects/janghan/", "/projects/janghan/data/",
          "/projects/buddhist-bridges/", "/projects/buddhist-bridges/explore/",
          "/projects/buddhist-bridges/data/", "/projects/buddhist-bridges/people/P-0001/",
          "/projects/hallyu-indian-press/", "/projects/hallyu-indian-press/data/",
          "/no-such-page/"]


class Browser:
    def __enter__(self):
        self._p = sync_playwright().start()
        self.browser = self._p.chromium.launch()
        self.errors = []
        self.http_errors = []
        return self

    def page(self, width=1280, height=900):
        ctx = self.browser.new_context(viewport={"width": width, "height": height})
        pg = ctx.new_page()

        # Failed resource loads are recorded from the response event, where the URL is always
        # the failing resource. The matching console message carries no reliable URL — it is
        # delivered late and can be attributed to whichever page is current by then — so it is
        # dropped here and asserted on through http_errors instead.
        def on_console(m):
            if m.type != "error":
                return
            if "Failed to load resource" in m.text:
                return
            src = (m.location or {}).get("url") or pg.url
            self.errors.append(f"{src}: {m.text}")

        pg.on("console", on_console)
        pg.on("pageerror", lambda e: self.errors.append(f"{pg.url}: {e}"))
        pg.on("response", lambda r: self.http_errors.append(f"{r.status} {r.url}") if r.status >= 400 else None)
        return pg

    def bad_requests(self, ignore=("/no-such-page/",)):
        """Failed resource loads, minus the routes a test deliberately asks for."""
        return [e for e in self.http_errors if not any(i in e for i in ignore)]

    def __exit__(self, *a):
        self.browser.close()
        self._p.stop()


def check(cond, msg):
    if not cond:
        raise SystemExit(f"FAIL: {msg}")
    print(f"ok: {msg}")
