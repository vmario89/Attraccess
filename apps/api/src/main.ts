import { bootstrap } from './main.bootstrap';
import { Logger } from '@nestjs/common';



async function main() {
  const { globalPrefix, port } = await bootstrap();

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

main();
