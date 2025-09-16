/**
 * Main application logic for CodePrompt web demo
 * Handles user interactions, form generation, and prompt building
 */

// Application state
let currentScaffoldType = 'init';
let currentOptions = {};
let currentProjectContext = {};

// DOM elements
const elements = {
    dynamicOptions: document.getElementById('dynamicOptions'),
    promptContent: document.getElementById('promptContent'),
    tokenCount: document.getElementById('tokenCount'),
    efficiency: document.getElementById('efficiency'),
    contextItems: document.getElementById('contextItems'),
    contextDetection: document.getElementById('contextDetection'),
    contextList: document.getElementById('contextList'),
    optimizationTips: document.getElementById('optimizationTips'),
    tipsList: document.getElementById('tipsList'),
    variationsContainer: document.getElementById('variationsContainer'),
    copyPrompt: document.getElementById('copyPrompt'),
    downloadTxt: document.getElementById('downloadTxt'),
    downloadMd: document.getElementById('downloadMd'),
    shareUrl: document.getElementById('shareUrl'),
    toast: document.getElementById('toast')
};

/**
 * Initialize the application
 */
function init() {
    // Setup event listeners
    setupEventListeners();
    
    // Initialize universal options with default values
    initializeUniversalOptions();
    
    // Generate initial dynamic options
    updateDynamicOptions();
    
    // Generate initial prompt after everything is set up (this will also update context)
    setTimeout(() => updatePrompt(), 200);
}

/**
 * Initialize universal options with their default values
 */
function initializeUniversalOptions() {
    const universalInputs = document.querySelectorAll('.universal-options select');
    universalInputs.forEach(input => {
        if (input.value) {
            currentOptions[input.name] = input.value;
        }
    });
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Scaffold type radio buttons
    const scaffoldTypeInputs = document.querySelectorAll('input[name="scaffoldType"]');
    scaffoldTypeInputs.forEach(input => {
        input.addEventListener('change', handleScaffoldTypeChange);
    });
    
    // Universal options
    const universalSelects = document.querySelectorAll('.universal-options select');
    universalSelects.forEach(select => {
        select.addEventListener('change', handleOptionChange);
    });
    
    // Copy button
    elements.copyPrompt.addEventListener('click', copyPromptToClipboard);
    
    // Export buttons
    elements.downloadTxt.addEventListener('click', () => downloadPrompt('txt'));
    elements.downloadMd.addEventListener('click', () => downloadPrompt('md'));
    elements.shareUrl.addEventListener('click', shareConfiguration);
    
    // Handle URL parameters on load
    handleUrlParams();
}

/**
 * Handle scaffold type change
 */
function handleScaffoldTypeChange(event) {
    currentScaffoldType = event.target.value;
    currentOptions = {}; // Reset options when type changes
    updateDynamicOptions();
    updatePrompt();
}

/**
 * Handle option change (both dynamic and universal)
 */
function handleOptionChange(event) {
    const name = event.target.name;
    const value = event.target.value;
    
    currentOptions[name] = value;
    updatePrompt();
}

/**
 * Handle conditional field visibility
 */
function handleConditionalFields(event) {
    const fieldName = event.target.name;
    const fieldValue = event.target.value;
    
    // Find all conditional fields that depend on this field
    const conditionalFields = elements.dynamicOptions.querySelectorAll(`[data-condition="${fieldName}"]`);
    
    conditionalFields.forEach(field => {
        const expectedValue = field.getAttribute('data-condition-value');
        if (fieldValue === expectedValue) {
            field.style.display = 'block';
        } else {
            field.style.display = 'none';
            // Clear the value of hidden conditional fields
            const hiddenInput = field.querySelector('input, select');
            if (hiddenInput) {
                hiddenInput.value = '';
                delete currentOptions[hiddenInput.name];
            }
        }
    });
}

/**
 * Update dynamic options based on scaffold type
 */
