const fs = require('fs');
const https = require('https');
const path = require('path');

const images = [
  { name: 'exodus.png', url: 'https://upload.wikimedia.org/wikipedia/en/a/a6/Bob_Marley_and_the_Wailers_-_Exodus.png' },
  { name: 'superape.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/7/7b/The_Upsetters_-_Super_Ape.jpg' },
  { name: 'funkykingston.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/9/91/Funky_Kingston.jpg' },
  { name: 'marcusgarvey.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/1/15/Marcus_garvey_burning_spear_album.jpg' },
  { name: 'twosevensclash.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/1/1c/Two_Sevens_Clash.jpg' },
  { name: 'heartofthecongos.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/7/77/Heart_of_the_congos.jpg' }
];

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };
    https.get(url, options, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // Handle redirect
        https.get(response.headers.location, options, (res2) => {
            res2.pipe(file);
            file.on('finish', () => file.close(resolve));
        });
      } else if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

async function run() {
  for (const img of images) {
    const dest = path.join(__dirname, 'public', img.name);
    console.log(`Downloading ${img.name}...`);
    try {
      await download(img.url, dest);
      console.log(`Saved ${img.name}`);
    } catch (e) {
      console.error(`Failed to download ${img.name}`, e);
    }
  }
}

run();
