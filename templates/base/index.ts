import Application from './src/infra/Application.js';
import Configuration from './src/infra/Configuration.js';
import WebServer from './src/infra/WebServer.js';
import initLogging from './src/init/init-logging.js';

const config = Configuration.load(['config/default.json', `config/${process.env.APP_ENV || 'local'}.json`, `config/secrets.json`, 'config/runtime.json']);

await initLogging(config.logging);

const server = new WebServer({ config: config.server });

const application = new Application({ server });

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, async () => {
    await application.stop();
    process.exit(0);
  });
});

await application.start();
