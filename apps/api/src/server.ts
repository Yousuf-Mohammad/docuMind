import './loadEnv.js';
import app from './app.js';
import { apiConfig } from './config/index.js';

const port = apiConfig.port;

app.listen(port, () => {
  console.log(`DocuMind API running at http://localhost:${port}`);
});
