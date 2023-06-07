const http = require('http');
const path = require('path');
const mime = require('mime');
const { promises: fs } = require('fs');
const cache = {};

function send404(response) {
  response.writeHead(404, { 'Content-Type': 'text/plain' });
  response.write('Error 404: resource not found.');
  response.end();
}

function sendFile(response, filePath, fileContents) {
  response.writeHead(200, { 'Content-Type': mime.getType(filePath) });
  response.end(fileContents);
}

async function serveStatic(response, cache, absPath) {
  if (cache[absPath]) {
    sendFile(response, absPath, cache[absPath]);
  } else {
    try {
      await fs.access(absPath);
      const data = await fs.readFile(absPath);
      cache[absPath] = data;
      sendFile(response, absPath, data);
    } catch (err) {
      send404(response);
    }
  }
}

const server = http.createServer(async (request, response) => {
  let filePath = false;
  if (request.url === '/') {
    filePath = 'public/index.html';
  } else {
    filePath = 'public' + request.url;
  }
  const absPath = path.resolve(__dirname, filePath);
  await serveStatic(response, cache, absPath);
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});


const chatServer = require('./backend/chatServer')
chatServer.listen(server)