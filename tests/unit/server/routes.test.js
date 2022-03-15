import { jest, expect, describe, test, beforeEach } from '@jest/globals';

import config from '../../../server/config.js';
import TestUtil from '../_utils/testUtil.js';
import { handler } from '../../../server/routes.js';
import { Controller } from '../../../server/controller.js';

describe('Routes - Test site for api response', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test('GET / - should redirect to home page', async () => {
    const params = TestUtil.defaultHandleParams();

    params.request.method = 'GET';
    params.request.url = '/';

    await handler(...params.values());

    expect(params.response.writeHead).toHaveBeenCalledWith(302, {
      Location: config.location.home,
    });
    expect(params.response.end).toHaveBeenCalled();
  });

  test(`GET /home - should response with ${config.pages.homeHTML} file stream`, async () => {
    const params = TestUtil.defaultHandleParams();

    params.request.method = 'GET';
    params.request.url = '/home';

    const mockFileStream = TestUtil.generateReadableStream(['data']);

    jest.spyOn(Controller.prototype, Controller.prototype.getFileStream.name).mockResolvedValue({
      stream: mockFileStream,
    });

    jest.spyOn(mockFileStream, 'pipe').mockReturnValue();

    await handler(...params.values());

    expect(Controller.prototype.getFileStream).toBeCalledWith(config.pages.homeHTML);
    expect(mockFileStream.pipe).toBeCalledWith(params.response);
  });

  test(`GET /controller - should response with ${config.pages.controllerHTML} file stream`, async () => {
    const params = TestUtil.defaultHandleParams();

    params.request.method = 'GET';
    params.request.url = '/controller';

    const mockFileStream = TestUtil.generateReadableStream(['data']);

    jest.spyOn(Controller.prototype, Controller.prototype.getFileStream.name).mockResolvedValue({
      stream: mockFileStream,
    });

    jest.spyOn(mockFileStream, 'pipe').mockReturnValue();

    await handler(...params.values());

    expect(Controller.prototype.getFileStream).toBeCalledWith(config.pages.controllerHTML);
    expect(mockFileStream.pipe).toBeCalledWith(params.response);
  });

  test('GET /index.html - should response with file stream', async () => {
    const params = TestUtil.defaultHandleParams();
    const url = '/index.html';

    params.request.method = 'GET';
    params.request.url = url;

    const mockFileStream = TestUtil.generateReadableStream(['data']);
    const expectedType = '.html';

    jest.spyOn(Controller.prototype, Controller.prototype.getFileStream.name).mockResolvedValue({
      stream: mockFileStream,
      type: expectedType,
    });

    jest.spyOn(mockFileStream, 'pipe').mockReturnValue();

    await handler(...params.values());

    expect(Controller.prototype.getFileStream).toBeCalledWith(url);
    expect(mockFileStream.pipe).toBeCalledWith(params.response);
    expect(params.response.writeHead).toBeCalledWith(200, {
      'Content-Type': config.constants.CONTENT_TYPE[expectedType],
    });
  });

  test('GET /file.ext - should response with file stream', async () => {
    const params = TestUtil.defaultHandleParams();
    const url = '/file.ext';

    params.request.method = 'GET';
    params.request.url = url;

    const mockFileStream = TestUtil.generateReadableStream(['data']);
    const expectedType = '.ext';

    jest.spyOn(Controller.prototype, Controller.prototype.getFileStream.name).mockResolvedValue({
      stream: mockFileStream,
      type: expectedType,
    });

    jest.spyOn(mockFileStream, 'pipe').mockReturnValue();

    await handler(...params.values());

    expect(Controller.prototype.getFileStream).toBeCalledWith(url);
    expect(mockFileStream.pipe).toBeCalledWith(params.response);
    expect(params.response.writeHead).not.toBeCalled();
  });

  test('GET /unknown - given an inexistent route should response with 404', async () => {
    const params = TestUtil.defaultHandleParams();

    params.request.method = 'POST';
    params.request.url = '/unknown';

    await handler(...params.values());

    expect(params.response.writeHead).toBeCalledWith(404);
    expect(params.response.end).toBeCalled();
  });

  describe('Exceptions', () => {
    test('given inexistent file should response with 404', async () => {
      const params = TestUtil.defaultHandleParams();

      params.request.method = 'GET';
      params.request.url = '/index.png';

      jest
        .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
        .mockRejectedValue(new Error('Error: ENOENT: no such file or directory'));

      await handler(...params.values());

      expect(params.response.writeHead).toBeCalledWith(404);
      expect(params.response.end).toBeCalled();
    });

    test('given an error should response with 500', async () => {
      const params = TestUtil.defaultHandleParams();

      params.request.method = 'GET';
      params.request.url = '/index.png';

      jest
        .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
        .mockRejectedValue(new Error('Error:'));

      await handler(...params.values());

      expect(params.response.writeHead).toBeCalledWith(500);
      expect(params.response.end).toBeCalled();
    });
  });
});
