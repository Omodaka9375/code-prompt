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
    try {
        console.log('Initializing CodePrompt web application...');
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize universal options with default values
        initializeUniversalOptions();
        
        // Generate initial dynamic options
        updateDynamicOptions();
        
        // Generate initial prompt after everything is set up (this will also update context)
        setTimeout(() => {
            try {
                updatePrompt();
                console.log('CodePrompt initialized successfully');
            } catch (err) {
                console.error('Error during initial prompt update:', err);
                showToast('Initialization warning - some features may not work ⚠️');
            }
        }, 200);
        
    } catch (err) {
        console.error('Critical error during initialization:', err);
        showToast('Failed to initialize application ❌');
        
        // Show fallback UI or instructions
        const fallbackMessage = document.createElement('div');
        fallbackMessage.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #ff6b6b;">
                <h3>⚠️ Application Error</h3>
                <p>Please refresh the page or check the console for details.</p>
            </div>
        `;
        document.body.appendChild(fallbackMessage);
    }
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
    const input = event.target;
    const name = input.name;
    const value = input.value;
    
    // Validate and sanitize input
    if (input.type === 'text' || input.tagName === 'TEXTAREA') {
        if (!validateFormInput(input)) {
            return; // Don't update if validation fails
        }
    }
    
    // Sanitize the value before storing
    const sanitizedValue = typeof value === 'string' ? sanitizeInput(value) : value;
    currentOptions[name] = sanitizedValue;
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
    try {
        // Collect all current options (dynamic + universal)
        const allOptions = { ...currentOptions };
        
        // Add universal options
        const universalInputs = document.querySelectorAll('.universal-options input, .universal-options select');
        universalInputs.forEach(input => {
            if (input && input.value) {
                allOptions[input.name] = input.value;
            }
        });
        
        // Collect dynamic options to ensure they're all captured
        const dynamicInputs = document.querySelectorAll('#dynamicOptions input, #dynamicOptions select');
        dynamicInputs.forEach(input => {
            if (input && input.value) {
                allOptions[input.name] = input.value;
            }
        });
        
        // Generate base prompt with error handling
        let basePrompt;
        try {
            basePrompt = CodePrompt.buildPrompt(currentScaffoldType, allOptions);
        } catch (buildErr) {
            console.error('Error building prompt:', buildErr);
            basePrompt = 'Error generating prompt. Please check your configuration.';
        }
        
        // Optimize prompt with context
        let optimizedPrompt;
        try {
            const projectContext = CodePrompt.getProjectContext();
            optimizedPrompt = CodePrompt.optimizePrompt(basePrompt, allOptions, projectContext);
        } catch (optimizeErr) {
            console.error('Error optimizing prompt:', optimizeErr);
            optimizedPrompt = basePrompt; // Fallback to base prompt
        }
        
        // Analyze efficiency
        let analysis;
        try {
            analysis = CodePrompt.analyzeTokenEfficiency(optimizedPrompt);
        } catch (analyzeErr) {
            console.error('Error analyzing prompt:', analyzeErr);
            analysis = {
                estimatedTokens: Math.ceil(optimizedPrompt.length / 4),
                efficiency: 'unknown',
                recommendations: []
            };
        }
        
        // Update display components with individual error handling
        try {
            updatePromptDisplay(optimizedPrompt, analysis);
        } catch (displayErr) {
            console.error('Error updating prompt display:', displayErr);
        }
        
        try {
            updateAnalyticsDisplay(analysis);
        } catch (analyticsErr) {
            console.error('Error updating analytics display:', analyticsErr);
        }
        
        try {
            updateOptimizationTips(analysis.recommendations || []);
        } catch (tipsErr) {
            console.error('Error updating optimization tips:', tipsErr);
        }
        
        try {
            updatePromptVariations(basePrompt, allOptions);
        } catch (variationsErr) {
            console.error('Error updating prompt variations:', variationsErr);
        }
        
        try {
            updateContextDisplay();
        } catch (contextErr) {
            console.error('Error updating context display:', contextErr);
        }
        
    } catch (err) {
        console.error('Critical error in updatePrompt:', err);
        showToast('Error updating prompt. Please refresh the page ❌');
        
        // Set minimal fallback content
        if (elements.promptContent) {
            elements.promptContent.innerHTML = '<p class="error">Error generating prompt. Please check your configuration.</p>';
        }
    }
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
 * Modern clipboard copy with fallbacks
 * @param {string} text - Text to copy
 * @param {string} successMessage - Success message to show
 */
async function copyToClipboard(text, successMessage) {
    if (!text) {
        showToast('Nothing to copy ⚠️');
        return;
    }
    
    try {
        // Try modern Clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            showToast(successMessage);
            return;
        }
    } catch (clipboardErr) {
        console.warn('Clipboard API failed, trying fallback:', clipboardErr);
    }
    
    // Fallback for older browsers or when clipboard API fails
    try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        // Try the deprecated execCommand as last resort
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
            showToast(successMessage);
        } else {
            throw new Error('execCommand failed');
        }
    } catch (fallbackErr) {
        console.error('All clipboard methods failed:', fallbackErr);
        showToast('Failed to copy to clipboard. Please copy manually ❌');
        
        // Show the text in a prompt as final fallback
        prompt('Copy this text manually:', text);
    }
}

/**
 * Copy prompt to clipboard
 */
async function copyPromptToClipboard() {
    const promptText = elements.promptContent.textContent;
    await copyToClipboard(promptText, 'Prompt copied to clipboard! 📋');
}

/**
 * Copy variation to clipboard
 */
async function copyVariation(promptText) {
    await copyToClipboard(promptText, 'Variation copied to clipboard! 📋');
}

/**
 * Download prompt as file
 * @param {string} format - File format ('txt' or 'md')
 */
function downloadPrompt(format) {
    try {
        const prompt = elements.promptContent.textContent;
        
        if (!prompt || prompt.trim() === '') {
            showToast('No prompt to download ⚠️');
            return;
        }
        
        const analysis = CodePrompt.analyzeTokenEfficiency(prompt);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        let content, filename, mimeType;
        
        // Gather optimization tips if available
        const optimizationTips = analysis.recommendations || [];
        
        if (format === 'md') {
            content = `# CodePrompt AI Prompt: ${currentScaffoldType}

> Generated on ${new Date().toLocaleDateString()}

## 🎯 Optimized Prompt

\`\`\`
${prompt}
\`\`\`

## 📈 Analysis & Metrics

- **Token Count:** ${analysis.estimatedTokens}
- **Efficiency Rating:** ${analysis.efficiency}
- **Character Length:** ${prompt.length}

## ⚙️ Configuration Options

\`\`\`json
${JSON.stringify(currentOptions, null, 2)}
\`\`\`

${optimizationTips.length > 0 ? `## 💡 Optimization Tips

${optimizationTips.map(tip => `- ${tip}`).join('\n')}

` : ''}---
*Generated by CodePrompt.me - Token-efficient AI prompt generator*
`;
            filename = `codeprompt-${currentScaffoldType}-${timestamp}.md`;
            mimeType = 'text/markdown';
        } else {
            content = `CodePrompt AI Prompt: ${currentScaffoldType.toUpperCase()}
Generated: ${new Date().toLocaleString()}

${'='.repeat(50)}
OPTIMIZED PROMPT
${'='.repeat(50)}

${prompt}

${'='.repeat(50)}
ANALYSIS & METRICS
${'='.repeat(50)}

Token Count: ${analysis.estimatedTokens}
Efficiency Rating: ${analysis.efficiency}
Character Length: ${prompt.length}

${'='.repeat(50)}
CONFIGURATION OPTIONS
${'='.repeat(50)}

${JSON.stringify(currentOptions, null, 2)}

${optimizationTips.length > 0 ? `${'='.repeat(50)}\nOPTIMIZATION TIPS\n${'='.repeat(50)}\n\n${optimizationTips.map(tip => `- ${tip}`).join('\n')}\n\n` : ''}---
Generated by CodePrompt.me - Token-efficient AI prompt generator
`;
            filename = `codeprompt-${currentScaffoldType}-${timestamp}.txt`;
            mimeType = 'text/plain';
        }
        
        // Create and download the file
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up the URL object
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
        
        showToast(`Downloaded ${filename} 📥`);
        
    } catch (err) {
        console.error('Error downloading prompt:', err);
        showToast('Failed to download prompt ❌');
    }
}

