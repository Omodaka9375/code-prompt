/**
 * Browser-compatible version of promptBuilder and promptOptimizer
 * Adapted from Node.js modules for web use
 */

// Token-efficient prompt templates with precise constraints
const PROMPT_TEMPLATES = {
  init: {
    base: "Create {{projectType}} project with {{framework}}",
    withProjectName: "Create {{projectType}} project called '{{projectName}}' with {{framework}}",
    constraints: {
      minimal: "Bare minimum setup",
      standard: "Common dev tools included",
      full: "Complete dev environment"
    },
    structure: {
      flat: "Single directory",
      layered: "Organized folders",
      modular: "Feature-based structure",
      monorepo: "Monorepo with multiple packages"
    }
  },
  feature: {
    base: "Implement {{feature}} as {{pattern}}",
    patterns: {
      function: "pure functions",
      class: "class-based module",
      hook: "React hook",
      service: "service layer"
    },
    scope: {
      component: "single component",
      module: "complete module",
      feature: "full feature set"
    }
  },
  architecture: {
    base: "Design {{feature}} using {{pattern}} pattern",
    patterns: {
      mvc: "MVC",
      layered: "layered architecture",
      hexagonal: "hexagonal/ports-adapters",
      microservice: "microservice"
    }
  },
  testing: {
    base: "Write {{testType}} tests for {{module}} using {{library}}",
    types: {
      unit: "unit",
      integration: "integration",
      e2e: "end-to-end"
    }
  },
  docs: {
    base: "Generate {{docType}} documentation for {{projectName}}",
    types: {
      api: "API documentation",
      user: "user guide",
      dev: "developer setup",
      arch: "architecture overview",
      changelog: "changelog",
      contributing: "contributing guidelines",
      security: "security documentation",
      performance: "performance guide"
    }
  },
  fix: {
    base: "Fix {{issue}} in {{component}} using {{approach}}",
    approaches: {
      debug: "systematic debugging",
      refactor: "code refactoring",
      optimize: "performance optimization",
      patch: "minimal patch fix",
      rewrite: "partial rewrite"
    },
    priorities: {
      critical: "critical priority",
      high: "high priority",
      medium: "medium priority",
      low: "low priority"
    }
  }
};

// Output format specifications for token efficiency
const OUTPUT_FORMATS = {
  code: "Code only, no explanations, no markdown",
  commented: "Code with inline comments",
  guided: "Code with brief setup steps",
  detailed: "Code with comprehensive explanation"
};

// Complexity constraints to limit AI response size
const COMPLEXITY_LEVELS = {
  simple: "Basic implementation, <50 lines",
  medium: "Standard features, <200 lines",
  complex: "Full implementation, optimized"
};

// Context is now determined by user selections in the UI

/**
 * Builds base prompt from template and options
 * @param {string} type - Scaffold type
 * @param {Object} options - User options
 * @returns {string} Base prompt
 */
