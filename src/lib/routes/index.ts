import type { FastifyInstance } from 'fastify';
import { resizeRoutes } from './resize';

export async function routes(fastify: FastifyInstance) {
  await fastify.register(resizeRoutes, { prefix: '/resize' });
}
