import { Env } from "./types";

export interface RouteResult {
  handler: string;
  params: Record<string, string>;
}

export function matchRoute(request: Request): RouteResult {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  if (method === "OPTIONS" && (path === "/api/shorten" || path === "/api/resolve")) {
    return { handler: "cors-preflight", params: {} };
  }

  if (method === "GET" && path === "/") {
    return { handler: "landing", params: {} };
  }

  if (method === "POST" && path === "/api/shorten") {
    return { handler: "shorten", params: {} };
  }

  if (method === "POST" && path === "/api/resolve") {
    return { handler: "resolve-api", params: {} };
  }

  if (method === "GET" && /^\/[0-9A-Za-z]{4}$/.test(path)) {
    return { handler: "resolve", params: { shortCode: path.slice(1) } };
  }

  return { handler: "not-found", params: {} };
}
