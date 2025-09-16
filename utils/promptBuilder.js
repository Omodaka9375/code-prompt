// Token-efficient prompt templates with precise constraints and framework-specific optimizations
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
    },
    // Framework-specific optimizations
    frameworks: {
      react: "Follow React 18+ patterns, hooks, and modern practices",
      vue: "Use Vue 3 Composition API and TypeScript support",
      angular: "Follow Angular 15+ conventions with standalone components",
      svelte: "Use SvelteKit patterns and TypeScript configuration",
      next: "Configure Next.js 14+ with App Router",
      nuxt: "Set up Nuxt 3 with auto-imports and TypeScript",
      express: "Modern Express.js with middleware patterns",
      fastify: "High-performance Fastify server setup",
      nest: "NestJS with decorators and dependency injection",
      electron: "Electron with security best practices",
      tauri: "Tauri with Rust backend integration",
      astro: "Astro with island architecture",
      gatsby: "Gatsby with GraphQL data layer",
      vite: "Vite build configuration and plugins",
      webpack: "Modern webpack configuration",
      esbuild: "ESBuild bundler setup",
      rollup: "Rollup configuration for libraries"
    }
  },
  feature: {
    base: "Implement {{feature}} as {{pattern}}",
    patterns: {
      function: "pure functions with TypeScript",
      class: "class-based module with encapsulation",
      hook: "React hook with proper dependencies",
      service: "service layer with dependency injection",
      component: "reusable component with props interface",
      utility: "utility function with comprehensive tests",
      middleware: "middleware with error handling",
      api: "RESTful API endpoint with validation"
    },
    scope: {
      component: "single component with tests",
      module: "complete module with documentation",
      feature: "full feature set with integration tests",
      system: "system-wide implementation with monitoring"
    }
  },
  architecture: {
    base: "Design {{feature}} using {{pattern}} pattern",
    patterns: {
      mvc: "MVC with clear separation of concerns",
      layered: "layered architecture with dependency inversion",
      hexagonal: "hexagonal/ports-adapters with clean boundaries",
      microservice: "microservice with proper communication patterns",
      eventdriven: "event-driven architecture with message queues",
      cqrs: "CQRS with command and query separation",
      ddd: "domain-driven design with bounded contexts"
    }
  },
  testing: {
    base: "Write {{testType}} tests for {{module}} using {{library}}",
    types: {
      unit: "unit tests with mocking",
      integration: "integration tests with real dependencies",
      e2e: "end-to-end tests with user scenarios",
      performance: "performance tests with benchmarks",
      security: "security tests with vulnerability scanning"
    },
    libraries: {
      jest: "Jest with TypeScript support",
      vitest: "Vitest with fast execution",
      cypress: "Cypress for E2E testing",
      playwright: "Playwright for cross-browser testing",
      rtl: "React Testing Library for component tests"
    }
  },
  docs: {
    base: "Generate {{docType}} documentation for {{projectName}}",
    types: {
      api: "OpenAPI/Swagger API documentation",
      user: "comprehensive user guide with examples",
      dev: "developer setup with troubleshooting",
      arch: "architecture overview with diagrams",
      changelog: "structured changelog with versioning",
      contributing: "contribution guidelines with workflows",
      security: "security documentation with best practices",
      performance: "performance guide with optimization strategies"
    }
  },
  fix: {
    base: "Fix {{issue}} in {{component}} using {{approach}}",
    approaches: {
      debug: "systematic debugging with logging",
      refactor: "code refactoring with backward compatibility",
      optimize: "performance optimization with benchmarks",
      patch: "minimal patch fix with regression tests",
      rewrite: "partial rewrite with migration strategy",
      security: "security fix with vulnerability assessment"
    },
    priorities: {
      critical: "critical priority - immediate fix required",
      high: "high priority - fix within 24 hours",
      medium: "medium priority - address in next sprint",
      low: "low priority - backlog item"
    },
    categories: {
      performance: "performance issue affecting user experience",
      security: "security vulnerability requiring immediate attention",
      functionality: "functionality bug breaking expected behavior",
      ui: "UI/UX issue affecting user interaction",
      integration: "integration issue with external services",
      compatibility: "compatibility issue across environments"
    }
  }
};

