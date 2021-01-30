import dotenv from 'dotenv';
import { Server } from 'http';
import { AddressInfo } from 'net';
import path from 'path';
import { CheckersServer } from './websocket';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

(async () => {
  const { app } = await import('./express');
  const server = new Server(app);
  new CheckersServer(server);

  server.listen(parseInt(process.env.PORT ?? '8080'), '127.0.0.1', () =>
    console.log(`listening on http://127.0.0.1:${(server.address() as AddressInfo).port}`)
  );
})();
