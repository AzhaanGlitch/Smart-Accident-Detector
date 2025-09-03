// /api/github/login.js
import crypto from "crypto";

export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;

  // Always use your deployed URL in production
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/github/callback`;

  // Generate random state
  const state = crypto.randomBytes(16).toString("hex");

  // Save state in cookie
  res.setHeader("Set-Cookie", [
    `gh_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Secure`
  ]);

  // GitHub authorize URL
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "read:user user:email",
    state
  });

  res.writeHead(302, {
    Location: `https://github.com/login/oauth/authorize?${params.toString()}`
  });
  res.end();
}
