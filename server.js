const express = require('express');
const app = express();

app.get('/download', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).send('Missing video URL');

  try {
    let audioUrl = null;

    // Source 1: Siputzx
    try {
      const res1 = await fetch(`https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(videoUrl)}`);
      const data1 = await res1.json();
      if (data1?.status && (data1?.data?.dl || data1?.data?.download)) {
        audioUrl = data1.data.dl || data1.data.download;
      }
    } catch (e) {}

    // Source 2: Ryzendesu
    if (!audioUrl) {
      try {
        const res2 = await fetch(`https://api.ryzendesu.vip/api/downloader/ytmp3?url=${encodeURIComponent(videoUrl)}`);
        const data2 = await res2.json();
        if (data2?.status && data2?.url) {
          audioUrl = data2.url;
        }
      } catch (e) {}
    }

    // Source 3: BK9
    if (!audioUrl) {
      try {
        const res3 = await fetch(`https://bk9.fun/download/youtube?url=${encodeURIComponent(videoUrl)}`);
        const data3 = await res3.json();
        if (data3?.status && data3?.BK9?.audio) {
          audioUrl = data3.BK9.audio;
        }
      } catch (e) {}
    }

    if (!audioUrl) {
      return res.status(500).send('All proxy download sources failed.');
    }

    const audioRes = await fetch(audioUrl);
    if (!audioRes.ok) return res.status(500).send('Failed to fetch audio stream buffer.');

    res.setHeader('Content-Type', 'audio/mpeg');
    const arrayBuffer = await audioRes.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));

  } catch (error) {
    res.status(500).send('Proxy error: ' + error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
