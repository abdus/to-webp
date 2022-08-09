import path from 'path';
import AdmZip from 'adm-zip';
import { randomBytes } from 'crypto';
import type { FastifyInstance } from 'fastify';
import { Static, Type } from '@sinclair/typebox';
import fastifyMultipart from '@fastify/multipart';

import { ZipToWebp } from '../utils/zip-to-webp';
import { convertToWebP } from '../utils/convert-to-webp';

const cwebpOptsSchema = Type.Object({
  size: Type.Number({ maximum: 5e6 /* 5 MB */, default: 0 }),
  width: Type.Number({ default: 0, maximum: 7000, minimum: 0 }),
  height: Type.Number({ default: 0, maximum: 7000, minimum: 0 }),
  quality: Type.Number({ default: 75 }),
});

type CwebpOptsType = Static<typeof cwebpOptsSchema>;

export async function convertFromZipRoutes(fastify: FastifyInstance) {
  await fastify.register(fastifyMultipart);

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
      const zipToWebp = new ZipToWebp(req.session.sessionId);

      await zipToWebp.pumpUploadedZipToFs(file);

      const zip = new AdmZip(zipToWebp.getUploadedZipFilePath());
      const promises: void[] = [];
      let unzippedFiles: string[] = [];

      zip.extractAllTo(zipToWebp.getUserDecompressDir());
      unzippedFiles = zipToWebp.getUnzippedFiles();

      unzippedFiles.forEach((relFile) => {
        const outFile = zipToWebp.getResultantWebpPath(relFile);
        const absFile = path.join(zipToWebp.getUserDecompressDir(), relFile);

        promises.push(convertToWebP(absFile, outFile));
      });

      await Promise.allSettled(promises);

      const zippedWebp = new AdmZip();

      zipToWebp
        .getConvertedWebpFiles()
        .map((f) => path.resolve(zipToWebp.getUserDecompressDir(), f))
        .forEach((f) => zippedWebp.addLocalFile(f));

      zippedWebp.writeZip(zipToWebp.getWebpZipFilePath());

      return {
        data: {
          webp: `/bin/${zipToWebp.getPublicZipFilePath()}`,
        },
      };
    },
  });
}
