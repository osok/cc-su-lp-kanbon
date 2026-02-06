/**
 * Entry point for the backend API server.
 * Requirements: DC-001, NR-SEC-001, DC-005
 */
import { createApp } from './server.js';
import { ConfigStore } from './services/config-store.js';
import { FileDiscoveryService } from './services/file-discovery.js';
import { PollManager } from './services/poll-manager.js';

const PORT = parseInt(process.env.PORT || '3001', 10);

async function main(): Promise<void> {
  const configStore = new ConfigStore();
  const config = configStore.load();

  const fileDiscovery = new FileDiscoveryService();
  const pollManager = new PollManager(
    config.directory,
    config.pollingInterval,
    fileDiscovery,
  );

  const app = createApp({ pollManager, configStore });

  // Start polling if directory is configured
  if (config.directory) {
    pollManager.start();
  }

  // Bind to localhost only (NR-SEC-001)
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`ATKD running at http://localhost:${PORT}`);
    if (config.directory) {
      console.log(`Watching: ${config.directory}`);
    } else {
      console.log('No directory configured. Use the UI to select a directory.');
    }
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
