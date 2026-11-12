import fs from "node:fs";
import path from "node:path";

const secretPath = "/Users/shyamlraj/Downloads/PPGEN/client_secret_840030834648-ih22fndcl9g5qt9ihnoiavgdn7var7sr.apps.googleusercontent.com.json";
const tokensPath = "/Users/shyamlraj/Downloads/PPGEN/youtube_tokens.json";
const videoPath = "/Users/shyamlraj/Downloads/PPGEN/paypal-genesis/submission/PayPal_GENESIS_Explainer_Final.mp4";

async function getValidAccessToken() {
  const secret = JSON.parse(fs.readFileSync(secretPath, "utf8")).installed;
  const tokens = JSON.parse(fs.readFileSync(tokensPath, "utf8"));

  if (tokens.refresh_token) {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: secret.client_id,
        client_secret: secret.client_secret,
        refresh_token: tokens.refresh_token,
        grant_type: "refresh_token"
      })
    });
    const refreshed = await res.json();
    if (refreshed.access_token) {
      tokens.access_token = refreshed.access_token;
      fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));
      return refreshed.access_token;
    }
  }
  return tokens.access_token;
}

async function upload() {
  if (!fs.existsSync(tokensPath)) {
    console.error("Missing youtube_tokens.json. Authorize via browser first.");
    process.exit(1);
  }

  const token = await getValidAccessToken();

  // 1. Verify channel name
  const channelRes = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const channelData = await channelRes.json();
  const channelTitle = channelData.items?.[0]?.snippet?.title;
  console.log("Authenticated YouTube Channel:", channelTitle);

  // 2. Prepare upload metadata
  const metadata = {
    snippet: {
      title: "PayPal GENESIS | From Consumer Ideas to Real Products | PayPal AI Hackathon 2026",
      description: `PayPal GENESIS is an AI-powered, consumer-led product innovation platform.

Consumers propose products they wish existed. GENESIS Intelligence transforms those ideas into structured product specifications. Community interest helps manufacturers discover opportunities, while AG Grid and AG Studio provide interactive demand intelligence.

Manufacturers can evaluate opportunities, publish offers, and manage product development.

PayPal Orders API v2 powers a verified Sandbox checkout experience.

Built independently by Sam.

Live application:
https://genesis.greenmixlabs.com

Technologies:
PayPal Developer Platform, Google Gemini API, AG Grid, AG Studio, Cloudflare Workers, Cloudflare D1, JavaScript.

Hackathon: PayPal AI Hackathon 2026

Products should begin with people.`,
      tags: ["PayPal", "AI Hackathon", "PayPal AI Hackathon 2026", "PayPal GENESIS", "GENESIS Intelligence", "AG Grid", "AG Studio", "Google Gemini API"],
      categoryId: "28", // Science & Technology
      defaultLanguage: "en"
    },
    status: {
      privacyStatus: "public",
      selfDeclaredMadeForKids: false
    }
  };

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;

  console.log(`Initiating resumable upload for ${videoPath} (${(fileSize / (1024 * 1024)).toFixed(2)} MB)...`);

  const initRes = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Length": String(fileSize),
      "X-Upload-Content-Type": "video/mp4"
    },
    body: JSON.stringify(metadata)
  });

  if (!initRes.ok) {
    console.error("Failed to initiate upload:", initRes.status, await initRes.text());
    process.exit(1);
  }

  const uploadUrl = initRes.headers.get("location");
  console.log("Resumable upload URL obtained. Uploading file binary stream...");

  const fileStream = fs.createReadStream(videoPath);

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Length": String(fileSize),
      "Content-Type": "video/mp4"
    },
    body: fs.readFileSync(videoPath),
    duplex: "half"
  });

  const uploadResult = await putRes.json();
  console.log("Upload result:", JSON.stringify(uploadResult, null, 2));
  const thumbPath = "/Users/shyamlraj/Downloads/PPGEN/paypal-genesis/submission/PayPal_GENESIS_Official_Thumbnail.png";
  if (uploadResult.id && fs.existsSync(thumbPath)) {
    const thumbBuf = fs.readFileSync(thumbPath);
    const thumbRes = await fetch(`https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${uploadResult.id}&uploadType=media`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "image/png",
        "Content-Length": String(thumbBuf.length)
      },
      body: thumbBuf
    });
    console.log("Thumbnail set status:", thumbRes.status);
  }
  console.log(`SUCCESS! Watch URL: https://www.youtube.com/watch?v=${uploadResult.id}`);
}

upload().catch(err => {
  console.error("Upload error:", err);
  process.exit(1);
});

