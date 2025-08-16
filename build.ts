import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

const CONFIG_DIR = path.join(__dirname, './config');
const DATA_DIR = path.join(__dirname, './artifacts');

export class Build {
  constructor() {
    this.setupConfig();
  }

  private setupConfig(): void {
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

  private processYamlToJson(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(CONFIG_DIR)) {
      console.warn(`[WARN] Config Directory Not Found: ${CONFIG_DIR}`);
      return;
    }

    let processedCount = 0;

    // Helper function to recursively process YAML files
    const processDir = (srcDir: string, destDir: string) => {
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      const entries = fs.readdirSync(srcDir, { withFileTypes: true });
      entries.forEach((entry) => {
        const srcPath = path.join(srcDir, entry.name);
        const destPath = path.join(destDir, entry.name);

        if (entry.isDirectory()) {
          processDir(srcPath, destPath);
        } else if (entry.isFile() && (entry.name.endsWith('.yml') || entry.name.endsWith('.yaml'))) {
          try {
            const yamlContent = fs.readFileSync(srcPath, 'utf-8');
            const jsonData = yaml.load(yamlContent);
            const jsonFileName = entry.name.replace(/\.(yml|yaml)$/, '.json');
            const jsonFilePath = path.join(destDir, jsonFileName);
            
            fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf-8');
            console.log(`[INFO] Converted ${srcPath.replace(CONFIG_DIR + '\\', '')} --> ${jsonFilePath.replace(DATA_DIR + '\\', '')}`);

            processedCount++;
          } catch (error) {
            console.error(
              `[ERROR] Failed to Process ${srcPath}: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        }
      });
    };

    processDir(CONFIG_DIR, DATA_DIR);

    console.log(
      `[INFO] YAML to JSON Conversion Completed: ${processedCount} File(s) Processed`
    );
  }

  public process(): void {
    try {
      console.log('[INFO] Starting Build Process...');

      this.processYamlToJson();

      console.log('[INFO] Build Process Completed Successfully');
    } catch (error) {
      console.error(
        `[ERROR] Build Process Failed: ${error instanceof Error ? error.message : String(error)}`
      );

      // Don't throw the error, just log it so the build can continue
      console.warn('[WARN] Continuing with Build Despite Pre-Build Errors');
    }
  }
}

// Only run if invoked directly, not imported
if (process.argv[1] && process.argv[1].endsWith('build.ts')) {
  new Build().process();
}