function updateDynamicOptions() {
    const config = CodePrompt.DYNAMIC_OPTIONS_CONFIG[currentScaffoldType];
    
    if (!config) {
        elements.dynamicOptions.innerHTML = '';
        return;
    }
    
    const html = config.map(option => {
        return createFormElement(option);
    }).join('');
    
    elements.dynamicOptions.innerHTML = html;
    
    // Add event listeners to new elements and set default values
    const newInputs = elements.dynamicOptions.querySelectorAll('input, select');
    newInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            handleOptionChange(e);
            handleConditionalFields(e);
        });
        input.addEventListener('input', handleOptionChange);
        
        // Set default values
        const config = CodePrompt.DYNAMIC_OPTIONS_CONFIG[currentScaffoldType].find(opt => opt.name === input.name);
        if (config && config.default) {
            input.value = config.default;
            currentOptions[input.name] = config.default;
        }
        
        // Also capture current value if already set
        if (input.value) {
            currentOptions[input.name] = input.value;
        }
        
        // For select elements, capture the selected value
        if (input.tagName === 'SELECT' && input.selectedIndex >= 0) {
            currentOptions[input.name] = input.options[input.selectedIndex].value;
        }
    });
    
    // Trigger an immediate update to ensure all values are captured
    setTimeout(() => updatePrompt(), 100);
}

/**
 * Create form element HTML based on configuration
 */
function createFormElement(config) {
    const { name, label, type, options, placeholder, required, default: defaultValue, condition } = config;
    
    let inputHtml = '';
    
    if (type === 'select') {
        // If no default is specified, use the first option as default
        const actualDefault = defaultValue || (options && options[0] ? options[0].value : '');
        
        const optionsHtml = options.map(opt => 
            `<option value="${opt.value}"${opt.value === actualDefault ? ' selected' : ''}>${opt.label}</option>`
        ).join('');
        
        inputHtml = `<select name="${name}" class="form-select" ${required ? 'required' : ''}>${optionsHtml}</select>`;
        
        // Store the default value
        if (actualDefault) {
            currentOptions[name] = actualDefault;
        }
    } else if (type === 'input') {
        const actualDefault = defaultValue || '';
        
        inputHtml = `<input type="text" name="${name}" class="form-input" 
                     ${placeholder ? `placeholder="${placeholder}"` : ''} 
                     ${actualDefault ? `value="${actualDefault}"` : ''}
                     ${required ? 'required' : ''}>`;
        
        // Store the default value
        if (actualDefault) {
            currentOptions[name] = actualDefault;
        }
    }
    
    // Add conditional visibility attributes if condition exists
    const conditionalAttr = condition ? `data-condition="${condition.field}" data-condition-value="${condition.value}" style="display: none;"` : '';
    
    return `
        <div class="form-group" ${conditionalAttr}>
            <label class="form-label">${label}${required ? ' *' : ''}</label>
            ${inputHtml}
        </div>
    `;
}

/**
 * Update the generated prompt and analytics
 */
function updatePrompt() {
    // Collect all current options (dynamic + universal)
    const allOptions = { ...currentOptions };
    
    // Add universal options
    const universalInputs = document.querySelectorAll('.universal-options input, .universal-options select');
    universalInputs.forEach(input => {
        if (input.value) {
            allOptions[input.name] = input.value;
        }
    });
    
    // Collect dynamic options to ensure they're all captured
    const dynamicInputs = document.querySelectorAll('#dynamicOptions input, #dynamicOptions select');
    dynamicInputs.forEach(input => {
        if (input.value) {
            allOptions[input.name] = input.value;
        }
    });
    
    
    // Generate base prompt
    const basePrompt = CodePrompt.buildPrompt(currentScaffoldType, allOptions);
    
    // Optimize prompt with context (context is now shown in UI based on user selections)
    const optimizedPrompt = CodePrompt.optimizePrompt(basePrompt, allOptions, {});
    
    // Analyze efficiency
    const analysis = CodePrompt.analyzeTokenEfficiency(optimizedPrompt);
    
    // Update display
    updatePromptDisplay(optimizedPrompt, analysis);
    updateAnalyticsDisplay(analysis);
    updateOptimizationTips(analysis.recommendations);
    updatePromptVariations(basePrompt, allOptions);
    updateContextDisplay();
}

/**
 * Update prompt display
 */
function updatePromptDisplay(prompt, analysis) {
    elements.promptContent.innerHTML = `<p class="generated">${prompt}</p>`;
    elements.promptContent.classList.add('generated');
}

/**
 * Update analytics display
 */
function updateAnalyticsDisplay(analysis) {
    elements.tokenCount.textContent = analysis.estimatedTokens;
    elements.efficiency.textContent = analysis.efficiency;
    
    // Update efficiency color
    const efficiencyClasses = {
        'excellent': 'var(--success)',
        'good': 'var(--accent-color)',
        'fair': 'var(--warning)',
        'verbose': 'var(--error)'
    };
    elements.efficiency.style.color = efficiencyClasses[analysis.efficiency] || 'var(--text-primary)';
}

