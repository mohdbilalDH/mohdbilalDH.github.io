// Build stamp. Endings Principles: a release identifier and a build date on every page.
export const buildDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'long', year: 'numeric',
}).format(new Date());
export const buildISO = new Date().toISOString().slice(0, 10);
