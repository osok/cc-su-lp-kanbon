/**
 * Configuration persistence service.
 * Stores app config (watched directory, polling interval) in a JSON file.
 * Requirements: FR-DIR-002, DR-002
 */
import fs from 'node:fs';
import path from 'node:path';
import type { AppConfig } from '@kanban/types';

const DEFAULT_CONFIG: AppConfig = {
  directory: null,
  pollingInterval: 30000,
};

export class ConfigStore {
  private configPath: string;

  constructor(configPath?: string) {
    this.configPath = configPath || path.resolve(process.cwd(), 'config', 'atkd.json');
  }

  /**
   * Load configuration from disk, returning defaults if file doesn't exist.
   */
  load(): AppConfig {
    try {
      if (fs.existsSync(this.configPath)) {
        const raw = fs.readFileSync(this.configPath, 'utf-8');
        const parsed = JSON.parse(raw) as Partial<AppConfig>;
        return {
          directory: parsed.directory ?? DEFAULT_CONFIG.directory,
          pollingInterval: parsed.pollingInterval ?? DEFAULT_CONFIG.pollingInterval,
        };
      }
    } catch {
      // If file is corrupted, return defaults
    }
    return { ...DEFAULT_CONFIG };
  }

  /**
   * Save configuration to disk. Creates the config directory if needed.
   */
  save(config: AppConfig): void {
    const dir = path.dirname(this.configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
  }
}
