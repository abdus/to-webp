import fs from 'fs';
import crypto from 'crypto';
import mime from 'mime-types';
import { execSync } from 'child_process';
import { UPLOAD_DIR } from '../config/constants';

export class UserDir {
  dir = '';

  userDirName = '';

  filename = crypto.randomBytes(5).toString('hex');

  extension = '';

  constructor(mimeType?: string, userId?: string, fname?: string) {
    const dirname = userId || crypto.randomUUID();
    const extension = mime.extension(mimeType || '');
    const dirFullPath = `${UPLOAD_DIR}/${dirname}`;

    if (!fs.existsSync(dirFullPath)) {
      fs.mkdirSync(dirFullPath, { recursive: true });
    }

    if (fname) {
      this.filename = `${fname.replace(/\..*$/gi, '').replace(/'/gi, '')}`;
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

export function unzip(inputZip: string, outputDir: string) {
  execSync(`unzip -d '${inputZip}' '${outputDir}'`, { stdio: 'inherit' });
}
