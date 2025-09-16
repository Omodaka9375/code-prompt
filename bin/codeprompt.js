#!/usr/bin/env node
const inquirer = require('inquirer');
const { buildPrompt } = require('../utils/promptBuilder');
const { 
  analyzeProjectContext, 
  optimizePrompt, 
  analyzeTokenEfficiency,
  generatePromptVariations 
} = require('../utils/promptOptimizer');
const fs = require('fs');
const path = require('path');

// Parse CLI flags
const args = process.argv.slice(2);
const shouldSave = args.includes('--save');
const format = args.includes('--format') ? args[args.indexOf('--format') + 1] : 'txt';
const showVariations = args.includes('--variations');
const analyzeOnly = args.includes('--analyze');
const helpFlag = args.includes('--help') || args.includes('-h');

function showHelp() {
  console.log(`
🚀 CodePrompt - Token-efficient AI prompt generator for developers

Usage:
  npx codeprompt [options]

Options:
  --save           Save prompt to file
  --format <type>  Output format (txt|md)
  --variations     Show prompt variations for A/B testing
  --analyze        Analyze project context only
  --help, -h       Show this help message

Examples:
  npx codeprompt --save --format md
  npx codeprompt --variations
  npx codeprompt --analyze

Website: https://codeprompt.me
`);
}