function buildPrompt(type, options) {
  const template = PROMPT_TEMPLATES[type];
  if (!template) return 'Unknown prompt type.';

  // Ensure we have all required options with fallbacks
  const fallbackValues = {
    projectType: 'node',
    framework: 'vanilla',
    feature: 'component',
    pattern: 'function',
    module: 'service',
    testType: 'unit',
    library: 'Jest',
    docType: 'api',
    projectName: 'project',
    issue: 'bug',
    component: 'component',
    approach: 'debug'
  };
  
  // Merge options with fallbacks
  const completeOptions = { ...fallbackValues, ...options };
  
  // Build base prompt with variable substitution
  let prompt = template.base;
  
  // Handle custom framework logic
  if (completeOptions.framework === 'other' && completeOptions.customFramework) {
    completeOptions.framework = completeOptions.customFramework;
  }
  
  // Replace all template variables with complete options
  // Skip specific replacements that need special handling in switch statement
  Object.keys(completeOptions).forEach(key => {
    if (type === 'docs' && key === 'docType') {
      return; // Skip docType replacement for docs - handle in switch statement
    }
    if (type === 'init' && key === 'projectName') {
      return; // Skip projectName replacement for init - handle in switch statement
    }
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    prompt = prompt.replace(regex, completeOptions[key] || fallbackValues[key] || 'default');
  });
  
  // Add constraints for token efficiency
  const constraints = [];
  
  // Output format constraint
  if (completeOptions.outputFormat && OUTPUT_FORMATS[completeOptions.outputFormat]) {
    constraints.push(OUTPUT_FORMATS[completeOptions.outputFormat]);
  }
  
  // Complexity constraint
  if (completeOptions.complexity && COMPLEXITY_LEVELS[completeOptions.complexity]) {
    constraints.push(COMPLEXITY_LEVELS[completeOptions.complexity]);
  }
  
  // Code style preferences
  if (completeOptions.codeStyle) {
    const styles = {
      functional: "Functional programming style",
      oop: "Object-oriented approach",
      minimal: "Minimal, clean code"
    };
    if (styles[completeOptions.codeStyle]) {
      constraints.push(styles[completeOptions.codeStyle]);
    }
  }
  
  // File structure preference
  if (completeOptions.fileStructure) {
    const structures = {
      single: "Single file solution",
      split: "Separate files by concern",
      modular: "Modular file structure"
    };
    if (structures[completeOptions.fileStructure]) {
      constraints.push(structures[completeOptions.fileStructure]);
    }
  }
  
  // Dependencies preference
  if (completeOptions.dependencies) {
    const deps = {
      none: "No external dependencies",
      minimal: "Minimal dependencies only",
      standard: "Common libraries allowed"
    };
    if (deps[completeOptions.dependencies]) {
      constraints.push(deps[completeOptions.dependencies]);
    }
  }
  
  // Add type-specific enhancements
  switch (type) {
    case 'init':
      // Use different template based on whether project name is provided by user
      const userProjectName = options.projectName; // Get original user input, not merged with fallback
      if (userProjectName && userProjectName.trim() !== '') {
        // Replace current prompt with the version that includes project name
        prompt = template.withProjectName;
        // Now do the normal replacement for all variables including projectName
        Object.keys(completeOptions).forEach(key => {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
          prompt = prompt.replace(regex, completeOptions[key] || fallbackValues[key] || 'default');
        });
      }
      // If no project name, we keep the base template which doesn't include {{projectName}}
      
      if (completeOptions.packageManager) {
        if (completeOptions.packageManager === 'none') {
          constraints.push('No package manager needed - pure static files');
        } else {
          constraints.push(`Use ${completeOptions.packageManager} with latest best practices`);
        }
      }
      if (completeOptions.structure && template.structure[completeOptions.structure]) {
        constraints.push(template.structure[completeOptions.structure]);
      }
      break;
      
    case 'feature':
      if (completeOptions.pattern && template.patterns[completeOptions.pattern]) {
        const regex = new RegExp('\\{\\{pattern\\}\\}', 'g');
        prompt = prompt.replace(regex, template.patterns[completeOptions.pattern]);
      }
      if (completeOptions.scope && template.scope[completeOptions.scope]) {
        constraints.push(`Scope: ${template.scope[completeOptions.scope]}`);
      }
      break;
      
    case 'architecture':
      if (completeOptions.pattern && template.patterns[completeOptions.pattern]) {
        const regex = new RegExp('\\{\\{pattern\\}\\}', 'g');
        prompt = prompt.replace(regex, template.patterns[completeOptions.pattern]);
      }
      break;
      
    case 'testing':
      if (completeOptions.testType && template.types[completeOptions.testType]) {
        const regex = new RegExp('\\{\\{testType\\}\\}', 'g');
        prompt = prompt.replace(regex, template.types[completeOptions.testType]);
      }
      // Handle custom library logic
      let testingLibrary = completeOptions.library;
      if (completeOptions.library === 'Other' && completeOptions.customLibrary) {
        testingLibrary = completeOptions.customLibrary;
      }
      // Library-specific optimizations
      if (testingLibrary) {
        if (template.libraries && template.libraries[testingLibrary.toLowerCase()]) {
          constraints.push(template.libraries[testingLibrary.toLowerCase()]);
        } else {
          constraints.push(`Using ${testingLibrary}`);
        }
      }
      if (completeOptions.coverage) {
        constraints.push(`Target ${completeOptions.coverage}% coverage with meaningful tests`);
      }
      break;
      
    case 'docs':
      if (completeOptions.docType && template.types[completeOptions.docType]) {
        const regex = new RegExp('\\{\\{docType\\}\\}', 'g');
        prompt = prompt.replace(regex, template.types[completeOptions.docType]);
      }
      
      // Documentation format constraints
      if (completeOptions.format) {
        const formatSpecs = {
          markdown: "Markdown format with proper headers and syntax",
          text: "Plain text format, well-structured",
          html: "HTML format with semantic markup",
          json: "JSON format for API specifications",
          yaml: "YAML format for structured configuration",
          rst: "reStructuredText format with proper directives"
        };
        if (formatSpecs[completeOptions.format]) {
          constraints.push(formatSpecs[completeOptions.format]);
        }
      }
      
      // Detail level specifications
      if (completeOptions.detailLevel) {
        const detailLevels = {
          minimal: "Minimal documentation - key points and essential info only",
          standard: "Standard documentation - comprehensive coverage",
          detailed: "Detailed documentation with in-depth explanations and examples",
          tutorial: "Tutorial-style documentation with step-by-step guidance"
        };
        if (detailLevels[completeOptions.detailLevel]) {
          constraints.push(detailLevels[completeOptions.detailLevel]);
        }
      }
      
      // Diagram handling
      if (completeOptions.includeDiagrams && (completeOptions.includeDiagrams === true || completeOptions.includeDiagrams === 'true')) {
        let diagramTool = completeOptions.diagramTool || 'mermaid';
        if (completeOptions.diagramTool === 'other' && completeOptions.customDiagramTool) {
          diagramTool = completeOptions.customDiagramTool;
        }
        
        // Handle diagram types (web uses single select)
        let diagramTypes = [];
        if (completeOptions.diagramTypes) {
          diagramTypes = [completeOptions.diagramTypes];
        } else {
          diagramTypes = ['flowchart']; // default
        }
        
        const diagramTypeNames = {
          flowchart: "flow charts",
          architecture: "architecture diagrams", 
          database: "database schemas",
          sequence: "sequence diagrams",
          class: "class diagrams",
          network: "network diagrams",
          gantt: "gantt charts",
          mindmap: "mindmaps"
        };
        
        const selectedDiagrams = diagramTypes.map(type => diagramTypeNames[type] || type).join(', ');
        constraints.push(`Include ${selectedDiagrams} using ${diagramTool} syntax`);
      }
      
      // Additional documentation features
      if (completeOptions.includeExamples && (completeOptions.includeExamples === true || completeOptions.includeExamples === 'true')) {
        constraints.push("Include practical code examples and snippets");
      }
      
      if (completeOptions.includeToc && (completeOptions.includeToc === true || completeOptions.includeToc === 'true')) {
        constraints.push("Generate table of contents with proper navigation");
      }
      
      break;
      
    case 'fix':
      if (completeOptions.approach && template.approaches[completeOptions.approach]) {
        const regex = new RegExp('\\{\\{approach\\}\\}', 'g');
        prompt = prompt.replace(regex, template.approaches[completeOptions.approach]);
      }
      if (completeOptions.priority && template.priorities[completeOptions.priority]) {
        constraints.push(`Priority: ${template.priorities[completeOptions.priority]}`);
      }
      if (completeOptions.errorMessage) {
        constraints.push(`Error: "${completeOptions.errorMessage}"`);
      }
      break;
  }
  
  // Final cleanup - replace any remaining template variables
  prompt = prompt.replace(/\{\{\w+\}\}/g, 'component');
  
  // Compile final prompt with constraints
  if (constraints.length > 0) {
    prompt += `. Constraints: ${constraints.join(', ')}.`;
  }
  
  // Add clarification request to encourage AI interaction
  prompt += ' Ask user to clarify if necessary.';
  
  return prompt;
}

