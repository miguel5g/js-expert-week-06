import config from './config.js';
import { Controller } from './controller.js';
import { logger } from './utils.js';

const controller = new Controller();

async function routes(request, response) {
  const { method, url } = request;

  // GET /
  if (method === 'GET' && url === '/') {
    response.writeHead(302, {
      Location: config.location.home,
    });

    return response.end();
  }

  // GET /home
  if (method === 'GET' && url === '/home') {
    const { stream } = await controller.getFileStream(config.pages.homeHTML);

    return stream.pipe(response);
  }

  // GET /controller
  if (method === 'GET' && url === '/controller') {
    const { stream } = await controller.getFileStream(config.pages.controllerHTML);

    return stream.pipe(response);
  }

  // Static
  if (method === 'GET') {
    const { stream, type } = await controller.getFileStream(url);
    const contentType = config.constants.CONTENT_TYPE[type];

    if (contentType)
      response.writeHead(200, {
        'Content-Type': contentType,
      });

    return stream.pipe(response);
  }

  // Default 404
  response.writeHead(404);
  return response.end('Hello Routes!');
}

function handleError(error, response) {
  if (error.message.includes('ENOENT')) {
    logger.warn(`Asset not founded ${error.stack}`);

    response.writeHead(404);
    return response.end();
  }

  logger.error(`Caught error on API ${error.stack}`);

  response.writeHead(500);
  return response.end();
}

export function handler(request, response) {
  return routes(request, response).catch((error) => handleError(error, response));
}
