import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { FILM_DIR, ROOT_DIR } from "./lib.mjs";

const SUBMISSION_DIR = path.resolve(ROOT_DIR, "submission");

async function main() {
  console.log("=== REMOTION FILM RENDER PIPELINE ===");

  const entryPoint = path.resolve(FILM_DIR, "src/index.ts");
  console.log("Bundling Remotion project:", entryPoint);

  const bundleLocation = await bundle({
    entryPoint,
    webpackOverride: (config) => ({
      ...config,
      resolve: {
        ...config.resolve,
        extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
      },
    }),
  });
  console.log("Bundled at:", bundleLocation);

  const compositionId = "GenesisExplainer";
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: compositionId,
  });

  console.log(`Rendering ${compositionId}: ${composition.width}x${composition.height} @ ${composition.fps}fps, ${composition.durationInFrames} frames (${(composition.durationInFrames / composition.fps).toFixed(2)}s)`);

  const rawOut = path.resolve(FILM_DIR, "public/raw_render.mp4");
  if (fs.existsSync(rawOut)) fs.unlinkSync(rawOut);

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: rawOut,
    crf: 18,
    imageFormat: "jpeg",
    pixelFormat: "yuv420p",
    concurrency: 2,
    timeoutInMilliseconds: 120000,
    offthreadVideoCacheSizeInBytes: 512 * 1024 * 1024,
    onProgress: ({ renderedFrames, encodedFrames }) => {
      if (renderedFrames % 150 === 0 || renderedFrames === composition.durationInFrames) {
        process.stdout.write(`Render: ${renderedFrames}/${composition.durationInFrames} | Encode: ${encodedFrames}/${composition.durationInFrames}\r`);
      }
    },
  });
  console.log("\nRaw video rendered:", rawOut);

  // Post-process with FFmpeg: loudnorm I=-16, TP=-1.5, LRA=7, AAC 48kHz, voice only (no music)
  const finalOut = path.resolve(SUBMISSION_DIR, "PayPal_GENESIS_Explainer_Final.mp4");
  console.log("Post-processing audio to broadcast loudness standard (-16 LUFS):", finalOut);

  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-i", rawOut,
      "-c:v", "copy",
      "-af", "loudnorm=I=-16:TP=-1.5:LRA=7",
      "-c:a", "aac",
      "-b:a", "192k",
      "-ar", "48000",
      "-movflags", "+faststart",
      finalOut,
    ],
    { stdio: "inherit" }
  );

  console.log("Final submission video created:", finalOut);

  // Probe output
  const probe = execFileSync("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration,size,bit_rate:stream=codec_name,width,height,r_frame_rate,channels,sample_rate",
    "-of", "json",
    finalOut,
  ], { encoding: "utf8" });

  console.log("FFprobe summary:\n", probe);
}

main().catch((err) => {
  console.error("Render failed:", err);
  process.exit(1);
});

