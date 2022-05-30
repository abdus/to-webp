import fs from 'fs';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { randomBytes } from 'crypto';
import type { FastifyInstance } from 'fastify';
import { Static, Type } from '@sinclair/typebox';

import { UserDir } from '../../utils/fs';
import { convertToWebP } from '../components/convert-to-webp';

const pump = promisify(pipeline);
const cwebpOptsSchema = Type.Object({
  size: Type.Number({ maximum: 5e6 /* 5 MB */, default: 0 }),
  width: Type.Number({ default: 0, maximum: 7000, minimum: 0 }),
  height: Type.Number({ default: 0, maximum: 7000, minimum: 0 }),
  quality: Type.Number({ default: 75 }),
});
type CwebpOptsType = Static<typeof cwebpOptsSchema>;

export async function resizeRoutes(fastify: FastifyInstance) {
  fastify.route<{ Querystring: CwebpOptsType }>({
    url: '/',
    method: 'POST',
    schema: { querystring: cwebpOptsSchema },
    preHandler: [
      (req, _res, done) => {
        if (!req.session.sessionId) {
          req.session.sessionId = randomBytes(4).toString('hex');
        }

        done();
      },
    ],
    async handler(req) {
      const file = await req.file();
      const userId = Buffer.from(req.session.sessionId).toString('hex');
      const userDir = new UserDir(file.mimetype, userId, file.filename);
      const destFilePath = userDir.getUploadFilePath();

      await pump(file.file, fs.createWriteStream(destFilePath));
      await convertToWebP(
        userDir.getUploadFilePath(),
        userDir.getWebPFilePath(),
        {
          size: req.query.size,
          q: req.query.quality,
          resize: `${req.query.width} ${req.query.height}`,
        },
      );

      return {
        data: { webp: userDir.getPublicWebpUri() },
      };
    },
  });
}
