import { config } from '@documind/shared/config';

export const apiConfig = {
  port: config.api.port(),
  nodeEnv: config.api.nodeEnv(),
  corsOrigins: config.api.corsOrigins(),
  groqApiKey: config.groq.apiKey(),
  convexUrl: config.convex.url(),
};
