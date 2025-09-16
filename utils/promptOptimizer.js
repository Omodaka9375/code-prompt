// Advanced prompt optimization utilities for maximum token efficiency
const path = require('path');
const fs = require('fs');

/**
 * Analyzes project context to add relevant constraints
 * @param {string} projectPath - Path to analyze
 * @returns {Object} Context-aware constraints
 */
function analyzeProjectContext(projectPath = process.cwd()) {
  const constraints = {};
  
  try {
    // Check for package.json
    const packagePath = path.join(projectPath, 'package.json');
    if (fs.existsSync(packagePath)) {
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      // Detect project characteristics
      constraints.hasTypeScript = !!(pkg.dependencies?.typescript || pkg.devDependencies?.typescript);
      constraints.hasReact = !!(pkg.dependencies?.react || pkg.devDependencies?.react);
      constraints.hasNode = pkg.engines?.node || pkg.main;
      constraints.packageManager = fs.existsSync(path.join(projectPath, 'pnpm-lock.yaml')) ? 'pnpm' :
                                  fs.existsSync(path.join(projectPath, 'yarn.lock')) ? 'yarn' : 'npm';
      
      // Extract existing patterns
      const scripts = pkg.scripts || {};
      constraints.hasLinting = !!(scripts.lint || pkg.devDependencies?.eslint);
      constraints.hasFormatting = !!(scripts.format || pkg.devDependencies?.prettier);
      constraints.hasTesting = !!(scripts.test || pkg.devDependencies?.jest || pkg.devDependencies?.vitest);
    }
    
    // Check for configuration files
    constraints.hasGitignore = fs.existsSync(path.join(projectPath, '.gitignore'));
    constraints.hasReadme = fs.existsSync(path.join(projectPath, 'README.md'));
    
  } catch (error) {
    // Silently fail and return empty constraints
  }
  
  return constraints;
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

module.exports = {
  analyzeProjectContext,
  optimizePrompt,
  analyzeTokenEfficiency,
  generatePromptVariations
};