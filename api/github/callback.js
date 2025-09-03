// /api/github/callback.js
export default async function handler(req, res) {
  try {
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const redirectUri = `${baseUrl}/api/github/callback`;

    const { code, state } = req.query || {};

    // Verify state cookie
    const cookies = parseCookies(req.headers.cookie || "");
    const savedState = cookies["gh_oauth_state"];
    if (!code || !state || state !== savedState) {
      return res.status(400).send("Invalid state or code");
    }

    // Exchange code for token
    const tokenResp = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        state
      })
    });

    const tokenJson = await tokenResp.json();
    if (!tokenJson.access_token) {
      return res.status(400).send("Failed to obtain access token");
    }

    // Fetch user profile
    const userResp = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenJson.access_token}`,
        "User-Agent": "smart-accident-detector"
      }
    });
    const user = await userResp.json();

    // Fetch user email
    const emailResp = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${tokenJson.access_token}`,
        "User-Agent": "smart-accident-detector"
      }
    });
    const emails = await emailResp.json();
    const primaryEmail = Array.isArray(emails)
      ? emails.find((e) => e.primary)?.email || emails[0]?.email
      : undefined;

    // Save user info in cookie
    const userCookie = Buffer.from(
      JSON.stringify({
        id: user.id,
        login: user.login,
        name: user.name,
        avatar: user.avatar_url,
        email: primaryEmail
      })
    ).toString("base64");

    res.setHeader("Set-Cookie", [
      `gh_user=${userCookie}; Path=/; SameSite=Lax; Secure`
    ]);

    // Redirect to base.html in your repo
    res.writeHead(302, { Location: "/base.html" });
    return res.end();
  } catch (err) {
    console.error("GitHub callback error", err);
    res.status(500).send("GitHub OAuth failed");
  }
}

function parseCookies(cookieHeader) {
  return cookieHeader
    .split(";")
    .map((v) => v.trim())
    .filter(Boolean)
    .reduce((acc, pair) => {
      const idx = pair.indexOf("=");
      if (idx === -1) return acc;
      const key = decodeURIComponent(pair.slice(0, idx).trim());
      const val = decodeURIComponent(pair.slice(idx + 1).trim());
      acc[key] = val;
      return acc;
    }, {});
}
