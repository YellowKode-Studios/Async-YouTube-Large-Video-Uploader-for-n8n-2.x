# 🧪 cURL Testing Examples

Quick tests to verify your setup.

---

## ✅ Test 1: Start Upload

```bash
curl -X POST http://localhost:3000/upload-start \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://example.com/video.mp4",
    "resumableUrl": "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&upload_id=xyz"
  }'
```

**Response:**
```json
{"jobId": "a3f5c9e8-4d2b-4a1c-8f3e-1d7b2c9e4a6f"}
```

---

## ✅ Test 2: Check Status

```bash
curl http://localhost:3000/upload-status/a3f5c9e8-4d2b-4a1c-8f3e-1d7b2c9e4a6f
```

**Responses:**

**Uploading:**
```json
{
  "status": "uploading",
  "progress": 157286400
}
```

**Done:**
```json
{
  "status": "done",
  "videoId": "dQw4w9WgXcQ",
  "youtubeUrl": "https://youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Error:**
```json
{
  "status": "error",
  "error": "Source video error: 403"
}
```

---

## ❌ Test 3: Missing Parameters

```bash
curl -X POST http://localhost:3000/upload-start \
  -H "Content-Type: application/json" \
  -d '{"videoUrl": "https://example.com/video.mp4"}'
```

**Response (400):**
```json
{"error": "Missing videoUrl or resumableUrl"}
```

---

## ❌ Test 4: Job Not Found

```bash
curl http://localhost:3000/upload-status/invalid-id
```

**Response (404):**
```json
{"error": "Job not found"}
```

---

## 🌐 Test with Reverse Proxy

**Subdomain:**
```bash
curl -X POST https://uploader.yourdomain.com/upload-start \
  -H "Content-Type: application/json" \
  -d '{"videoUrl":"...","resumableUrl":"..."}'
```

**Subdirectory:**
```bash
curl -X POST https://n8n.yourdomain.com/yt-upload/upload-start \
  -H "Content-Type: application/json" \
  -d '{"videoUrl":"...","resumableUrl":"..."}'
```

---

## 🔄 Poll Status Script

**Bash:**
```bash
#!/bin/bash
JOB_ID="your-job-id"
while true; do
  STATUS=$(curl -s "http://localhost:3000/upload-status/$JOB_ID" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
  echo "Status: $STATUS"
  [ "$STATUS" = "done" ] || [ "$STATUS" = "error" ] && break
  sleep 30
done
```

**PowerShell:**
```powershell
$jobId = "your-job-id"
do {
  $response = Invoke-RestMethod "http://localhost:3000/upload-status/$jobId"
  Write-Host "Status: $($response.status)"
  Start-Sleep -Seconds 30
} while ($response.status -ne "done" -and $response.status -ne "error")
```

---

## 🔍 Verbose Debug

Add `-v` to see full request/response:

```bash
curl -v -X POST http://localhost:3000/upload-start \
  -H "Content-Type: application/json" \
  -d '{"videoUrl":"...","resumableUrl":"..."}'
```
