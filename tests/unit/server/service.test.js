import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';

import config from '../../../server/config.js';
import TestUtil from '../_utils/testUtil.js';
import { Service } from '../../../server/service.js';

describe('Service', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test('should return a file stream', async () => {
    const service = new Service();
    const mockFileStream = TestUtil.generateReadableStream(['data']);

    jest.spyOn(fs, fs.createReadStream.name).mockReturnValue(mockFileStream);

    const result = service.createFileStream('file.txt');

    expect(fs.createReadStream).toBeCalledWith('file.txt');
    expect(result).toBe(mockFileStream);
  });

  test('should return a file info', async () => {
    const service = new Service();
    const file = 'file.txt';
    const fielType = '.txt';
    const fileFullPath = path.join(config.dir.public, file);

    jest.spyOn(fsPromises, fsPromises.access.name).mockResolvedValue(null);

    const result = await service.getFileInfo(file);

    expect(fsPromises.access).toBeCalledWith(fileFullPath);
    expect(result).toEqual({
      type: fielType,
      name: fileFullPath,
    });
  });

  test('should return a file stream', async () => {
    const service = new Service();
    const file = 'file.txt';
    const fileFullPath = path.join(config.dir.public, file);
    const fileType = path.extname(fileFullPath);
    const mockFileStream = TestUtil.generateReadableStream(['data']);

    jest.spyOn(service, 'getFileInfo').mockResolvedValue({
      type: fileType,
      name: fileFullPath,
    });

    jest.spyOn(service, service.createFileStream.name).mockImplementation(() => mockFileStream);

    const result = await service.getFileStream(file);

    expect(service.getFileInfo).toBeCalledWith(file);
    expect(service.createFileStream).toBeCalledWith(fileFullPath);
    expect(result).toEqual({
      stream: mockFileStream,
      type: fileType,
    });
  });

  describe('Exceptions', () => {
    test('should throw an error when file not found (getFileInfo)', async () => {
      const service = new Service();
      const file = 'file.txt';
      const fileFullPath = path.join(config.dir.public, file);

      jest
        .spyOn(fsPromises, fsPromises.access.name)
        .mockRejectedValue(new Error('ENOENT: no such file or directory, access'));

      expect(service.getFileInfo(file)).rejects.toThrow(/ENOENT/);
      expect(fsPromises.access).toBeCalledWith(fileFullPath);
    });

    test('should throw an error when file not found (getFileStream)', async () => {
      const service = new Service();
      const file = 'file.txt';

      jest
        .spyOn(service, service.getFileInfo.name)
        .mockRejectedValue(new Error('ENOENT: no such file or directory'));

      jest.spyOn(service, 'createFileStream').mockResolvedValue(null);

      expect(service.getFileStream(file)).rejects.toThrow(/ENOENT/);
      expect(service.getFileInfo).toBeCalledWith(file);
      expect(service.createFileStream).not.toBeCalled();
    });
  });
});
