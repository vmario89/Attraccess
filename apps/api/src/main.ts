import { bootstrap, startListening } from './main.bootstrap';

async function main() {
  const { app, port, globalPrefix, nodeEnv } = await bootstrap();
  await startListening(app, port, globalPrefix, nodeEnv);
}

main();