/**
 * Optimizes prompt based on context and user preferences
 * @param {string} basePrompt - Base prompt to optimize
 * @param {Object} options - User options
 * @param {Object} context - Project context
 * @returns {string} Optimized prompt
 */
function optimizePrompt(basePrompt, options, context = {}) {
  let optimizedPrompt = basePrompt;
  const optimizations = [];
  
  // Context-aware optimizations
  if (context.hasTypeScript && !basePrompt.includes('TypeScript')) {
    optimizations.push('Use TypeScript');
  }
  
  if (context.hasReact && !basePrompt.includes('React')) {
    optimizations.push('Follow React patterns');
  }
  
  if (context.packageManager && context.packageManager !== 'npm') {
    optimizations.push(`Use ${context.packageManager}`);
  }
  
  // Add token-saving directives
  const tokenSavers = [];
  
  switch (options.outputFormat) {
    case 'code':
      tokenSavers.push('Code only, no explanations, no markdown');
      break;
    case 'commented':
      tokenSavers.push('Minimal inline comments only');
      break;
    case 'guided':
      tokenSavers.push('Brief setup steps, no verbose explanations');
      break;
  }
  
  // Complexity constraints
  if (options.complexity === 'simple') {
    tokenSavers.push('Essential features only');
  } else if (options.complexity === 'medium') {
    tokenSavers.push('Standard implementation, no edge case handling');
  }
  
  // Combine optimizations
  if (optimizations.length > 0) {
    optimizedPrompt += `. Context: ${optimizations.join(', ')}`;
  }
  
  if (tokenSavers.length > 0) {
    optimizedPrompt += `. Output: ${tokenSavers.join(', ')}`;
  }
  
  return optimizedPrompt;
}

