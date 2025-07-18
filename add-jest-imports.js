#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of files that need the @jest/globals import
const filesToProcess = [
  'packages/themed/src/Tooltip/__tests__/Tooltip.test.tsx',
  'packages/themed/src/Card/__tests__/Card.test.tsx',
  'packages/themed/src/ButtonGroup/__tests__/ButtonGroup.test.tsx',
  'packages/themed/src/config/__tests__/withTheme.test.tsx',
  'packages/themed/src/config/__tests__/ThemeProvider.test.tsx',
  'packages/themed/src/config/__tests__/makeStyles.test.tsx',
  'packages/themed/src/Input/__tests__/Input.test.tsx',
  'packages/themed/src/PricingCard/__tests__/PricingCard.test.tsx',
  'packages/themed/src/Skeleton/__tests__/Skeleton.test.tsx',
  'packages/themed/src/Chip/__tests__/Chip.test.tsx',
  'packages/themed/src/FAB/__tests__/FAB.test.tsx',
  'packages/themed/src/CheckBox/__tests__/CheckBox.test.tsx',
  'packages/themed/src/Slider/__tests__/Slider.test.tsx',
  'packages/themed/src/SocialIcon/__tests__/SocialIcon.test.tsx',
  'packages/themed/src/Tile/__tests__/FeaturedTile.test.tsx',
  'packages/themed/src/Tile/__tests__/Tile.test.tsx',
  'packages/themed/src/Tab/__tests__/Tab.test.tsx',
  'packages/themed/src/Image/__tests__/Image.test.tsx',
  'packages/themed/src/ListItem/__tests__/ListItem.test.tsx',
  'packages/themed/src/Dialog/__tests__/Dialog.test.tsx',
  'packages/themed/src/TabView/__tests__/TabView.test.tsx',
  'packages/themed/src/SpeedDial/__tests__/SpeedDial.test.tsx',
  'packages/themed/src/Divider/__tests__/Divider.test.tsx',
  'packages/themed/src/BottomSheet/__tests__/BottomSheet.test.tsx',
  'packages/themed/src/Avatar/__tests__/Avatar.test.tsx',
  'packages/themed/src/Switch/__tests__/Switch.test.tsx',
  'packages/themed/src/Text/__tests__/Text.test.tsx',
  'packages/themed/src/Icon/__tests__/Icon.test.tsx',
  'packages/themed/src/Overlay/__tests__/Overlay.test.tsx',
  'packages/themed/src/Header/__tests__/Header.test.tsx',
  'packages/themed/src/LinearProgress/__tests__/LinearProgress.test.tsx',
  'packages/themed/src/Badge/__tests__/withBadge.test.tsx',
  'packages/themed/src/Badge/__tests__/Badge.test.tsx',
  'packages/base/src/Card/__tests__/Card.test.tsx',
  'packages/base/src/ButtonGroup/__tests__/ButtonGroup.test.tsx',
  'packages/base/src/PricingCard/__tests__/PricingCard.test.tsx',
  'packages/base/src/Skeleton/__tests__/Skeleton.test.tsx',
  'packages/base/src/Chip/__tests__/Chip.test.tsx',
  'packages/base/src/FAB/__tests__/FAB.test.tsx',
  'packages/base/src/CheckBox/__tests__/CheckBox.test.tsx',
  'packages/base/src/Slider/__tests__/Slider.test.tsx',
  'packages/base/src/SocialIcon/__tests__/SocialIcon.test.tsx',
  'packages/base/src/Tile/__tests__/FeaturedTile.test.tsx',
  'packages/base/src/Tile/__tests__/Tile.test.tsx',
  'packages/base/src/Tab/__tests__/Tab.test.tsx',
  'packages/base/src/Image/__tests__/Image.test.tsx',
  'packages/base/src/ListItem/__tests__/ListItem.test.tsx',
  'packages/base/src/Dialog/__tests__/Dialog.test.tsx',
  'packages/base/src/TabView/__tests__/TabView.test.tsx',
  'packages/base/src/SpeedDial/__tests__/SpeedDial.Action.test.tsx',
  'packages/base/src/SpeedDial/__tests__/SpeedDial.test.tsx',
  'packages/base/src/Button/__tests__/Button.test.tsx',
  'packages/base/src/Divider/__tests__/Divider.test.tsx',
  'packages/base/src/BottomSheet/__tests__/BottomSheet.test.tsx',
  'packages/base/src/Switch/__tests__/Switch.test.tsx',
  'packages/base/src/Text/__tests__/Text.test.tsx',
  'packages/base/src/Icon/__tests__/Icon.test.tsx',
  'packages/base/src/Overlay/__tests__/Overlay.test.tsx',
  'packages/base/src/helpers/__tests__/colors.test.tsx',
  'packages/base/src/Header/__tests__/Header.test.tsx',
  'packages/base/src/LinearProgress/__tests__/LinearProgress.test.tsx',
];

function detectJestGlobals(content) {
  const jestGlobals = [];
  
  if (content.includes('describe(')) {
    jestGlobals.push('describe');
  }
  if (content.includes('it(')) {
    jestGlobals.push('it');
  }
  if (content.includes('test(')) {
    jestGlobals.push('test');
  }
  if (content.includes('expect(')) {
    jestGlobals.push('expect');
  }
  if (content.includes('beforeEach(')) {
    jestGlobals.push('beforeEach');
  }
  if (content.includes('afterEach(')) {
    jestGlobals.push('afterEach');
  }
  if (content.includes('beforeAll(')) {
    jestGlobals.push('beforeAll');
  }
  if (content.includes('afterAll(')) {
    jestGlobals.push('afterAll');
  }
  if (content.includes('jest.')) {
    jestGlobals.push('jest');
  }
  
  return [...new Set(jestGlobals)]; // Remove duplicates
}

function addJestImport(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Skip if already has @jest/globals import
    if (content.includes('@jest/globals')) {
      console.log(`Skipping ${filePath} - already has @jest/globals import`);
      return;
    }
    
    // Detect which Jest globals are used
    const jestGlobals = detectJestGlobals(content);
    
    if (jestGlobals.length === 0) {
      console.log(`Skipping ${filePath} - no Jest globals detected`);
      return;
    }
    
    // Find the position to insert the import (after last import statement)
    const lines = content.split('\n');
    let lastImportIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ') && !lines[i].includes('@jest/globals')) {
        lastImportIndex = i;
      }
    }
    
    if (lastImportIndex === -1) {
      // No imports found, add at the beginning
      lastImportIndex = 0;
    }
    
    // Create the import statement
    const importStatement = `import { ${jestGlobals.join(', ')} } from '@jest/globals';`;
    
    // Insert the import statement
    lines.splice(lastImportIndex + 1, 0, importStatement);
    
    // Write the file back
    const newContent = lines.join('\n');
    fs.writeFileSync(fullPath, newContent, 'utf8');
    
    console.log(`✓ Added @jest/globals import to ${filePath} (globals: ${jestGlobals.join(', ')})`);
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Process all files
console.log('Adding @jest/globals imports to test files...\n');

filesToProcess.forEach(filePath => {
  addJestImport(filePath);
});

console.log('\nCompleted processing all test files.');
