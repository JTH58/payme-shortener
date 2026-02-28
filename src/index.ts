import { Env } from "./types";
import { matchRoute } from "./router";
import { handleShorten } from "./handlers/shorten";
import { handleResolve, handleResolveApi } from "./handlers/resolve";
import { handleLanding } from "./handlers/landing";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
};

function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const route = matchRoute(request);

      let response: Response;

      switch (route.handler) {
        case "landing":
          response = handleLanding();
          break;
        case "shorten":
          response = await handleShorten(request, env);
          break;
        case "resolve":
          response = await handleResolve(route.params.shortCode, env);
          break;
        case "resolve-api":
          response = await handleResolveApi(request, env);
          break;
        case "cors-preflight":
          response = handleCorsPreflight(request);
          break;
        default:
          response = new Response("Not Found", { status: 404 });
      }

      return withSecurityHeaders(response);
    } catch {
      return withSecurityHeaders(
        new Response("Internal Server Error", { status: 500 })
      );
    }
  },
} satisfies ExportedHandler<Env>;

function handleCorsPreflight(request: Request): Response {
  const origin = request.headers.get("Origin") || "";
  const allowedOrigins = ["https://payme.tw", "https://www.payme.tw"];

  if (!allowedOrigins.includes(origin)) {
    return new Response(null, { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
