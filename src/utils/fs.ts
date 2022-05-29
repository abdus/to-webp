import fs from 'fs';
import crypto from 'crypto';
import mime from 'mime-types';
import { UPLOAD_DIR } from '../config/constants';

export class UserDir {
  dir = '';

  userDirName = '';

  filename = crypto.randomBytes(5).toString('hex');

  extension = '';

  constructor(mimeType?: string, userId?: string) {
    const dirname = userId || crypto.randomUUID();
    const extension = mime.extension(mimeType || '');
    const dirFullPath = `${UPLOAD_DIR}/${dirname}`;

    if (!fs.existsSync(dirFullPath)) {
      fs.mkdirSync(dirFullPath, { recursive: true });
    }

    this.dir = dirFullPath;
    this.extension = extension || 'unk';
    this.userDirName = dirname;

    // return `${dirFullPath}/${filename}.${extension}`;
  }

  getUploadFilePath() {
    return `${this.dir}/${this.filename}.${this.extension}`;
  }

  getWebPFilePath() {
    return `${this.dir}/${this.filename}.webp`;
  }

  getPublicWebpUri() {
    return `/bin/${this.userDirName}/${this.filename}.webp`;
  }
}
