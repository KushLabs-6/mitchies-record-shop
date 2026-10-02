const fs = require('fs');
const https = require('https');
const path = require('path');

const images = [
  { name: 'exodus.jpg', url: 'https://m.media-amazon.com/images/I/71u9sJdYg6L._UF1000,1000_QL80_.jpg' },
  { name: 'superape.jpg', url: 'https://m.media-amazon.com/images/I/81xU-U7RzKL._UF1000,1000_QL80_.jpg' },
  { name: 'funkykingston.jpg', url: 'https://m.media-amazon.com/images/I/71I3F9-D1mL._UF1000,1000_QL80_.jpg' },
  { name: 'marcusgarvey.jpg', url: 'https://m.media-amazon.com/images/I/81UeL1hFNTL._UF1000,1000_QL80_.jpg' },
  { name: 'twosevensclash.jpg', url: 'https://m.media-amazon.com/images/I/71Q33c7-oLL._UF1000,1000_QL80_.jpg' },
  { name: 'heartofthecongos.jpg', url: 'https://m.media-amazon.com/images/I/71UqY3fT-hL._UF1000,1000_QL80_.jpg' }
];

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    https.get(url, options, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => file.close(resolve));
      } else {
        reject(new Error(`Status ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

async function run() {
  for (const img of images) {
    const dest = path.join(__dirname, 'public', img.name);
    try {
      await download(img.url, dest);
      console.log(`Saved ${img.name}`);
    } catch (e) {
      console.error(`Failed ${img.name}:`, e.message);
    }
  }
}

run();
