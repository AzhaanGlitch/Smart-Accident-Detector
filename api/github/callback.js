// /api/github/callback.js
import fetch from "node-fetch";
import cookie from "cookie";

export default async function handler(req, res) {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).send("Missing code or state from GitHub");
  }

  // Parse cookies to verify state
  const cookies = cookie.parse(req.headers.cookie || "");
  const savedState = cookies.gh_oauth_state;

  if (!savedState || savedState !== state) {
    return res.status(400).send("Invalid state, potential CSRF attack");
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: "https://smart-accident-detector.vercel.app/api/github/callback",
        state
      })
    });

    const data = await tokenResponse.json();

    if (data.error) {
      return res.status(400).send(`Error fetching access token: ${data.error_description}`);
    }

    const accessToken = data.access_token;

    // Optional: fetch GitHub user info
    const userResponse = await fetch("https://api.github.com/user", {
      headers: { Authorization: `token ${accessToken}` }
    });
    const user = await userResponse.json();
    console.log("GitHub user info:", user);

    // Clear the state cookie after successful login
    res.setHeader("Set-Cookie", "gh_oauth_state=; Path=/; HttpOnly; Secure; Max-Age=0");

    // Redirect to your main page after login
    res.redirect("/base.html");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
}