/**
 * Share configuration via URL
 */
function shareConfiguration() {
    try {
        const config = {
            type: currentScaffoldType,
            options: currentOptions
        };
        
        let encoded;
        try {
            const jsonString = JSON.stringify(config);
            encoded = btoa(jsonString);
        } catch (stringifyErr) {
            console.error('Failed to serialize configuration:', stringifyErr);
            showToast('Failed to create share URL ❌');
            return;
        }
        
        const shareUrl = `${window.location.origin}${window.location.pathname}?config=${encoded}`;
        
        // Check URL length (browsers have limits)
        if (shareUrl.length > 2000) {
            showToast('Configuration too large for sharing ⚠️');
            return;
        }
        
        copyToClipboard(shareUrl, 'Share URL copied to clipboard! 🔗');
    } catch (err) {
        console.error('Unexpected error creating share URL:', err);
        showToast('Failed to create share URL ❌');
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
            // First decode the base64 string
            let decodedString;
            try {
                decodedString = atob(configParam);
            } catch (decodeErr) {
                console.warn('Failed to decode shared configuration URL:', decodeErr);
                showToast('Invalid share URL format ❌');
                return;
            }
            
            // Then parse the JSON
            let config;
            try {
                config = JSON.parse(decodedString);
            } catch (parseErr) {
                console.warn('Failed to parse shared configuration JSON:', parseErr);
                showToast('Invalid share URL content ❌');
                return;
            }
            
            // Validate config structure
            if (!config || typeof config !== 'object') {
                console.warn('Invalid configuration object');
                showToast('Invalid share URL data ❌');
                return;
            }
            
            // Set scaffold type
            if (config.type && typeof config.type === 'string') {
                const typeInput = document.querySelector(`input[name="scaffoldType"][value="${config.type}"]`);
                if (typeInput) {
                    typeInput.checked = true;
                    currentScaffoldType = config.type;
                }
            }
            
            // Set options
            if (config.options && typeof config.options === 'object') {
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
            
            showToast('Configuration loaded from shared URL! 🔗');
            
        } catch (err) {
            console.error('Unexpected error parsing shared configuration:', err);
            showToast('Failed to load shared configuration ❌');
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
    if (!text || typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/'/g, "\\'");
}

/**
 * Sanitize user input to prevent XSS and other issues
 * @param {string} input - User input to sanitize
 * @param {number} maxLength - Maximum length (default 1000)
 * @returns {string} Sanitized input
 */
function sanitizeInput(input, maxLength = 1000) {
    if (!input || typeof input !== 'string') return '';
    
    // Trim whitespace and limit length
    let sanitized = input.trim().substring(0, maxLength);
    
    // Remove potentially dangerous characters but keep valid punctuation
    sanitized = sanitized.replace(/[<>"'`]/g, '');
    
    return sanitized;
}

/**
 * Validate required fields
 * @param {string} value - Value to validate
 * @param {string} fieldName - Name of the field for error messages
 * @returns {boolean} True if valid
 */
function validateRequired(value, fieldName) {
    if (!value || value.trim() === '') {
        showToast(`${fieldName} is required ⚠️`);
        return false;
    }
    return true;
}

/**
 * Validate and sanitize form input
 * @param {HTMLInputElement} input - Input element to validate
 * @returns {boolean} True if valid
 */
function validateFormInput(input) {
    if (!input) return false;
    
    const value = input.value;
    const isRequired = input.hasAttribute('required');
    const fieldName = input.labels?.[0]?.textContent || input.name || 'Field';
    
    // Check required fields
    if (isRequired && !validateRequired(value, fieldName)) {
        input.focus();
        return false;
    }
    
    // Sanitize the input value
    const sanitized = sanitizeInput(value);
    if (sanitized !== value) {
        input.value = sanitized;
        showToast('Input sanitized for security 🛡️');
    }
    
    return true;
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

// Global error handlers
window.addEventListener('error', (event) => {
    console.error('Global JavaScript error:', event.error);
    showToast('An unexpected error occurred ❌');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showToast('An unexpected error occurred ❌');
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Fallback initialization if DOMContentLoaded already fired
if (document.readyState === 'loading') {
    // Document is still loading, DOMContentLoaded will fire
} else {
    // Document is already loaded
    init();
}

// Make functions globally available for inline event handlers
window.copyVariation = copyVariation;