/**
 * Update context display based on user selections
 */
function updateContextDisplay() {
    // Get current user selections
    const allOptions = { ...currentOptions };
    
    // Add universal options
    const universalInputs = document.querySelectorAll('.universal-options input, .universal-options select');
    universalInputs.forEach(input => {
        if (input.value) {
            allOptions[input.name] = input.value;
        }
    });
    
    // Collect dynamic options
    const dynamicInputs = document.querySelectorAll('#dynamicOptions input, #dynamicOptions select');
    dynamicInputs.forEach(input => {
        if (input.value) {
            allOptions[input.name] = input.value;
        }
    });
    
    // Create context items based on actual user selections
    const contextItems = [];
    
    // Framework detection
    if (allOptions.framework) {
        const frameworkMap = {
            'react': 'React framework',
            'vue': 'Vue.js framework', 
            'angular': 'Angular framework',
            'svelte': 'Svelte framework',
            'next': 'Next.js framework',
            'nuxt': 'Nuxt.js framework',
            'gatsby': 'Gatsby framework',
            'astro': 'Astro framework',
            'express': 'Express.js backend',
            'fastify': 'Fastify backend',
            'nest': 'NestJS backend',
            'electron': 'Electron desktop app',
            'tauri': 'Tauri desktop app'
        };
        
        if (frameworkMap[allOptions.framework]) {
            contextItems.push(frameworkMap[allOptions.framework]);
        } else if (allOptions.customFramework) {
            contextItems.push(`${allOptions.customFramework} framework`);
        } else if (allOptions.framework !== 'vanilla') {
            contextItems.push(`${allOptions.framework} framework`);
        }
    }
    
    // Package manager detection
    if (allOptions.packageManager && allOptions.packageManager !== 'npm') {
        contextItems.push(`${allOptions.packageManager} package manager`);
    }
    
    // Project type detection
    if (allOptions.projectType) {
        const typeMap = {
            'full-stack': 'Full-stack project',
            'cli': 'CLI application',
            'library': 'Library project'
        };
        
        if (typeMap[allOptions.projectType]) {
            contextItems.push(typeMap[allOptions.projectType]);
        }
    }
    
    // Structure detection
    if (allOptions.structure) {
        const structureMap = {
            'monorepo': 'Monorepo structure',
            'modular': 'Modular architecture',
            'layered': 'Layered architecture'
        };
        
        if (structureMap[allOptions.structure]) {
            contextItems.push(structureMap[allOptions.structure]);
        }
    }
    
    // Testing library detection
    if (allOptions.library && allOptions.library !== 'jest') {
        contextItems.push(`${allOptions.library} testing`);
    }
    
    // Priority detection for fix issues
    if (allOptions.priority && ['critical', 'high'].includes(allOptions.priority)) {
        contextItems.push(`${allOptions.priority} priority issue`);
    }
    
    // Output format optimization
    if (allOptions.outputFormat === 'code') {
        contextItems.push('Code-only output');
    }
    
    // Complexity setting
    if (allOptions.complexity === 'simple') {
        contextItems.push('Simple implementation');
    } else if (allOptions.complexity === 'complex') {
        contextItems.push('Full-featured implementation');
    }
    
    // Update display
    const contextCount = contextItems.length;
    elements.contextItems.textContent = contextCount;
    
    if (contextItems.length > 0) {
        elements.contextList.innerHTML = contextItems.map(item => 
            `<span class="context-item">${item}</span>`
        ).join('');
        elements.contextDetection.style.display = 'block';
    } else {
        elements.contextDetection.style.display = 'none';
    }
}

/**
 * Update optimization tips
 */
function updateOptimizationTips(recommendations) {
    if (recommendations.length > 0) {
        elements.tipsList.innerHTML = recommendations.map(tip => 
            `<li>${tip}</li>`
        ).join('');
        elements.optimizationTips.style.display = 'block';
    } else {
        elements.optimizationTips.style.display = 'none';
    }
}

/**
 * Update prompt variations
 */
