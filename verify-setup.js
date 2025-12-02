#!/usr/bin/env node

/**
 * Setup verification script for Next.js Todo App
 * Run this script to verify that all dependencies and configuration are correct
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verifying Next.js Todo App Setup...\n');

const checks = [
  {
    name: 'Package.json dependencies',
    check: () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')
      );
      const requiredDeps = ['next', 'react', 'drizzle-orm', 'postgres', 'swr'];
      const missing = requiredDeps.filter(
        (dep) => !packageJson.dependencies[dep]
      );
      return missing.length === 0
        ? null
        : `Missing dependencies: ${missing.join(', ')}`;
    },
  },
  {
    name: 'Environment file',
    check: () => {
      return fs.existsSync(path.join(__dirname, '.env.local'))
        ? null
        : '.env.local file not found';
    },
  },
  {
    name: 'Database schema',
    check: () => {
      return fs.existsSync(path.join(__dirname, 'db', 'schema.js'))
        ? null
        : 'Database schema file not found';
    },
  },
  {
    name: 'Component files',
    check: () => {
      const components = [
        'TodoApp.jsx',
        'TodoForm.jsx',
        'TodoItem.jsx',
        'TodoList.jsx',
      ];
      const missing = components.filter(
        (comp) =>
          !fs.existsSync(path.join(__dirname, 'src', 'components', comp))
      );
      return missing.length === 0
        ? null
        : `Missing components: ${missing.join(', ')}`;
    },
  },
  {
    name: 'Server actions',
    check: () => {
      return fs.existsSync(path.join(__dirname, 'src', 'lib', 'actions.js'))
        ? null
        : 'Server actions file not found';
    },
  },
];

let allPassed = true;

checks.forEach(({ name, check }, index) => {
  try {
    const result = check();
    if (result) {
      console.log(`❌ ${index + 1}. ${name}: ${result}`);
      allPassed = false;
    } else {
      console.log(`✅ ${index + 1}. ${name}: OK`);
    }
  } catch (error) {
    console.log(`❌ ${index + 1}. ${name}: Error - ${error.message}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 All checks passed! Your Todo App is ready to run.');
  console.log('\nNext steps:');
  console.log('1. Update DATABASE_URL in .env.local');
  console.log('2. Run: npm run db:push');
  console.log('3. Run: npm run dev');
} else {
  console.log('❌ Some checks failed. Please fix the issues above.');
}

console.log('\n📖 For detailed setup instructions, see README.md');
