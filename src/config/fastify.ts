import type { FastifyServerOptions } from 'fastify';

export const fastifyOpts: FastifyServerOptions = {
  logger: {
    prettyPrint: {
      translateTime: 'SYS:h:MM:ss TT Z o',
      ignore: 'pid,hostname',
    },
  },
};
