import { join } from 'path';
import { bootstrap } from './main.bootstrap';
import { writeFileSync } from 'fs';

async function main() {
  console.log('Exporting swagger');

  console.log('Bootstrapping');
  const { swaggerDocumentFactory } = await bootstrap();

  console.log('Creating swagger document');
  const distDir = join(__dirname, '../../apps/api-swagger');
  const swaggerDocument = swaggerDocumentFactory();

  console.log('Writing swagger');
  writeFileSync(
    join(distDir, 'swagger.json'),
    JSON.stringify(swaggerDocument, null, 2)
  );

  console.log('Done');
  process.exit(0);
}

main();
