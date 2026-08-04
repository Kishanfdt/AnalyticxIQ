import app from './app.js';
import { config } from './config/index.js';
import { Logger } from './utils/logger.js';

const PORT = config.PORT;

app.listen(PORT, () => {
  Logger.info(`🚀 AnalyticxIQ Server running in ${config.NODE_ENV} mode on port ${PORT}`);
});
