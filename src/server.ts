import app from './app';
import config from './config';
import { initDB } from './db';

const main = () => {
  // Always initialize your database connection
  initDB();

  // ONLY start the persistent server listening loop if NOT on Vercel production
  if (process.env.NODE_ENV !== 'production') {
    app.listen(config.port, () => {
      console.log(`Example app listening on port ${config.port}`);
    });
  }
};

main();
export default app