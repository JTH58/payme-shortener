import { renderLandingPage } from "../templates/landing";

export function handleLanding(): Response {
  return new Response(renderLandingPage(), {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
