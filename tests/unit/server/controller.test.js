import { jest, expect, describe, test, beforeEach } from '@jest/globals';

import TestUtil from '../_utils/testUtil.js';
import { Service } from '../../../server/service.js';
import { Controller } from '../../../server/controller.js';

describe('Controller', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test('should return a file stream', async () => {
    const controller = new Controller();
    const mockFileStream = TestUtil.generateReadableStream(['data']);
    const file = 'file.txt';
    const fileType = '.txt';

    jest.spyOn(Service.prototype, Service.prototype.getFileStream.name).mockResolvedValue({
      type: fileType,
      stream: mockFileStream,
    });

    const result = await controller.getFileStream(file);

    expect(Service.prototype.getFileStream).toBeCalledWith(file);
    expect(result).toEqual({
      stream: mockFileStream,
      type: fileType,
    });
  });

  describe('Exceptions', () => {
    test('should throw an error if the file does not exist', async () => {
      const controller = new Controller();
      const file = 'file.txt';

      jest
        .spyOn(Service.prototype, Service.prototype.getFileStream.name)
        .mockRejectedValue(new Error('ENOENT: no such file or directory'));

      await expect(controller.getFileStream(file)).rejects.toThrow(/ENOENT/);
      expect(Service.prototype.getFileStream).toBeCalledWith(file);
    });
  });
});
