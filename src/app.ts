import path from 'path';
import cookie from '@fastify/cookie';
import fastifyEnv from '@fastify/env';
import session from '@fastify/session';
import fastifyStatic from '@fastify/static';
import fastify, { FastifyInstance } from 'fastify';

import { plugins } from './plugins';
import { routes } from './lib/routes';
import { fastifyEnvOpts } from './config/env';
import { fastifyOpts } from './config/fastify';
import { UPLOAD_DIR } from './config/constants';

export async function createServer() {
  const server: FastifyInstance = fastify(fastifyOpts);

  await server.register(fastifyStatic, {
    root: path.resolve(UPLOAD_DIR),
    prefix: '/bin/',
    decorateReply: false,
  });

  await server.register(fastifyStatic, {
    root: path.resolve('src/static'),
    prefix: '/',
    decorateReply: false,
  });

  await server.register(fastifyEnv, fastifyEnvOpts);

  await server.register(cookie);
  await server.register(session, {
    secret: 'a secret with minimum length of 32 characters',
    cookie: { secure: 'auto', maxAge: 60 * 60 * 24 * 30 },
  });

  await server.register(plugins);
  await server.register(routes);
  await server.listen(server.config.PORT);

  return server;
}
