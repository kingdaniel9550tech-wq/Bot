const express = require('express');
const ytdl = require('@ybd-project/ytdl-core');
const app = express();

app.get('/download', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).send('Missing video URL');

  try {
    res.header('Content-Type', 'audio/mpeg');
    ytdl(videoUrl, { filter: 'audioonly', quality: 'highestaudio' }).pipe(res);
  } catch (error) {
    res.status(500).send('Stream error: ' + error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
