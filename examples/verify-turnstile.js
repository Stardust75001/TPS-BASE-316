// Example: verify Cloudflare Turnstile token on the server (Node.js)
// Usage: set TURNSTILE_SECRET_KEY in your environment (.env or process env)

const fetch = require("node-fetch"); // npm i node-fetch@2
require("dotenv").config();

async function verifyToken(token) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) throw new Error("TURNSTILE_SECRET_KEY not set");

  const params = new URLSearchParams();
  params.append("secret", secret);
  params.append("response", token);

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: params,
    }
  );

  const data = await res.json();
  return data; // contains "success": true/false and other info
}

// Example usage
(async () => {
  try {
    const sampleToken = "PASTE_TOKEN_HERE";
    const result = await verifyToken(sampleToken);
    console.log("Verify result", result);
  } catch (err) {
    console.error(err);
  }
})();
