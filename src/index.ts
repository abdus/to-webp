import { createServer } from './app';

createServer().catch((err) => {
  // eslint-disable-next-line
  console.log((err as any).message);
});
