import fs from 'fs';
import crypto from 'crypto';
import mime from 'mime-types';
import { UPLOAD_DIR } from '../config/constants';

export class UserDir {
  private dir = '';

  private userDirName = '';

  private filename = crypto.randomBytes(5).toString('hex');

  private extension = '';

  constructor(mimeType?: string, userId?: string, fname?: string) {
    this.userDirName = userId || crypto.randomUUID();
    this.extension = mime.extension(mimeType || '') || 'unk';
    this.dir = `${UPLOAD_DIR}/${this.userDirName}`;

    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir, { recursive: true });
    }

    if (fname) {
      this.filename = `${fname.replace(/\..*$/gi, '').replace(/'/gi, '')}`;
    }
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
