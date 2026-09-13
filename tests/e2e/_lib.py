from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:4321"
ROUTES = ["/", "/about/", "/projects/", "/projects/janghan/", "/projects/buddhist-bridges/",
          "/projects/buddhist-bridges/explore/", "/projects/hallyu-indian-press/",
          "/publications/", "/visualizations/", "/cv/", "/contact/", "/no-such-page/"]


class Browser:
    def __enter__(self):
        self._p = sync_playwright().start()
        self.browser = self._p.chromium.launch()
        self.errors = []
        return self

    def page(self, width=1280, height=900):
        ctx = self.browser.new_context(viewport={"width": width, "height": height})
        pg = ctx.new_page()
        pg.on("console", lambda m: self.errors.append(f"{pg.url}: {m.text}") if m.type == "error" else None)
        pg.on("pageerror", lambda e: self.errors.append(f"{pg.url}: {e}"))
        return pg

    def __exit__(self, *a):
        self.browser.close()
        self._p.stop()


def check(cond, msg):
    if not cond:
        raise SystemExit(f"FAIL: {msg}")
    print(f"ok: {msg}")
