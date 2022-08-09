import type { FastifyInstance } from 'fastify';
import fs from 'fs';
import showdown from 'showdown';
import { userRoutes } from './users';
import { convertRoutes } from './convert';
import { convertFromZipRoutes } from './convert-from-zip';

export async function routes(fastify: FastifyInstance) {
  await fastify.register(userRoutes, { prefix: '/' });
  await fastify.register(convertRoutes, { prefix: '/convert' });
  await fastify.register(convertFromZipRoutes, { prefix: '/convert-from-zip' });

  const converter = new showdown.Converter();

  await fastify.register(async () => {
    fastify.get('/changelog', (_req, reply) => {
      const mdContent = fs.readFileSync('CHANGELOG.md').toString('utf-8');
      const htmlContent = converter.makeHtml(mdContent).toString();

      // reply.header('Content-Type', 'text/html');
      // reply.send(htmlContent);
      reply.send({ filename: 'CHANGELOG.md', mdContent, htmlContent });
    });
  });
}
