/**
 * 零依赖静态服务器 —— 让这个爱心页面立刻拥有一个可以分享的网址
 * 用法：
 *   node serve.js          # 默认 8000 端口
 *   node serve.js 3000     # 指定端口
 * 启动后终端会打印：
 *   - 本机地址    http://localhost:8000/
 *   - 局域网地址  http://192.168.x.x:8000/   （同 Wi-Fi 下的手机/电脑都能打开）
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = __dirname;
const PORT = Number(process.argv[2]) || Number(process.env.PORT) || 8000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function createServer() {
  return http.createServer((req, res) => {
    let urlPath;
    try {
      urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    } catch (e) {
      res.writeHead(400); res.end('Bad Request'); return;
    }
    if (urlPath === '/' || urlPath === '') urlPath = '/index.html';

    const filePath = path.join(ROOT, path.normalize(urlPath).replace(/^(\.\.[\\/])+/, ''));
    if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end('Forbidden'); return; }

    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('404 Not Found'); return; }
      res.writeHead(200, {
        'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-store'
      });
      res.end(data);
    });
  });
}

function localIPv4() {
  const list = [];
  const ifaces = os.networkInterfaces();
  Object.keys(ifaces).forEach(name => {
    (ifaces[name] || []).forEach(info => {
      if (info.family === 'IPv4' && !info.internal) list.push(info.address);
    });
  });
  return list;
}

module.exports = { createServer, localIPv4, ROOT, PORT };

if (require.main === module) {
  createServer().listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('  ♥  许晴我爱你 · 3D 颗粒爱心已经跑起来了');
    console.log('  ----------------------------------------------');
    console.log('  本机打开：  http://localhost:' + PORT + '/');
    localIPv4().forEach(ip => console.log('  分享给同 Wi-Fi 的朋友：http://' + ip + ':' + PORT + '/'));
    console.log('  ----------------------------------------------');
    console.log('  想给任何人打开，把本文件夹拖到 https://app.netlify.com/drop 即可得到公网网址');
    console.log('  按 Ctrl + C 停止服务');
    console.log('');
  });
}