function updatePromptVariations(basePrompt, options) {
    const variations = CodePrompt.generatePromptVariations(basePrompt, options);
    
    const variationsHtml = variations.map((variation, index) => {
        const analysis = CodePrompt.analyzeTokenEfficiency(variation.prompt);
        
        return `
            <div class="variation-card">
                <div class="variation-header">
                    <span class="variation-name">${variation.name}</span>
                    <button class="variation-copy" onclick="copyVariation('${escapeHtml(variation.prompt)}')">
                        📋 Copy
                    </button>
                </div>
                <div class="variation-desc">${variation.description} • ${analysis.estimatedTokens} tokens</div>
                <div class="variation-prompt">${variation.prompt}</div>
            </div>
        `;
    }).join('');
    
    elements.variationsContainer.innerHTML = variationsHtml;
}

/**
 * Copy prompt to clipboard
 */
async function copyPromptToClipboard() {
    const promptText = elements.promptContent.textContent;
    
    try {
        await navigator.clipboard.writeText(promptText);
        showToast('Prompt copied to clipboard! 📋');
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = promptText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Prompt copied to clipboard! 📋');
    }
}

/**
 * Copy variation to clipboard
 */
async function copyVariation(promptText) {
    try {
        await navigator.clipboard.writeText(promptText);
        showToast('Variation copied to clipboard! 📋');
    } catch (err) {
        const textArea = document.createElement('textarea');
        textArea.value = promptText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Variation copied to clipboard! 📋');
    }
}

/**
 * Download prompt as file
 */
function downloadPrompt(format) {
    const prompt = elements.promptContent.textContent;
    const analysis = CodePrompt.analyzeTokenEfficiency(prompt);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    let content, filename, mimeType;
    
    if (format === 'md') {
        content = `# AI Prompt: ${currentScaffoldType}

## Prompt
\`\`\`
${prompt}
\`\`\`

## Analysis
- **Token Count:** ${analysis.estimatedTokens}
- **Efficiency:** ${analysis.efficiency}

## Options
\`\`\`json
${JSON.stringify(currentOptions, null, 2)}
\`\`\`

## Project Context
\`\`\`json
${JSON.stringify(currentProjectContext, null, 2)}
\`\`\`
`;
        filename = `prompt-${currentScaffoldType}-${timestamp}.md`;
        mimeType = 'text/markdown';
    } else {
        content = `${prompt}

--- ANALYSIS ---
Tokens: ${analysis.estimatedTokens}
Efficiency: ${analysis.efficiency}

--- OPTIONS ---
${JSON.stringify(currentOptions, null, 2)}`;
        filename = `prompt-${currentScaffoldType}-${timestamp}.txt`;
        mimeType = 'text/plain';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast(`Downloaded ${filename} 📥`);
}

/**
 * Share configuration via URL
 */
function shareConfiguration() {
    const config = {
        type: currentScaffoldType,
        options: currentOptions
    };
    
    const encoded = btoa(JSON.stringify(config));
    const shareUrl = `${window.location.origin}${window.location.pathname}?config=${encoded}`;
    
    try {
        navigator.clipboard.writeText(shareUrl);
        showToast('Share URL copied to clipboard! 🔗');
    } catch (err) {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Share URL copied to clipboard! 🔗');
    }
}

/**
 * Handle URL parameters for shared configurations
 */
function handleUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const configParam = urlParams.get('config');
    
    if (configParam) {
        try {
            const config = JSON.parse(atob(configParam));
            
            // Set scaffold type
            if (config.type) {
                const typeInput = document.querySelector(`input[name="scaffoldType"][value="${config.type}"]`);
                if (typeInput) {
                    typeInput.checked = true;
                    currentScaffoldType = config.type;
                }
            }
            
            // Set options
            if (config.options) {
                currentOptions = { ...config.options };
            }
            
            // Update UI
            updateDynamicOptions();
            
            // Set form values
            setTimeout(() => {
                Object.keys(currentOptions).forEach(key => {
                    const input = document.querySelector(`[name="${key}"]`);
                    if (input) {
                        input.value = currentOptions[key];
                    }
                });
                updatePrompt();
            }, 100);
            
        } catch (err) {
            console.warn('Failed to parse shared configuration:', err);
        }
    }
}

/**
 * Show toast notification
 */
function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add('show');
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

/**
 * Escape HTML for safe insertion
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/'/g, "\\'");
}

/**
 * Debounce function for performance
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounced update function
const debouncedUpdate = debounce(updatePrompt, 300);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Make functions globally available for inline event handlers
window.copyVariation = copyVariation;
