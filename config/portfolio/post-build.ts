import * as fs from 'fs';
import * as path from 'path';

const ARTIFACTS_DIR = path.join(__dirname, '../../artifacts');
const VERSION_PATH = path.join(ARTIFACTS_DIR, path.join('portfolio', 'version.json'));

export class PreBuild {
  private setVersion(): void {
    // Set version property in version.json to today's date in YYYY.MM.DD format
    if (!fs.existsSync(VERSION_PATH)) {
      console.error(`[ERROR] version.json not Found at ${VERSION_PATH}`);
      return;
    }

    try {
      const jsonContent = fs.readFileSync(VERSION_PATH, 'utf-8');
      const versionData = JSON.parse(jsonContent);

      // Set version to today's date
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      
      versionData.version = `${yyyy}.${mm}.${dd}`;

      fs.writeFileSync(VERSION_PATH, JSON.stringify(versionData, null, 2), 'utf-8');

      console.log(`[INFO] Version Updated: ${versionData.version}`);
    } catch (error) {
      console.error(`[ERROR] Failed to Update Version: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public process(): void {
    try {
      console.log('[INFO] Starting Post Build Process...');

      this.setVersion();

      console.log('[INFO] Post Build Process Completed Successfully');
    } catch (error) {
      console.error(
        `[ERROR] Post Build Process Failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

// Only run if invoked directly, not imported
if (process.argv[1] && process.argv[1].endsWith('build.ts')) {
  new PreBuild().process();
}