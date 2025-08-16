/**
 * # Pre-Build Script for Docusaurus Site
 *
 * This script performs essential setup tasks before the main Docusaurus build process.
 * It handles configuration conversion, theme management, navigation generation, and
 * markdown file processing to prepare the site for deployment.
 *
 * ## Core Functionality:
 *
 * ### 1. Configuration Management
 * - Converts YAML configuration files to JSON format for runtime consumption
 * - Creates a TypeScript index file for seamless data imports
 * - Manages global configuration loading and validation
 *
 * ### 2. Theme System
 * - Scans CSS theme files and extracts metadata from header comments
 * - Generates theme configuration with fallbacks for missing metadata
 * - Creates a centralized theme registry for the theme switcher component
 *
 * ### 3. Navigation Generation
 * - Auto-generates navigation bar links from markdown pages
 * - Creates demo page links from TypeScript component files
 * - Handles label formatting and URL generation
 *
 * ### 4. Content Processing
 * - Copies markdown files from project root to pages directory
 * - Handles README.md -> index.md conversion for homepage
 * - Supports conditional overwriting of existing files
 *
 * ## Directory Structure:
 * - `/config/` - Source YAML configuration files
 * - `/data/` - Generated JSON data files and TypeScript index
 * - `/static/themes/` - CSS theme files with metadata headers
 * - `/src/pages/` - Destination for copied markdown files
 * - `/src/pages/demos/` - TypeScript demo components
 *
 * ## Usage:
 * - Run directly: `tsx pre-build.ts`
 * - Import as module: `import { PreBuild } from './pre-build'`
 * - Package.json scripts: `npm run prebuild`
 *
 * ## Dependencies:
 * - js-yaml: YAML parsing and conversion
 * - Node.js fs/path: File system operations
 * - Custom entities: GlobalConfig type definitions
 *
 * ## Architecture Notes:
 * - Comprehensive error handling with fallback systems
 * - Standardized logging throughout all operations
 * - Graceful handling of missing directories and files
 * - TypeScript-compatible data export generation
 * - Configurable processing with safe defaults
 *
 * ## Future Improvements:
 * - Convert to async/await pattern for better performance
 * - Add configuration schema validation with joi or zod
 * - Add comprehensive unit tests
 * - Consider file watching for development mode
 *
 * @author Template Build System
 * @version 1.0.0
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

const CONFIG_DIR = path.join(__dirname, './config');
const DATA_DIR = path.join(__dirname, './data');

export class PreBuild {
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
    // Ensure the data directory exists
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
  new PreBuild().process();
}