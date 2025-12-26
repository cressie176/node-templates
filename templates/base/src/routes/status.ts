import { Hono } from 'hono';

export default function createStatusRoutes() {
  const app = new Hono();

  app.get('/health', async (c) => {
    return c.json({ message: 'OK' });
  });

  return app;
}
