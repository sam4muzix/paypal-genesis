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
      title: "PayPal GENESIS | From Product Ideas to Reality | AI + PayPal Hackathon Demo",
      description: `What if the products we need could begin with the people who imagine them?

PayPal GENESIS connects consumers and manufacturers through a simple product development journey.

Consumers can share product ideas, use GENESIS Intelligence to organize requirements, support ideas they want, and report problems with existing products.

Manufacturers can discover customer demand, propose products, track development, and respond to feedback.

PayPal Sandbox enables a verified demonstration checkout experience.

Created by Sam.

Built for the PayPal AI Hackathon.

Explore GENESIS:
https://genesis.greenmixlabs.com

This demonstration uses PayPal Sandbox. No live-money transaction is represented.`,
      tags: ["PayPal", "AI Hackathon", "PayPal GENESIS", "GENESIS Intelligence", "Consumer Electronics", "Crowd Manufacturing"],
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
  console.log(`SUCCESS! Watch URL: https://www.youtube.com/watch?v=${uploadResult.id}`);
}

upload().catch(err => {
  console.error("Upload error:", err);
  process.exit(1);
});

