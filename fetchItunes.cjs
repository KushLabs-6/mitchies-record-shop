const https = require('https');
const fs = require('fs');
const path = require('path');

const albums = [
  { term: 'Exodus Bob Marley', filename: 'exodus.png' },
  { term: 'Super Ape The Upsetters', filename: 'superape.jpg' },
  { term: 'Funky Kingston Toots', filename: 'funkykingston.jpg' },
  { term: 'Marcus Garvey Burning Spear', filename: 'marcusgarvey.jpg' },
  { term: 'Two Sevens Clash Culture', filename: 'twosevensclash.jpg' },
  { term: 'Heart of the Congos The Congos', filename: 'heartofthecongos.jpg' }
];

const queryAlbum = (term) => new Promise(resolve => {
  https.get(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=album&limit=1`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => resolve(JSON.parse(data)));
  });
});

const download = (url, dest) => new Promise(resolve => {
  const file = fs.createWriteStream(dest);
  https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => file.close(resolve));
  });
});

async function run() {
  for (const album of albums) {
    try {
      console.log(`Searching for ${album.term}...`);
      const result = await queryAlbum(album.term);
      if (result.results && result.results.length > 0) {
        // Get the high-res 1000x1000 image URL instead of 100x100
        const highResUrl = result.results[0].artworkUrl100.replace('100x100bb', '1000x1000bb');
        console.log(`Downloading cover for ${album.term}...`);
        await download(highResUrl, path.join(__dirname, 'public', album.filename));
        console.log(`Saved ${album.filename}`);
      } else {
        console.log(`No results for ${album.term}`);
      }
    } catch (e) {
      console.error(e);
    }
  }
}

run();