async function main() {
  if (helpFlag) {
    showHelp();
    return;
  }
  
  if (analyzeOnly) {
    const context = analyzeProjectContext();
    console.log('\n🔍 Project Analysis:');
    console.log(JSON.stringify(context, null, 2));
    return;
  }
  const { type } = await inquirer.prompt({
    type: 'list',
    name: 'type',
    message: 'What type of code prompt do you need?',
    choices: [
      { name: '🚀 Initialize Project', value: 'init' },
      { name: '🔧 Build Feature', value: 'feature' },
      { name: '🏢️  Design Architecture', value: 'architecture' },
      { name: '🧪 Create Tests', value: 'testing' },
      { name: '📚 Generate Docs', value: 'docs' },
      { name: '🔧 Fix Issues', value: 'fix' }
    ]
  });

  let options = {};

  // Universal constraints for token efficiency
  const universalQuestions = [
    {
      type: 'list',
      name: 'outputFormat',
      message: 'Preferred output format:',
      choices: [
        { name: '💻 Code only (most efficient)', value: 'code' },
        { name: '📝 Code with comments', value: 'commented' },
        { name: '📋 Code with setup steps', value: 'guided' },
        { name: '📖 Detailed explanation', value: 'detailed' }
      ],
      default: 'code'
    },
    {
      type: 'list',
      name: 'complexity',
      message: 'Implementation complexity:',
      choices: [
        { name: '🎯 Simple (<50 lines)', value: 'simple' },
        { name: '⚡ Standard (<200 lines)', value: 'medium' },
        { name: '🔥 Full featured', value: 'complex' }
      ],
      default: 'simple'
    }
  ];

  // Type-specific questions
  switch (type) {
    case 'init':
      options = await inquirer.prompt([
        {
          name: 'projectName',
          message: 'Project name (optional):',
          validate: input => true, // Allow empty for optional field
          transformer: input => input.trim(),
          filter: input => input.trim() || undefined // Convert empty string to undefined
        },
        {
          type: 'list',
          name: 'projectType',
          message: 'Project type:',
          choices: ['node', 'browser', 'full-stack', 'cli', 'library']
        },
        {
          type: 'list',
          name: 'framework',
          message: 'Framework/library:',
          choices: [
            { name: '⚡ Vanilla JS', value: 'vanilla' },
            { name: '⚛️ React', value: 'react' },
            { name: '💚 Vue.js', value: 'vue' },
            { name: '🔺 Angular', value: 'angular' },
            { name: '🧡 Svelte', value: 'svelte' },
            { name: '🚀 Express', value: 'express' },
            { name: '⚡ Fastify', value: 'fastify' },
            { name: '🐱 NestJS', value: 'nest' },
            { name: '▲ Next.js', value: 'next' },
            { name: '💚 Nuxt.js', value: 'nuxt' },
            { name: '🟣 Gatsby', value: 'gatsby' },
            { name: '🚀 Astro', value: 'astro' },
            { name: '⚡ Vite', value: 'vite' },
            { name: '📦 Webpack', value: 'webpack' },
            { name: '📊 Rollup', value: 'rollup' },
            { name: '⚡ ESBuild', value: 'esbuild' },
            { name: '⚡ Electron', value: 'electron' },
            { name: '🦀 Tauri', value: 'tauri' },
            { name: '🛠️ Other/Custom', value: 'other' }
          ],
          default: 'vanilla'
        },
        {
          name: 'customFramework',
          message: 'Custom framework name:',
          when: (answers) => answers.framework === 'other',
          validate: input => input.length > 0 || 'Custom framework name is required'
        },
        {
          type: 'list',
          name: 'packageManager',
          message: 'Package manager:',
          choices: [
            { name: '⚡ pnpm', value: 'pnpm' },
            { name: '📦 npm', value: 'npm' },
            { name: '🧶 Yarn', value: 'yarn' },
            { name: '🚫 None (no package manager)', value: 'none' }
          ],
          default: 'pnpm'
        },
        {
          type: 'list',
          name: 'structure',
          message: 'Project structure:',
          choices: [
            { name: '📁 Flat (single directory)', value: 'flat' },
            { name: '🗂️  Layered (organized folders)', value: 'layered' },
            { name: '🧩 Modular (feature-based)', value: 'modular' },
            { name: '📦 Monorepo (multiple packages)', value: 'monorepo' }
          ]
        },
        {
          type: 'list',
          name: 'dependencies',
          message: 'Dependencies preference:',
          choices: [
            { name: '🚫 None (pure implementation)', value: 'none' },
            { name: '🎯 Minimal only', value: 'minimal' },
            { name: '📦 Standard libraries', value: 'standard' }
          ]
        },
        ...universalQuestions
      ]);
      break;

    case 'feature':
      options = await inquirer.prompt([
        {
          name: 'feature',
          message: 'Feature name:',
          validate: input => input.length > 0 || 'Feature name is required'
        },
        {
          type: 'list',
          name: 'pattern',
          message: 'Implementation pattern:',
          choices: [
            { name: '⚡ Pure Functions', value: 'function' },
            { name: '🏗️  Class-based', value: 'class' },
            { name: '🪝 React Hook', value: 'hook' },
            { name: '🔧 Service Layer', value: 'service' }
          ]
        },
        {
          type: 'list',
          name: 'scope',
          message: 'Feature scope:',
          choices: [
            { name: '🧩 Single component', value: 'component' },
            { name: '📦 Complete module', value: 'module' },
            { name: '🎯 Full feature set', value: 'feature' }
          ]
        },
        {
          type: 'list',
          name: 'codeStyle',
          message: 'Code style preference:',
          choices: [
            { name: '🔄 Functional programming', value: 'functional' },
            { name: '🏗️  Object-oriented', value: 'oop' },
            { name: '✨ Minimal & clean', value: 'minimal' }
          ]
        },
        {
          type: 'list',
          name: 'fileStructure',
          message: 'File organization:',
          choices: [
            { name: '📄 Single file', value: 'single' },
            { name: '📂 Separate by concern', value: 'split' },
            { name: '🗂️  Modular structure', value: 'modular' }
          ]
        },
        ...universalQuestions
      ]);
      break;

    case 'architecture':
      options = await inquirer.prompt([
        {
          name: 'feature',
          message: 'Component/system to architect:',
          validate: input => input.length > 0 || 'Component name is required'
        },
        {
          type: 'list',
          name: 'pattern',
          message: 'Architecture pattern:',
          choices: [
            { name: '🎯 MVC (Model-View-Controller)', value: 'mvc' },
            { name: '🏗️  Layered Architecture', value: 'layered' },
            { name: '🔗 Hexagonal/Ports-Adapters', value: 'hexagonal' },
            { name: '🧩 Microservice', value: 'microservice' }
          ]
        },
        ...universalQuestions
      ]);
      break;

    case 'testing':
      options = await inquirer.prompt([
        {
          name: 'module',
          message: 'Module/component to test:',
          validate: input => input.length > 0 || 'Module name is required'
        },
        {
          type: 'list',
          name: 'testType',
          message: 'Test type:',
          choices: [
            { name: '🧪 Unit tests', value: 'unit' },
            { name: '🔗 Integration tests', value: 'integration' },
            { name: '🎭 End-to-end tests', value: 'e2e' }
          ]
        },
        {
          type: 'list',
          name: 'library',
          message: 'Testing library:',
          choices: [
            { name: '🃏 Jest - Most popular, full-featured', value: 'Jest' },
            { name: '⚡ Vitest - Vite-native, fast', value: 'Vitest' },
            { name: '🏃 Mocha - Flexible, lightweight', value: 'Mocha' },
            { name: '🥒 Cypress - E2E testing powerhouse', value: 'Cypress' },
            { name: '🎭 Playwright - Cross-browser E2E', value: 'Playwright' },
            { name: '🧪 Testing Library - React/DOM testing', value: 'Testing Library' },
            { name: '🌐 WebdriverIO - Selenium-based', value: 'WebdriverIO' },
            { name: '🦆 Puppeteer - Headless Chrome', value: 'Puppeteer' },
            { name: '📋 Jasmine - Behavior-driven testing', value: 'Jasmine' },
            { name: '🎯 AVA - Concurrent test runner', value: 'AVA' },
            { name: '📚 Storybook - Component testing', value: 'Storybook' },
            { name: '🔧 Karma - Test runner for Angular', value: 'Karma' },
            { name: '🛠️ Custom/Other', value: 'Other' }
          ],
          default: 'Jest'
        },
        {
          name: 'customLibrary',
          message: 'Custom testing library name:',
          when: (answers) => answers.library === 'Other',
          validate: input => input.length > 0 || 'Custom library name is required'
        },
        {
          type: 'list',
          name: 'coverage',
          message: 'Target coverage:',
          choices: ['80', '90', '95', '100'],
          default: '80'
        },
        ...universalQuestions
      ]);
      break;

    case 'docs':
      options = await inquirer.prompt([
        {
          name: 'projectName',
          message: 'Project/Component/Feature to document:',
          validate: input => input.length > 0 || 'Project name is required',
          placeholder: 'e.g., user-auth-api, payment-system, react-components...'
        },
        {
          type: 'list',
          name: 'docType',
          message: 'Documentation type:',
          choices: [
            { name: '📋 API Documentation', value: 'api' },
            { name: '👤 User Guide', value: 'user' },
            { name: '⚙️ Developer Setup', value: 'dev' },
            { name: '🏢️ Architecture Overview', value: 'arch' },
            { name: '📝 Changelog', value: 'changelog' },
            { name: '🤝 Contributing Guidelines', value: 'contributing' },
            { name: '🛡️ Security Documentation', value: 'security' },
            { name: '📊 Performance Guide', value: 'performance' }
          ]
        },
        {
          type: 'list',
          name: 'format',
          message: 'Documentation format:',
          choices: [
            { name: '📝 Markdown (.md)', value: 'markdown' },
            { name: '📄 Plain Text (.txt)', value: 'text' },
            { name: '🌐 HTML', value: 'html' },
            { name: '📊 JSON (API specs)', value: 'json' },
            { name: '📈 YAML (OpenAPI)', value: 'yaml' },
            { name: '📎 reStructuredText (.rst)', value: 'rst' }
          ],
          default: 'markdown'
        },
        {
          type: 'confirm',
          name: 'includeDiagrams',
          message: 'Include diagrams and visual elements?',
          default: true
        },
        {
          type: 'checkbox',
          name: 'diagramTypes',
          message: 'Select diagram types to include:',
          when: (answers) => answers.includeDiagrams,
          choices: [
            { name: '📊 Flow Charts - Process flows and workflows', value: 'flowchart' },
            { name: '🏢 Architecture Diagrams - System architecture', value: 'architecture' },
            { name: '💾 Database Schemas - Entity relationships', value: 'database' },
            { name: '🔁 Sequence Diagrams - API interactions', value: 'sequence' },
            { name: '🦆 Class Diagrams - Object relationships', value: 'class' },
            { name: '🌐 Network Diagrams - Infrastructure layout', value: 'network' },
            { name: '📊 Gantt Charts - Project timelines', value: 'gantt' },
            { name: '🗺 Mindmaps - Concept relationships', value: 'mindmap' }
          ],
          default: ['flowchart', 'architecture']
        },
        {
          type: 'list',
          name: 'diagramTool',
          message: 'Preferred diagramming tool/syntax:',
          when: (answers) => answers.includeDiagrams && answers.diagramTypes?.length > 0,
          choices: [
            { name: '🌊 Mermaid - GitHub/GitLab compatible', value: 'mermaid' },
            { name: '🎨 PlantUML - Comprehensive UML', value: 'plantuml' },
            { name: '📝 ASCII Art - Text-based diagrams', value: 'ascii' },
            { name: '🗺 Draw.io - Visual descriptions', value: 'drawio' },
            { name: '📊 Graphviz - DOT notation', value: 'graphviz' },
            { name: '🛠️ Custom/Other', value: 'other' }
          ],
          default: 'mermaid'
        },
        {
          name: 'customDiagramTool',
          message: 'Custom diagramming tool/syntax:',
          when: (answers) => answers.diagramTool === 'other',
          validate: input => input.length > 0 || 'Custom diagram tool is required'
        },
        {
          type: 'list',
          name: 'detailLevel',
          message: 'Documentation detail level:',
          choices: [
            { name: '🎯 Minimal - Key points only', value: 'minimal' },
            { name: '📚 Standard - Comprehensive coverage', value: 'standard' },
            { name: '🔍 Detailed - In-depth with examples', value: 'detailed' },
            { name: '🎓 Tutorial - Step-by-step guide', value: 'tutorial' }
          ],
          default: 'standard'
        },
        {
          type: 'confirm',
          name: 'includeExamples',
          message: 'Include code examples and snippets?',
          default: true
        },
        {
          type: 'confirm',
          name: 'includeToc',
          message: 'Generate table of contents?',
          default: true
        },
        ...universalQuestions
      ]);
      break;
      
    case 'fix':
      options = await inquirer.prompt([
        {
          name: 'issue',
          message: 'Issue/Bug description:',
          validate: input => input.length > 0 || 'Issue description is required'
        },
        {
          name: 'component',
          message: 'Component/Module affected:',
          validate: input => input.length > 0 || 'Component name is required'
        },
        {
          type: 'list',
          name: 'approach',
          message: 'Fix approach:',
          choices: [
            { name: '🔍 Systematic debugging', value: 'debug' },
            { name: '🛠️  Code refactoring', value: 'refactor' },
            { name: '⚡ Performance optimization', value: 'optimize' },
            { name: '🩹 Minimal patch fix', value: 'patch' },
            { name: '✨ Partial rewrite', value: 'rewrite' }
          ]
        },
        {
          type: 'list',
          name: 'priority',
          message: 'Priority level:',
          choices: [
            { name: '🔥 Critical', value: 'critical' },
            { name: '⚠️  High', value: 'high' },
            { name: '📋 Medium', value: 'medium' },
            { name: '📝 Low', value: 'low' }
          ],
          default: 'medium'
        },
        {
          name: 'errorMessage',
          message: 'Error message (optional):'
        },
        ...universalQuestions
      ]);
      break;
  }

  // Analyze project context for optimization
  const projectContext = analyzeProjectContext();
  
  // Build and optimize prompt
  const basePrompt = buildPrompt(type, options);
  const prompt = optimizePrompt(basePrompt, options, projectContext);
  
  // Analyze prompt efficiency
  const analysis = analyzeTokenEfficiency(prompt);
  
  console.log('\n🧠 Optimized AI Prompt:\n');
  console.log(`\x1b[36m${prompt}\x1b[0m`);
  
  console.log(`\n📊 Token Efficiency: \x1b[32m${analysis.efficiency}\x1b[0m (${analysis.estimatedTokens} tokens)`);
  
  if (analysis.recommendations.length > 0) {
    console.log('\n💡 Optimization Tips:');
    analysis.recommendations.forEach(tip => console.log(`  • ${tip}`));
  }
  
  // Show context-aware optimizations
  if (Object.keys(projectContext).length > 0) {
    console.log('\n🔍 Detected Context:');
    if (projectContext.hasTypeScript) console.log('  • TypeScript project');
    if (projectContext.hasReact) console.log('  • React framework');
    if (projectContext.packageManager !== 'npm') console.log(`  • ${projectContext.packageManager} package manager`);
    if (projectContext.hasLinting) console.log('  • ESLint configured');
    if (projectContext.hasFormatting) console.log('  • Prettier configured');
  }
  
  // Show prompt variations if requested
  if (showVariations) {
    const variations = generatePromptVariations(basePrompt, options);
    console.log('\n🧪 Prompt Variations for A/B Testing:\n');
    variations.forEach((variation, index) => {
      console.log(`\x1b[33m${index + 1}. ${variation.name}\x1b[0m`);
      console.log(`   ${variation.description}`);
      console.log(`   \x1b[36m${variation.prompt}\x1b[0m\n`);
    });
  }

  if (shouldSave) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const ext = format === 'md' ? 'md' : 'txt';
    const filename = `prompt-${type}-${timestamp}.${ext}`;
    const filepath = path.join(process.cwd(), filename);

    let content;
    if (format === 'md') {
      content = `# AI Prompt: ${type}\n\n## Prompt\n\`\`\`\n${prompt}\n\`\`\`\n\n## Analysis\n- **Token Count:** ${analysis.estimatedTokens}\n- **Efficiency:** ${analysis.efficiency}\n\n## Options\n\`\`\`json\n${JSON.stringify(options, null, 2)}\n\`\`\`\n\n## Project Context\n\`\`\`json\n${JSON.stringify(projectContext, null, 2)}\n\`\`\`\n`;
    } else {
      content = `${prompt}\n\n--- ANALYSIS ---\nTokens: ${analysis.estimatedTokens}\nEfficiency: ${analysis.efficiency}\n\n--- OPTIONS ---\n${JSON.stringify(options, null, 2)}`;
    }

    fs.writeFileSync(filepath, content);
    console.log(`\n\u2705 Enhanced prompt saved to ${filename}`);
    console.log(`   Includes analysis and metadata for optimization tracking`);
  }
}

main();