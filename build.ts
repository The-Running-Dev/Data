import * as fs from 'fs';
import * as path from 'path';

const glob = require('glob');
const CONFIG_DIR = path.join(__dirname, './config');
const DATA_DIR = path.join(__dirname, './artifacts');

export class Build {
  constructor() {
    this.setup();
  }

  private setup(): void {
    try {
      // Ensure data directory exists
      if (!fs.existsSync(DATA_DIR)) {
        console.log(`[INFO] Creating Data Directory: ${DATA_DIR}`);

        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch (error) {
      console.error(
        `[ERROR] Failed to Setup Configuration: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private convertYamlToJson(): void {
    const { execSync } = require('child_process');

    execSync(`npx data-json-yaml "${CONFIG_DIR}" "${DATA_DIR}"`, { stdio: 'inherit' });
  }

  private postBuild() {
    const { execSync } = require('child_process');

    glob.sync('**/post-build.ts').forEach(file => {
      execSync(`npx tsx ${file}`, { stdio: 'inherit' });
    });
  }

  public process(): void {
    try {
      console.log('[INFO] Starting Build Process...');

      this.convertYamlToJson();

      this.postBuild();

      console.log('[INFO] Build Process Completed Successfully');
    } catch (error) {
      console.error(
        `[ERROR] Build Process Failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

// Only run if invoked directly, not imported
if (process.argv[1] && process.argv[1].endsWith('build.ts')) {
  new Build().process();
}