// Output format specifications for token efficiency
const OUTPUT_FORMATS = {
  code: "Code only, no explanations",
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

function buildPrompt(type, options) {
  const template = PROMPT_TEMPLATES[type];
  if (!template) return 'Unknown prompt type.';

  // Handle custom framework logic first
  if (options.framework === 'other' && options.customFramework) {
    options.framework = options.customFramework;
  }

  // Build base prompt with variable substitution
  let prompt = template.base;
  Object.keys(options).forEach(key => {
    prompt = prompt.replace(`{{${key}}}`, options[key] || 'default');
  });
  
  // Add constraints for token efficiency
  const constraints = [];
  
  // Framework-specific optimizations (highest priority)
  if (type === 'init' && options.framework && template.frameworks && template.frameworks[options.framework]) {
    constraints.push(template.frameworks[options.framework]);
  }
  
  // Output format constraint
  if (options.outputFormat && OUTPUT_FORMATS[options.outputFormat]) {
    constraints.push(OUTPUT_FORMATS[options.outputFormat]);
  }
  
  // Complexity constraint with enhanced descriptions
  if (options.complexity && COMPLEXITY_LEVELS[options.complexity]) {
    constraints.push(COMPLEXITY_LEVELS[options.complexity]);
  }
  
  // Enhanced code style preferences
  if (options.codeStyle) {
    const styles = {
      functional: "Functional programming with immutability",
      oop: "Object-oriented with SOLID principles",
      minimal: "Minimal, clean code with clear naming"
    };
    if (styles[options.codeStyle]) {
      constraints.push(styles[options.codeStyle]);
    }
  }
  
  // Enhanced file structure preference
  if (options.fileStructure) {
    const structures = {
      single: "Single file solution with clear sections",
      split: "Separate files by concern with barrel exports",
      modular: "Modular file structure with index files"
    };
    if (structures[options.fileStructure]) {
      constraints.push(structures[options.fileStructure]);
    }
  }
  
  // Enhanced dependencies preference
  if (options.dependencies) {
    const deps = {
      none: "No external dependencies - pure implementation",
      minimal: "Minimal dependencies only - prefer built-ins",
      standard: "Common libraries allowed - focus on stability"
    };
    if (deps[options.dependencies]) {
      constraints.push(deps[options.dependencies]);
    }
  }
  
  // Add type-specific enhancements with advanced context awareness
  switch (type) {
    case 'init':
      // Use different template based on whether project name is provided by user
      const userProjectName = options.projectName; // Get original user input
      if (userProjectName && userProjectName.trim() !== '') {
        // Replace current prompt with the version that includes project name
        prompt = template.withProjectName;
        // Now do the normal replacement for all variables including projectName
        Object.keys(options).forEach(key => {
          prompt = prompt.replace(`{{${key}}}`, options[key] || 'default');
        });
      }
      // If no project name, we keep the base template which doesn't include {{projectName}}
      
      // Package manager handling with 'none' option
      if (options.packageManager) {
        if (options.packageManager === 'none') {
          constraints.push('No package manager needed - pure static files');
        } else {
          constraints.push(`Use ${options.packageManager} with latest best practices`);
        }
      }
      // Project structure with enhanced context
      if (options.structure && template.structure[options.structure]) {
        constraints.push(template.structure[options.structure]);
      }
      break;
      
    case 'feature':
      // Enhanced pattern replacement with context
      if (options.pattern && template.patterns[options.pattern]) {
        prompt = prompt.replace('{{pattern}}', template.patterns[options.pattern]);
      }
      // Scope handling with detailed context
      if (options.scope && template.scope[options.scope]) {
        constraints.push(`Scope: ${template.scope[options.scope]}`);
      }
      break;
      
    case 'architecture':
      // Pattern replacement with architectural context
      if (options.pattern && template.patterns[options.pattern]) {
        prompt = prompt.replace('{{pattern}}', template.patterns[options.pattern]);
      }
      break;
      
    case 'testing':
      // Enhanced test type with specific libraries
      if (options.testType && template.types[options.testType]) {
        prompt = prompt.replace('{{testType}}', template.types[options.testType]);
      }
      // Handle custom library logic
      let testingLibrary = options.library;
      if (options.library === 'Other' && options.customLibrary) {
        testingLibrary = options.customLibrary;
      }
      // Library-specific optimizations
      if (testingLibrary) {
        if (template.libraries && template.libraries[testingLibrary.toLowerCase()]) {
          constraints.push(template.libraries[testingLibrary.toLowerCase()]);
        } else {
          constraints.push(`Using ${testingLibrary}`);
        }
      }
      // Coverage targets with context
      if (options.coverage) {
        constraints.push(`Target ${options.coverage}% coverage with meaningful tests`);
      }
      break;
      
    case 'docs':
      // Enhanced documentation type handling
      if (options.docType && template.types[options.docType]) {
        prompt = prompt.replace('{{docType}}', template.types[options.docType]);
      }
      
      // Documentation format constraints
      if (options.format) {
        const formatSpecs = {
          markdown: "Markdown format with proper headers and syntax",
          text: "Plain text format, well-structured",
          html: "HTML format with semantic markup",
          json: "JSON format for API specifications",
          yaml: "YAML format for structured configuration",
          rst: "reStructuredText format with proper directives"
        };
        if (formatSpecs[options.format]) {
          constraints.push(formatSpecs[options.format]);
        }
      }
      
      // Detail level specifications
      if (options.detailLevel) {
        const detailLevels = {
          minimal: "Minimal documentation - key points and essential info only",
          standard: "Standard documentation - comprehensive coverage",
          detailed: "Detailed documentation with in-depth explanations and examples",
          tutorial: "Tutorial-style documentation with step-by-step guidance"
        };
        if (detailLevels[options.detailLevel]) {
          constraints.push(detailLevels[options.detailLevel]);
        }
      }
      
      // Diagram handling
      if (options.includeDiagrams && (options.includeDiagrams === true || options.includeDiagrams === 'true')) {
        let diagramTool = options.diagramTool || 'mermaid';
        if (options.diagramTool === 'other' && options.customDiagramTool) {
          diagramTool = options.customDiagramTool;
        }
        
        // Handle multiple diagram types (CLI checkbox) or single type (web select)
        let diagramTypes = [];
        if (Array.isArray(options.diagramTypes)) {
          diagramTypes = options.diagramTypes;
        } else if (options.diagramTypes) {
          diagramTypes = [options.diagramTypes];
        } else {
          diagramTypes = ['flowchart', 'architecture']; // default
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
      if (options.includeExamples && (options.includeExamples === true || options.includeExamples === 'true')) {
        constraints.push("Include practical code examples and snippets");
      }
      
      if (options.includeToc && (options.includeToc === true || options.includeToc === 'true')) {
        constraints.push("Generate table of contents with proper navigation");
      }
      
      break;
      
    case 'fix':
      // Enhanced fix approach with context
      if (options.approach && template.approaches[options.approach]) {
        prompt = prompt.replace('{{approach}}', template.approaches[options.approach]);
      }
      // Priority with enhanced context
      if (options.priority && template.priorities[options.priority]) {
        constraints.push(`Priority: ${template.priorities[options.priority]}`);
      }
      // Error message context
      if (options.errorMessage) {
        constraints.push(`Error context: "${options.errorMessage}"`);
      }
      // Issue category for better context
      if (options.category && template.categories && template.categories[options.category]) {
        constraints.push(`Issue type: ${template.categories[options.category]}`);
      }
      break;
  }
  
  // Compile final prompt with constraints
  if (constraints.length > 0) {
    prompt += `. Constraints: ${constraints.join(', ')}.`;
  }
  
  // Add clarification request to encourage AI interaction
  prompt += ' Ask user to clarify if necessary.';
  
  return prompt;
}

module.exports = { buildPrompt, PROMPT_TEMPLATES, OUTPUT_FORMATS, COMPLEXITY_LEVELS };
