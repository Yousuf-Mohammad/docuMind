import './loadEnv.js';
import app from './app.js';
import { apiConfig } from './config/index.js';
import { checkConvexUrl } from './config/convexGuard.js';

const port = apiConfig.port;

checkConvexUrl(apiConfig.convexUrl);

app.listen(port, () => {
  console.log(`DocuMind API running at http://localhost:${port}`);
});
