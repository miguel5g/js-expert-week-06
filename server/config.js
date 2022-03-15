import path from 'path';
import url from 'url';

const currentDir = path.dirname(url.fileURLToPath(import.meta.url));
const rootDir = path.join(currentDir, '..');
const audioDir = path.join(rootDir, 'audio');
const publicDir = path.join(rootDir, 'public');

export default {
  port: process.env.PORT || 3000,
  dir: {
    root: rootDir,
    public: publicDir,
    audio: audioDir,
    songs: path.join(audioDir, 'songs'),
    fx: path.join(audioDir, 'fx'),
  },
  pages: {
    homeHTML: 'home/index.html',
    controllerHTML: 'controller/index.html',
  },
  location: {
    home: '/home',
  },
  constants: {
    CONTENT_TYPE: {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
    },
  },
};
