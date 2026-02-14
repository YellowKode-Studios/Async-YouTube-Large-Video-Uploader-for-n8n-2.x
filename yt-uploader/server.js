const express = require("express");
const https = require("https");
const http = require("http");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json({ limit: "10mb" }));

const jobs = new Map();

function getClient(url) {
  return url.startsWith("https") ? https : http;
}

/**
 * START UPLOAD
 */
app.post("/upload-start", (req, res) => {
  const { videoUrl, resumableUrl } = req.body;

  if (!videoUrl || !resumableUrl) {
    return res.status(400).json({ error: "Missing videoUrl or resumableUrl" });
  }

  const jobId = uuidv4();

  jobs.set(jobId, {
    status: "queued",
    videoId: null,
    youtubeUrl: null,
    error: null,
    progress: 0,
    startedAt: new Date()
  });

  console.log("=====================================");
  console.log("🆕 NEW UPLOAD JOB");
  console.log("Job:", jobId);
  console.log("Video URL:", videoUrl);
  console.log("Resumable URL:", resumableUrl);
  console.log("=====================================");

  // responde imediatamente
  res.json({ jobId });

  // inicia em background
  startUpload(jobId, videoUrl, resumableUrl);
});

/**
 * CHECK STATUS
 */
app.get("/upload-status/:id", (req, res) => {
  const job = jobs.get(req.params.id);

  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  res.json(job);
});

/**
 * CORE UPLOAD FUNCTION
 */
function startUpload(jobId, videoUrl, resumableUrl) {
  const job = jobs.get(jobId);
  job.status = "uploading";

  console.log(`🚀 [${jobId}] Starting background upload`);

  getClient(videoUrl).get(videoUrl, sourceRes => {

    // Handle redirect
    if (sourceRes.statusCode >= 300 && sourceRes.statusCode < 400 && sourceRes.headers.location) {
      console.log(`↪️ Redirecting to ${sourceRes.headers.location}`);
      return startUpload(jobId, sourceRes.headers.location, resumableUrl);
    }

    if (sourceRes.statusCode !== 200) {
      job.status = "error";
      job.error = `Source video error: ${sourceRes.statusCode}`;
      return;
    }

    console.log(`📥 [${jobId}] Source stream opened`);

    const uploadReq = https.request(resumableUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "video/mp4"
      }
    }, uploadRes => {

      let responseBody = "";

      uploadRes.on("data", chunk => {
        responseBody += chunk;
      });

      uploadRes.on("end", () => {

        console.log(`📡 [${jobId}] YouTube responded with status ${uploadRes.statusCode}`);

        if (uploadRes.statusCode !== 200 && uploadRes.statusCode !== 201) {
          job.status = "error";
          job.error = `YouTube error: ${uploadRes.statusCode}`;
          return;
        }

        try {
          const data = JSON.parse(responseBody);

          job.status = "done";
          job.videoId = data.id;
          job.youtubeUrl = `https://youtube.com/watch?v=${data.id}`;
          job.finishedAt = new Date();

          console.log(`✅ [${jobId}] Upload completed. Video ID: ${data.id}`);

        } catch (err) {
          job.status = "error";
          job.error = "Failed to parse YouTube response";
          console.error("Parse error:", err.message);
        }

      });

    });

    uploadReq.on("error", err => {
      job.status = "error";
      job.error = err.message;
      console.error(`❌ [${jobId}] Upload request error:`, err.message);
    });

    // opcional: progresso
    let uploadedBytes = 0;

    sourceRes.on("data", chunk => {
      uploadedBytes += chunk.length;
      job.progress = uploadedBytes;
    });

    sourceRes.pipe(uploadReq);

  }).on("error", err => {
    job.status = "error";
    job.error = err.message;
    console.error(`❌ [${jobId}] Source request error:`, err.message);
  });
}

app.listen(3000, () => {
  console.log("🚀 Async uploader running on port 3000");
});