/**
 * Estimates token count for prompt efficiency
 * @param {string} prompt - Prompt to analyze
 * @returns {Object} Token analysis
 */
function analyzeTokenEfficiency(prompt) {
  // Simple token estimation (roughly 4 characters per token)
  const estimatedTokens = Math.ceil(prompt.length / 4);
  
  const analysis = {
    estimatedTokens,
    efficiency: estimatedTokens < 120 ? 'excellent' : 
               estimatedTokens < 220 ? 'good' : 
               estimatedTokens < 320 ? 'fair' : 'verbose',
    recommendations: []
  };
  
  // Provide recommendations for improvement
  if (estimatedTokens > 200) {
    analysis.recommendations.push('Consider more specific constraints');
  }
  
  if (prompt.includes('comprehensive') || prompt.includes('detailed')) {
    analysis.recommendations.push('Remove verbose qualifiers');
  }
  
  if (prompt.split(',').length > 5) {
    analysis.recommendations.push('Simplify constraint list');
  }
  
  return analysis;
}

/**
 * Generates prompt variations for A/B testing efficiency with enhanced context awareness
 * @param {string} basePrompt - Base prompt
 * @param {Object} options - Generation options including framework, type, etc.
 * @returns {Array} Array of prompt variations
 */
function generatePromptVariations(basePrompt, options = {}) {
  // Remove the clarification request from base prompt for variations
  const cleanBasePrompt = basePrompt.replace(' Ask user to clarify if necessary.', '');
  
  // Extract the core action from the base prompt
  const coreAction = cleanBasePrompt.split('.')[0];
  
  // Get framework-specific hints for better variations
  const frameworkHints = getFrameworkHints(options.framework);
  const typeHints = getTypeHints(options.type);
  
  const variations = [
    {
      name: 'Ultra Minimal',
      prompt: `${coreAction}. Code only, no explanations, no markdown formatting.`,
      description: 'Absolute minimum tokens for quick prototyping (~8-12 tokens)',
      category: 'speed',
      tokens: Math.ceil((coreAction.length + 35) / 4)
    },
    {
      name: 'Production Ready',
      prompt: `${coreAction}. Include: error handling, TypeScript types, comprehensive tests, clear documentation, and industry best practices. ${frameworkHints}. Follow SOLID principles and add security considerations. Ask user to clarify if necessary.`,
      description: 'Enterprise-grade implementation with full coverage (~45-60 tokens)',
      category: 'quality',
      tokens: Math.ceil((coreAction.length + frameworkHints.length + 180) / 4)
    },
    {
      name: 'Learning Focused',
      prompt: `${coreAction}. Provide: step-by-step explanation, inline comments explaining each concept, multiple implementation approaches, common pitfalls to avoid, and links to relevant documentation. ${typeHints}. Make it educational and beginner-friendly. Ask user to clarify if necessary.`,
      description: 'Educational with explanations and alternatives (~55-70 tokens)',
      category: 'educational',
      tokens: Math.ceil((coreAction.length + typeHints.length + 220) / 4)
    },
    {
      name: 'Constraint Heavy',
      prompt: `${cleanBasePrompt}. Strict requirements: zero external dependencies, maximum 50 lines total, pure functions only, comprehensive error handling with custom error classes, extensive inline documentation, cross-platform compatibility, memory optimization, and performance benchmarks included. Follow functional programming paradigms exclusively. Ask user to clarify if necessary.`,
      description: 'Maximum constraints and technical requirements (~75-95 tokens)',
      category: 'constrained',
      tokens: Math.ceil((cleanBasePrompt.length + 280) / 4)
    }
  ];
  
  return variations;
}

