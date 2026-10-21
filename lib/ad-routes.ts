export function isGameOrFinderPath(pathname: string) {
  const route = pathname.replace(/^\/de(?=\/|$)/, "").replace(/\/+$/, "") || "/";
  return route === "/" || route === "/wordle-hilfe" ||
    /^\/wordle-(?:[3-9]|10|11)-buchstaben(?:-mit-umlauten)?$/.test(route) ||
    /^\/wordle-hilfe-(?:[3-9]|10|11)-buchstaben$/.test(route);
}
