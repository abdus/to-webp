import fs from 'fs';
import { randomBytes } from 'crypto';
import type { FastifyInstance } from 'fastify';

export async function userRoutes(fastify: FastifyInstance) {
  fastify.route({
    url: '/me/images',
    method: 'GET',
    preHandler: [
      (req, _res, done) => {
        if (!req.session.sessionId) {
          req.session.sessionId = randomBytes(4).toString('hex');
        }

        done();
      },
    ],
    async handler(req) {
      const userId = Buffer.from(req.session.sessionId).toString('hex');

      try {
        const userFiles = fs
          .readdirSync(`.uploads/${userId}`)
          .filter((file) => file.endsWith('webp'))
          .map((file) => `/bin/${userId}/${file}`);

        return { files: userFiles };
      } catch (err) {
        return { files: [] };
      }
    },
  });
}