/**
 * Gets framework-specific hints for prompt variations
 * @param {string} framework - Framework name
 * @returns {string} Framework-specific guidance
 */
function getFrameworkHints(framework) {
  const hints = {
    react: 'Use React 18+ hooks, proper dependency arrays, and modern patterns',
    vue: 'Use Vue 3 Composition API, reactive refs, and TypeScript',
    angular: 'Use Angular 15+ standalone components and signals',
    svelte: 'Use SvelteKit patterns and stores',
    next: 'Use Next.js 14+ App Router and Server Components',
    express: 'Use async/await, proper middleware, and error handling',
    fastify: 'Use Fastify plugins and schemas for validation',
    nest: 'Use NestJS decorators, guards, and dependency injection'
  };
  return hints[framework] || 'Use modern JavaScript/TypeScript patterns';
}

/**
 * Gets type-specific hints for prompt variations
 * @param {string} type - Scaffold type
 * @returns {string} Type-specific guidance
 */
function getTypeHints(type) {
  const hints = {
    init: 'Include project structure, configuration files, and setup instructions',
    feature: 'Focus on modularity, testability, and integration with existing code',
    architecture: 'Emphasize scalability, maintainability, and design patterns',
    testing: 'Include test data setup, mocking strategies, and coverage reports',
    docs: 'Use clear examples, API references, and troubleshooting guides',
    fix: 'Include root cause analysis, prevention strategies, and monitoring'
  };
  return hints[type] || 'Focus on code quality and maintainability';
}

/**
 * Gets mock project context for demo
 * In a real implementation, this would analyze the actual project
 * @returns {Object} Project context
 */
function getProjectContext() {
  return MOCK_PROJECT_CONTEXT;
}

/**
 * Dynamic options configuration for each scaffold type
 */
