declare module 'fastify' {
  // eslint-disable-next-line no-unused-vars
  interface FastifyInstance {
    config: { [key: string]: any };
  }
}

const envSchema = {
  type: 'object',
  required: ['DB_HOSTNAME', 'DB_USERNAME', 'DB_PASSWORD', 'DATABASE_NAME'],
  properties: {
    PORT: { type: 'string', default: 3000 },
    DATABASE_NAME: { type: 'string' },
    DB_HOSTNAME: { type: 'string' },
    DB_USERNAME: { type: 'string' },
    DB_PASSWORD: { type: 'string' },
  },
};

const fastifyEnvOpts = {
  schema: envSchema,
  confKey: 'config',
  dotenv: {
    path: '.env',
    debug: true,
  },
};

export { fastifyEnvOpts };
