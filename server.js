const express = require('express');
const app = express();

app.get('/download', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) {
    console.log("❌ Error: Missing video URL parameter");
    return res.status(400).send('Missing video URL');
  }

  console.log(`🔍 Proxy requested for URL: ${videoUrl}`);

  try {
    let audioUrl = null;

    // Source 1: Siputzx
    try {
      const res1 = await fetch(`https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(videoUrl)}`);
      const data1 = await res1.json();
      if (data1?.status && (data1?.data?.dl || data1?.data?.download)) {
        audioUrl = data1.data.dl || data1.data.download;
        console.log("✅ Source 1 (Siputzx) succeeded.");
      }
    } catch (e) {
      console.log("⚠️ Source 1 failed:", e.message);
    }

    // Source 2: Ryzendesu
    if (!audioUrl) {
      try {
        const res2 = await fetch(`https://api.ryzendesu.vip/api/downloader/ytmp3?url=${encodeURIComponent(videoUrl)}`);
        const data2 = await res2.json();
        if (data2?.status && data2?.url) {
          audioUrl = data2.url;
          console.log("✅ Source 2 (Ryzendesu) succeeded.");
        }
      } catch (e) {
        console.log("⚠️ Source 2 failed:", e.message);
      }
    }

    // Source 3: BK9
    if (!audioUrl) {
      try {
        const res3 = await fetch(`https://bk9.fun/download/youtube?url=${encodeURIComponent(videoUrl)}`);
        const data3 = await res3.json();
        if (data3?.status && data3?.BK9?.audio) {
          audioUrl = data3.BK9.audio;
          console.log("✅ Source 3 (BK9) succeeded.");
        }
      } catch (e) {
        console.log("⚠️ Source 3 failed:", e.message);
      }
    }

    if (!audioUrl) {
      console.log("❌ All proxy download sources failed for:", videoUrl);
      return res.status(500).send('All proxy download sources failed.');
    }

    console.log(`📥 Fetching audio stream from external provider...`);
    const audioRes = await fetch(audioUrl);
    if (!audioRes.ok) {
      console.log("❌ Failed to fetch audio stream buffer, status:", audioRes.status);
      return res.status(500).send('Failed to fetch audio stream buffer.');
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    const arrayBuffer = await audioRes.arrayBuffer();
    console.log(`✅ Successfully streaming audio buffer to bot. Size: ${arrayBuffer.byteLength} bytes`);
    res.send(Buffer.from(arrayBuffer));

  } catch (error) {
    console.log("❌ Critical Proxy Error:", error.message);
    res.status(500).send('Proxy error: ' + error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
