// /api/github/login.js
import crypto from "crypto";

export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const baseUrl = process.env.BASE_URL || `https://${req.headers.host}`;
  const redirectUri = `${baseUrl}/api/github/callback`;

  // generate a random state string
  const state = crypto.randomBytes(16).toString("hex");

  // set state cookie (HttpOnly for CSRF protection)
  const cookieOptions = [
    `gh_oauth_state=${state}`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`
  ];
  if (baseUrl.startsWith("https")) cookieOptions.push("Secure");

  res.setHeader("Set-Cookie", cookieOptions.join("; "));

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "read:user user:email",
    state
  });

  const githubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
  res.writeHead(302, { Location: githubAuthUrl });
  res.end();
}
