import { readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

/**
 * Expand ~ to the user's home directory
 *
 * @param {String} filepath The path to expand
 * @returns {String}
 */
function expandHome(filepath) {
  if (filepath.startsWith('~/')) {
    return join(homedir(), filepath.slice(2));
  }
  return filepath;
}

/**
 * Parse the projects_directories configuration value into an array of paths
 *
 * @param {String} configValue The configuration value (newline-separated paths)
 * @returns {String[]}
 */
function parseDirectories(configValue) {
  if (!configValue || configValue.trim() === '') {
    return [];
  }
  return configValue
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .map(expandHome);
}

/**
 * Scan a directory and return all first-level subdirectories as projects
 *
 * @param {String} dirPath The directory path to scan
 * @returns {Object[]} Array of project objects
 */
function scanDirectory(dirPath) {
  try {
    const entries = readdirSync(dirPath, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
      .map((entry) => {
        const fullPath = join(dirPath, entry.name);
        const folderUri = `file://${fullPath}`;

        return {
          title: entry.name,
          subtitle: fullPath,
          folderUri,
          uid: folderUri,
          type: 'Local',
          icon: { path: 'icon.png' },
          source: 'directory',
        };
      });
  } catch (err) {
    // Silently ignore inaccessible directories
    return [];
  }
}

/**
 * Get all projects from configured directories
 * Reads the projects_directories environment variable and scans each directory
 *
 * @public
 * @returns {Object[]} Array of project objects from all configured directories
 */
function getProjectsFromDirectories() {
  const configValue = process.env.projects_directories || '';
  const directories = parseDirectories(configValue);

  return directories.flatMap((dir) => scanDirectory(dir));
}

export default getProjectsFromDirectories;