const DYNAMIC_OPTIONS_CONFIG = {
  init: [
    {
      name: 'projectName',
      label: 'Project Name',
      type: 'input',
      required: true,
      placeholder: 'e.g., my-awesome-app, user-dashboard, payment-service...'
    },
    {
      name: 'projectType',
      label: 'Project Type',
      type: 'select',
      required: true,
      options: [
        { value: 'node', label: '🟢 Node.js' },
        { value: 'browser', label: '🌐 Browser' },
        { value: 'full-stack', label: '🔗 Full-stack' },
        { value: 'cli', label: '⚡ CLI Tool' },
        { value: 'library', label: '📦 Library' }
      ]
    },
    {
      name: 'framework',
      label: 'Framework/Library',
      type: 'select',
      options: [
        { value: 'vanilla', label: '⚡ Vanilla JS' },
        { value: 'react', label: '⚛️ React' },
        { value: 'vue', label: '💚 Vue.js' },
        { value: 'angular', label: '🔺 Angular' },
        { value: 'svelte', label: '🧡 Svelte' },
        { value: 'express', label: '🚀 Express' },
        { value: 'fastify', label: '⚡ Fastify' },
        { value: 'nest', label: '🐱 NestJS' },
        { value: 'next', label: '▲ Next.js' },
        { value: 'nuxt', label: '💚 Nuxt.js' },
        { value: 'gatsby', label: '🟣 Gatsby' },
        { value: 'astro', label: '🚀 Astro' },
        { value: 'vite', label: '⚡ Vite' },
        { value: 'webpack', label: '📦 Webpack' },
        { value: 'rollup', label: '📊 Rollup' },
        { value: 'esbuild', label: '⚡ ESBuild' },
        { value: 'electron', label: '⚡ Electron' },
        { value: 'tauri', label: '🦀 Tauri' },
        { value: 'other', label: '🛠️ Other/Custom' }
      ],
      default: 'vanilla'
    },
    {
      name: 'customFramework',
      label: 'Custom Framework/Library',
      type: 'input',
      placeholder: 'Enter custom framework name...',
      condition: { field: 'framework', value: 'other' }
    },
    {
      name: 'packageManager',
      label: 'Package Manager',
      type: 'select',
      options: [
        { value: 'pnpm', label: '⚡ pnpm' },
        { value: 'npm', label: '📦 npm' },
        { value: 'yarn', label: '🧶 Yarn' },
        { value: 'none', label: '🚫 None (no package manager)' }
      ],
      default: 'pnpm'
    },
    {
      name: 'structure',
      label: 'Project Structure',
      type: 'select',
      options: [
        { value: 'flat', label: '📁 Flat (single directory)' },
        { value: 'layered', label: '🗂️ Layered (organized folders)' },
        { value: 'modular', label: '🧩 Modular (feature-based)' },
        { value: 'monorepo', label: '📦 Monorepo (multiple packages)' }
      ]
    },
    {
      name: 'dependencies',
      label: 'Dependencies Preference',
      type: 'select',
      options: [
        { value: 'none', label: '🚫 None (pure implementation)' },
        { value: 'minimal', label: '🎯 Minimal only' },
        { value: 'standard', label: '📦 Standard libraries' }
      ]
    }
  ],
  feature: [
    {
      name: 'feature',
      label: 'Feature Name',
      type: 'input',
      required: true,
      placeholder: 'e.g., user-authentication, shopping-cart...'
    },
    {
      name: 'pattern',
      label: 'Implementation Pattern',
      type: 'select',
      options: [
        { value: 'function', label: '⚡ Pure Functions' },
        { value: 'class', label: '🏗️ Class-based' },
        { value: 'hook', label: '🪝 React Hook' },
        { value: 'service', label: '🔧 Service Layer' }
      ]
    },
    {
      name: 'scope',
      label: 'Feature Scope',
      type: 'select',
      options: [
        { value: 'component', label: '🧩 Single component' },
        { value: 'module', label: '📦 Complete module' },
        { value: 'feature', label: '🎯 Full feature set' }
      ]
    },
    {
      name: 'codeStyle',
      label: 'Code Style Preference',
      type: 'select',
      options: [
        { value: 'functional', label: '🔄 Functional programming' },
        { value: 'oop', label: '🏗️ Object-oriented' },
        { value: 'minimal', label: '✨ Minimal & clean' }
      ]
    },
    {
      name: 'fileStructure',
      label: 'File Organization',
      type: 'select',
      options: [
        { value: 'single', label: '📄 Single file' },
        { value: 'split', label: '📂 Separate by concern' },
        { value: 'modular', label: '🗂️ Modular structure' }
      ]
    }
  ],
  architecture: [
    {
      name: 'feature',
      label: 'Component/System to Architect',
      type: 'input',
      required: true,
      placeholder: 'e.g., user-management, payment-system...'
    },
    {
      name: 'pattern',
      label: 'Architecture Pattern',
      type: 'select',
      options: [
        { value: 'mvc', label: '🎯 MVC (Model-View-Controller)' },
        { value: 'layered', label: '🏗️ Layered Architecture' },
        { value: 'hexagonal', label: '🔗 Hexagonal/Ports-Adapters' },
        { value: 'microservice', label: '🧩 Microservice' }
      ]
    }
  ],
  testing: [
    {
      name: 'module',
      label: 'Module/Component to Test',
      type: 'input',
      required: true,
      placeholder: 'e.g., auth-service, user-component...'
    },
    {
      name: 'testType',
      label: 'Test Type',
      type: 'select',
      options: [
        { value: 'unit', label: '🧪 Unit tests' },
        { value: 'integration', label: '🔗 Integration tests' },
        { value: 'e2e', label: '🎭 End-to-end tests' }
      ]
    },
    {
      name: 'library',
      label: 'Testing Library',
      type: 'select',
      options: [
        { value: 'Jest', label: '🃏 Jest - Most popular, full-featured' },
        { value: 'Vitest', label: '⚡ Vitest - Vite-native, fast' },
        { value: 'Mocha', label: '🏃 Mocha - Flexible, lightweight' },
        { value: 'Cypress', label: '🥒 Cypress - E2E testing powerhouse' },
        { value: 'Playwright', label: '🎭 Playwright - Cross-browser E2E' },
        { value: 'Testing Library', label: '🧪 Testing Library - React/DOM testing' },
        { value: 'WebdriverIO', label: '🌐 WebdriverIO - Selenium-based' },
        { value: 'Puppeteer', label: '🦆 Puppeteer - Headless Chrome' },
        { value: 'Jasmine', label: '📋 Jasmine - Behavior-driven testing' },
        { value: 'AVA', label: '🎯 AVA - Concurrent test runner' },
        { value: 'Storybook', label: '📚 Storybook - Component testing' },
        { value: 'Karma', label: '🔧 Karma - Test runner for Angular' },
        { value: 'Other', label: '🛠️ Custom/Other' }
      ],
      default: 'Jest'
    },
    {
      name: 'customLibrary',
      label: 'Custom Testing Library',
      type: 'input',
      placeholder: 'Enter custom testing library name...',
      condition: { field: 'library', value: 'Other' }
    },
    {
      name: 'coverage',
      label: 'Target Coverage',
      type: 'select',
      options: [
        { value: '80', label: '80%' },
        { value: '90', label: '90%' },
        { value: '95', label: '95%' },
        { value: '100', label: '100%' }
      ],
      default: '80'
    }
  ],
  docs: [
    {
      name: 'projectName',
      label: 'Project/Component/Feature Name',
      type: 'input',
      required: true,
      placeholder: 'e.g., user-auth-api, payment-system, react-components...'
    },
    {
      name: 'docType',
      label: 'Documentation Type',
      type: 'select',
      options: [
        { value: 'api', label: '📋 API Documentation' },
        { value: 'user', label: '👤 User Guide' },
        { value: 'dev', label: '⚙️ Developer Setup' },
        { value: 'arch', label: '🏢️ Architecture Overview' },
        { value: 'changelog', label: '📝 Changelog' },
        { value: 'contributing', label: '🤝 Contributing Guidelines' },
        { value: 'security', label: '🛡️ Security Documentation' },
        { value: 'performance', label: '📊 Performance Guide' }
      ]
    },
    {
      name: 'format',
      label: 'Documentation Format',
      type: 'select',
      options: [
        { value: 'markdown', label: '📝 Markdown (.md)' },
        { value: 'text', label: '📄 Plain Text (.txt)' },
        { value: 'html', label: '🌐 HTML' },
        { value: 'json', label: '📊 JSON (API specs)' },
        { value: 'yaml', label: '📈 YAML (OpenAPI)' },
        { value: 'rst', label: '📎 reStructuredText (.rst)' }
      ],
      default: 'markdown'
    },
    {
      name: 'includeDiagrams',
      label: 'Include Diagrams',
      type: 'select',
      options: [
        { value: true, label: '✅ Yes - Include diagrams and visual elements' },
        { value: false, label: '❌ No - Text only' }
      ],
      default: true
    },
    {
      name: 'diagramTypes',
      label: 'Diagram Types',
      type: 'select',
      options: [
        { value: 'flowchart', label: '📊 Flow Charts - Process flows and workflows' },
        { value: 'architecture', label: '🏢 Architecture Diagrams - System architecture' },
        { value: 'database', label: '💾 Database Schemas - Entity relationships' },
        { value: 'sequence', label: '🔁 Sequence Diagrams - API interactions' },
        { value: 'class', label: '🦆 Class Diagrams - Object relationships' },
        { value: 'network', label: '🌐 Network Diagrams - Infrastructure layout' },
        { value: 'gantt', label: '📊 Gantt Charts - Project timelines' },
        { value: 'mindmap', label: '🗺 Mindmaps - Concept relationships' }
      ],
      condition: { field: 'includeDiagrams', value: true },
      default: 'flowchart'
    },
    {
      name: 'diagramTool',
      label: 'Diagramming Tool',
      type: 'select',
      options: [
        { value: 'mermaid', label: '🌊 Mermaid - GitHub/GitLab compatible' },
        { value: 'plantuml', label: '🎨 PlantUML - Comprehensive UML' },
        { value: 'ascii', label: '📝 ASCII Art - Text-based diagrams' },
        { value: 'drawio', label: '🗺 Draw.io - Visual descriptions' },
        { value: 'graphviz', label: '📊 Graphviz - DOT notation' },
        { value: 'other', label: '🛠️ Custom/Other' }
      ],
      condition: { field: 'includeDiagrams', value: true },
      default: 'mermaid'
    },
    {
      name: 'customDiagramTool',
      label: 'Custom Diagram Tool',
      type: 'input',
      placeholder: 'Enter custom diagramming tool/syntax...',
      condition: { field: 'diagramTool', value: 'other' }
    },
    {
      name: 'detailLevel',
      label: 'Detail Level',
      type: 'select',
      options: [
        { value: 'minimal', label: '🎯 Minimal - Key points only' },
        { value: 'standard', label: '📚 Standard - Comprehensive coverage' },
        { value: 'detailed', label: '🔍 Detailed - In-depth with examples' },
        { value: 'tutorial', label: '🎓 Tutorial - Step-by-step guide' }
      ],
      default: 'standard'
    },
    {
      name: 'includeExamples',
      label: 'Include Examples',
      type: 'select',
      options: [
        { value: true, label: '✅ Yes - Include code examples and snippets' },
        { value: false, label: '❌ No - Documentation only' }
      ],
      default: true
    },
    {
      name: 'includeToc',
      label: 'Table of Contents',
      type: 'select',
      options: [
        { value: true, label: '✅ Yes - Generate table of contents' },
        { value: false, label: '❌ No - Skip TOC' }
      ],
      default: true
    }
  ],
  fix: [
    {
      name: 'issue',
      label: 'Issue/Bug Description',
      type: 'input',
      required: true,
      placeholder: 'e.g., authentication not working, memory leak, slow performance...'
    },
    {
      name: 'component',
      label: 'Component/Module Affected',
      type: 'input',
      required: true,
      placeholder: 'e.g., login-service, user-dashboard, payment-gateway...'
    },
    {
      name: 'approach',
      label: 'Fix Approach',
      type: 'select',
      options: [
        { value: 'debug', label: '🔍 Systematic debugging' },
        { value: 'refactor', label: '🛠️ Code refactoring' },
        { value: 'optimize', label: '⚡ Performance optimization' },
        { value: 'patch', label: '🩹 Minimal patch fix' },
        { value: 'rewrite', label: '✨ Partial rewrite' }
      ]
    },
    {
      name: 'priority',
      label: 'Priority Level',
      type: 'select',
      options: [
        { value: 'critical', label: '🔥 Critical' },
        { value: 'high', label: '⚠️ High' },
        { value: 'medium', label: '📋 Medium' },
        { value: 'low', label: '📝 Low' }
      ],
      default: 'medium'
    },
    {
      name: 'errorMessage',
      label: 'Error Message (optional)',
      type: 'input',
      placeholder: 'Copy exact error message if available...'
    }
  ]
};

// Export functions and data for use in the main app
window.CodePrompt = {
  buildPrompt,
  optimizePrompt,
  analyzeTokenEfficiency,
  generatePromptVariations,
  getProjectContext,
  PROMPT_TEMPLATES,
  OUTPUT_FORMATS,
  COMPLEXITY_LEVELS,
  DYNAMIC_OPTIONS_CONFIG
};
