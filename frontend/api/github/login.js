// /api/github/login.js
import crypto from "crypto";

export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;

  // Use your deployed Vercel URL
  const baseUrl = "https://smart-accident-detector.vercel.app";
  const redirectUri = `${baseUrl}/api/github/callback`;

  // Generate random state for CSRF protection
  const state = crypto.randomBytes(16).toString("hex");

  // Save state in cookie (HttpOnly & Secure)
  res.setHeader("Set-Cookie", [
    `gh_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Secure`
  ]);

  // Build GitHub authorize URL
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "read:user user:email",
    state
  });

  // Redirect user to GitHub login page
  res.writeHead(302, {
    Location: `https://github.com/login/oauth/authorize?${params.toString()}`
  });
  res.end();
}
