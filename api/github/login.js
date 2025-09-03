// /api/github/login.js
export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const baseUrl = process.env.BASE_URL || `http://${req.headers.host}`;

  // generate a random state string
  const state = cryptoRandomString(24);

  // set state cookie (HttpOnly for CSRF protection)
  const cookieOptions = [
    `gh_oauth_state=${state}`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`
  ];
  if (baseUrl.startsWith('https')) cookieOptions.push('Secure');

  res.setHeader('Set-Cookie', cookieOptions.join('; '));

  const redirectUri = `${baseUrl}/api/github/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'read:user user:email',
    state
  });

  const githubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
  res.writeHead(302, { Location: githubAuthUrl });
  res.end();
}

function cryptoRandomString(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  const r = cryptoGet();
  for (let i = 0; i < length; i++) out += chars[Math.floor(r() * chars.length)];
  return out;
}

function cryptoGet() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    return () => {
      const arr = new Uint32Array(1);
      crypto.getRandomValues(arr);
      return arr[0] / (0xffffffff + 1);
    };
  }
  return () => Math.random();
}
