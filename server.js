const express = require('express');
const app = express();

app.get('/download', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).send('Missing video URL');

  try {
    let audioUrl = null;

    // Alternative Endpoint 1: Vyturex API
    try {
      const res1 = await fetch(`https://api.vyturex.com/ytmp3?url=${encodeURIComponent(videoUrl)}`);
      const data1 = await res1.json();
      if (data1?.status && data1?.downloadUrl) {
        audioUrl = data1.downloadUrl;
      }
    } catch (e) {}

    // Alternative Endpoint 2: Delirius API
    if (!audioUrl) {
      try {
        const res2 = await fetch(`https://delirius-api-oficial.vercel.app/download/ytmp3?url=${encodeURIComponent(videoUrl)}`);
        const data2 = await res2.json();
        if (data2?.status && data2?.data?.link) {
          audioUrl = data2.data.link;
        }
      } catch (e) {}
    }

    // Alternative Endpoint 3: Apify / SaveFrom wrapper fallback
    if (!audioUrl) {
      try {
        const res3 = await fetch(`https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(videoUrl)}`);
        const data3 = await res3.json();
        if (data3?.status && (data3?.data?.dl || data3?.data?.download)) {
          audioUrl = data3.data.dl || data3.data.download;
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
