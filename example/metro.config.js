const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
// 
// THIS IS THE FIX:
// We add the workspace root to the existing watchFolders, 
// instead of overwriting the array.
config.watchFolders.push(workspaceRoot);

// 2. Let Metro handle the monorepo packages
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// --- Refactored Custom Resolver ---

// Helper function to resolve package source files
function resolvePackageSource(packagePath, subpath) {
  // Build the base path to the src directory
  const basePath = subpath
    ? path.join(packagePath, 'src', subpath)
    : path.join(packagePath, 'src', 'index');

  // Try different extensions for files
  const extensions = ['.tsx', '.ts', '.native.tsx', '.native.ts', '.js', '.jsx'];
  for (const ext of extensions) {
    const filePath = basePath + ext;
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return {
        type: 'sourceFile',
        filePath: filePath,
      };
    }
  }

  // If no file found, try as directory with /index
  if (fs.existsSync(basePath) && fs.statSync(basePath).isDirectory()) {
    for (const ext of extensions) {
      const filePath = path.join(basePath, 'index' + ext);
      if (fs.existsSync(filePath)) {
        return {
          type: 'sourceFile',
          filePath: filePath,
        };
      }
    }
  }

  // If nothing is found, return null
  return null;
}

// 3. Custom resolver to point to src instead of dist
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Map of package prefixes to their source directory
  const packageMap = {
    '@rneui/base': path.resolve(workspaceRoot, 'packages/base'),
    '@rneui/themed': path.resolve(workspaceRoot, 'packages/themed'),
    // Add other @rneui packages here as needed
  };

  for (const prefix in packageMap) {
    if (moduleName.startsWith(prefix)) {
      const packagePath = packageMap[prefix];

      // Remove the package name prefix
      let subpath = moduleName.replace(prefix, '').replace(/^\//, '');
      
      // Remove 'dist/' if it's in the path (e.g., '@rneui/base/dist/Badge')
      subpath = subpath.replace(/^dist\//, '');
      
      const result = resolvePackageSource(packagePath, subpath);
      if (result) {
        return result;
      }
      
      // If our custom resolver finds a match but fails to resolve,
      // we break and let the default resolver handle it.
      break;
    }
  }

  // Let the default resolver handle everything else
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;