import type { FastifyInstance } from 'fastify';
import { userRoutes } from './users';
import { resizeRoutes } from './resize';

export async function routes(fastify: FastifyInstance) {
  await fastify.register(userRoutes, { prefix: '/' });
  await fastify.register(resizeRoutes, { prefix: '/resize' });
}
