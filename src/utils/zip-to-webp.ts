import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { join } from 'node:path';
import { promisify } from 'util';
import { pipeline } from 'stream';
import type { MultipartFile } from '@fastify/multipart';

import { UPLOAD_DIR } from '../config/constants';

function deepReadDir(dirPath: string): any[] {
  return fs
    .readdirSync(dirPath)
    .map((entity) => {
      const p = join(dirPath, entity);
      return fs.lstatSync(p).isDirectory() ? deepReadDir(p) : p;
    })
    .flat(Number.POSITIVE_INFINITY);
}

export class ZipToWebp {
  /**
   * A sub-directory to store user's files. Its value is a random UUIDv4
   * extracted from the sessionId (generated at random when sessionId
   * is not available)
   * @private
   * @type string
   */
  private userDir = '';

  /**
   * similar to ZipToWebp.userDir, but stores extracted zip file content.
   * This is the first-level sub-directory of ZipToWebp.userDir
   * @private
   * @type string
   */
  private userDecompressDir = '';

  /**
   * This is the sub-directory name of where to extract the unzipped content.
   * For a full relative path, use ZipToWebp.getUserDecompressDir()
   * @private
   * @type string
   */
  private decompressDirName = '';

  /**
   * Stores the path of user-uploaded Zip with raw images to be decompressed
   * @private
   * @type string
   */
  private inputZipPath = '';

  constructor(sessionId: string = crypto.randomUUID()) {
    this.userDir = path.join(UPLOAD_DIR, sessionId);
    this.decompressDirName = crypto.randomBytes(3).toString('hex');
    this.userDecompressDir = path.join(this.userDir, this.decompressDirName);

    if (!fs.existsSync(this.userDecompressDir)) {
      fs.mkdirSync(this.userDecompressDir, { recursive: true });
    }

    this.inputZipPath = `${this.getUserDecompressDir()}_.zip`;
  }

  getUserDecompressDir() {
    return this.userDecompressDir;
  }

  getWebpZipFilePath() {
    return path.join(this.userDir, `${this.decompressDirName}_.zip`);
  }

  getPublicZipFilePath() {
    return path
      .join(this.userDir, `${this.decompressDirName}_.zip`)
      .replace(`${UPLOAD_DIR}/`, '');
  }

  async pumpUploadedZipToFs(file: MultipartFile) {
    const pump = promisify(pipeline);
    await pump(file.file, fs.createWriteStream(this.inputZipPath));
  }

  getUploadedZipFilePath() {
    return this.inputZipPath;
  }

  getUnzippedFiles() {
    return deepReadDir(this.getUserDecompressDir()).filter(
      (file: string) => !file.endsWith('webp'),
    );
  }

  getConvertedWebpFiles() {
    return fs
      .readdirSync(this.getUserDecompressDir())
      .filter((file) => file.endsWith('webp'));
  }

  getResultantWebpPath(fname?: string) {
    let chunk = '';

    if (fname) {
      const splitted = fname.split('/');
      chunk = `${splitted[splitted.length - 1]
        ?.replace(/\..*$/gi, '')
        .replace(/'/gi, '')}.webp`;
    } else {
      chunk = `${crypto.randomUUID()}.webp`;
    }

    return path.join(this.userDecompressDir, chunk);
  }
}
