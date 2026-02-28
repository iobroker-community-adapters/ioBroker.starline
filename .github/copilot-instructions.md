# ioBroker Adapter Development with GitHub Copilot

**Version:** 0.5.7  
**Template Source:** https://github.com/DrozmotiX/ioBroker-Copilot-Instructions

This file contains instructions and best practices for GitHub Copilot when working on ioBroker adapter development.

---

## 📑 Table of Contents

1. [Project Context](#project-context)
2. [Code Quality & Standards](#code-quality--standards)
   - [Code Style Guidelines](#code-style-guidelines)
   - [ESLint Configuration](#eslint-configuration)
3. [Testing](#testing)
   - [Unit Testing](#unit-testing)
   - [Integration Testing](#integration-testing)
   - [API Testing with Credentials](#api-testing-with-credentials)
4. [Development Best Practices](#development-best-practices)
   - [Dependency Management](#dependency-management)
   - [HTTP Client Libraries](#http-client-libraries)
   - [Error Handling](#error-handling)
5. [Admin UI Configuration](#admin-ui-configuration)
   - [JSON-Config Setup](#json-config-setup)
   - [Translation Management](#translation-management)
6. [Documentation](#documentation)
   - [README Updates](#readme-updates)
   - [Changelog Management](#changelog-management)
7. [CI/CD & GitHub Actions](#cicd--github-actions)
   - [Workflow Configuration](#workflow-configuration)
   - [Testing Integration](#testing-integration)
8. [Specific Patterns for Starline Integration](#specific-patterns-for-starline-integration)
9. [Migration and Compatibility](#migration-and-compatibility)
10. [Performance Optimization](#performance-optimization)
11. [Security Best Practices](#security-best-practices)
12. [Common Issues and Troubleshooting](#common-issues-and-troubleshooting)

---

## Project Context

You are working on an ioBroker adapter. ioBroker is an integration platform for the Internet of Things, focused on building smart home and industrial IoT solutions. Adapters are plugins that connect ioBroker to external systems, devices, or services.

## Adapter-Specific Context
- **Adapter Name**: iobroker.starline
- **Primary Function**: Control your car from iobroker with Starline Telematics
- **Target System**: Starline telematics systems for vehicle control and monitoring
- **Key Features**: Car control, status monitoring, telematics data integration
- **Communication Protocol**: Web API integration with Starline servers
- **Repository**: iobroker-community-adapters/ioBroker.starline

This adapter provides integration between ioBroker and Starline car telematics systems, allowing users to:
- Monitor car status (location, fuel level, engine status, etc.)
- Control car functions (engine start/stop, door lock/unlock, etc.)
- Receive security alerts and notifications
- Integrate car data with smart home automation scenarios

---

## Code Quality & Standards

### Code Style Guidelines

- Follow JavaScript/TypeScript best practices
- Use async/await for asynchronous operations
- Implement proper resource cleanup in `unload()` method
- Use semantic versioning for adapter releases
- Include proper JSDoc comments for public methods
- Use consistent indentation and formatting
- Use meaningful variable and function names
- Follow ESLint configuration defined in the project

**Timer and Resource Cleanup Example:**
```javascript
private connectionTimer?: NodeJS.Timeout;

async onReady() {
  this.connectionTimer = setInterval(() => this.checkConnection(), 30000);
}

onUnload(callback) {
  try {
    if (this.connectionTimer) {
      clearInterval(this.connectionTimer);
      this.connectionTimer = undefined;
    }
    callback();
  } catch (e) {
    callback();
  }
}
```

### ESLint Configuration

**CRITICAL:** ESLint validation must run FIRST in your CI/CD pipeline, before any other tests. This "lint-first" approach catches code quality issues early.

#### Setup
```bash
npm install --save-dev eslint @iobroker/eslint-config
```

#### Configuration (.eslintrc.json)
```json
{
  "extends": "@iobroker/eslint-config",
  "rules": {
    // Add project-specific rule overrides here if needed
  }
}
```

#### Package.json Scripts
```json
{
  "scripts": {
    "lint": "eslint --max-warnings 0 .",
    "lint:fix": "eslint . --fix"
  }
}
```

#### Best Practices
1. ✅ Run ESLint before committing — fix ALL warnings, not just errors
2. ✅ Use `lint:fix` for auto-fixable issues
3. ✅ Don't disable rules without documentation
4. ✅ Lint all relevant files (main code, tests, build scripts)
5. ✅ Keep `@iobroker/eslint-config` up to date
6. ✅ **ESLint warnings are treated as errors in CI** (`--max-warnings 0`). The `lint` script above already includes this flag — run `npm run lint` to match CI behavior locally

#### Common Issues
- **Unused variables**: Remove or prefix with underscore (`_variable`)
- **Missing semicolons**: Run `npm run lint:fix`
- **Indentation**: Use 4 spaces (ioBroker standard)
- **console.log**: Replace with `adapter.log.debug()` or remove

---

## Testing

### Unit Testing
- Use Jest as the primary testing framework for ioBroker adapters
- Create tests for all adapter main functions and helper methods
- Test error handling scenarios and edge cases
- Mock external API calls to Starline services for reliable testing
- Ensure tests don't require actual car connection
- For Starline adapter, provide example data files with mock car status responses to allow testing without live connection

**Example Structure:**
```javascript
describe('StarlineAdapter', () => {
  let adapter;

  beforeEach(() => {
    // Setup test adapter instance with mocked Starline API
  });

  test('should parse car status correctly', () => {
    // Test car status parsing with mock data
  });

  test('should handle API errors gracefully', () => {
    // Test error scenarios
  });
});
```

### Integration Testing

**CRITICAL:** Use the official `@iobroker/testing` framework for all integration tests. This is the ONLY correct way to test ioBroker adapters.

**Official Documentation:** https://github.com/ioBroker/testing

#### Framework Structure for Starline Adapter

Integration tests MUST follow this exact pattern:

```javascript
const path = require('path');
const { tests } = require('@iobroker/testing');

// Define test credentials and configuration
const TEST_CONFIG = {
    login: 'test@example.com',
    password: 'test123',
    device_id: 'test_device',
    app_id: 'test_app'
};
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

// Use tests.integration() with defineAdditionalTests
tests.integration(path.join(__dirname, '..'), {
    defineAdditionalTests({ suite }) {
        suite('Test Starline adapter with specific configuration', (getHarness) => {
            let harness;

            before(() => {
                harness = getHarness();
            });

            it('should configure and start adapter', function () {
                return new Promise(async (resolve, reject) => {
                    try {
                        harness = getHarness();

                        // Get adapter object using promisified pattern
                        const obj = await new Promise((res, rej) => {
                            harness.objects.getObject('system.adapter.starline.0', (err, o) => {
                                if (err) return rej(err);
                                res(o);
                            });
                        });

                        if (!obj) {
                            return reject(new Error('Adapter object not found'));
                        }

                        // Configure Starline adapter properties
                        Object.assign(obj.native, TEST_CONFIG);

                        // Set the updated configuration
                        harness.objects.setObject(obj._id, obj);

                        console.log('✅ Step 1: Configuration written, starting adapter...');

                        // Start adapter and wait
                        await harness.startAdapterAndWait();

                        console.log('✅ Step 2: Adapter started');

                        // Wait for adapter to process data
                        const waitMs = 15000;
                        await wait(waitMs);

                        console.log('🔍 Step 3: Checking states after adapter run...');

                        // Get all states created by adapter
                        const stateIds = await harness.dbConnection.getStateIDs('starline.0.*');

                        console.log(`📊 Found ${stateIds.length} states`);

                        if (stateIds.length > 0) {
                            console.log('✅ Adapter successfully created states');
                            try {
                                await harness.stopAdapter();
                            } catch (stopError) {
                                console.warn('⚠️ Could not stop adapter cleanly:', stopError);
                            }
                            resolve();
                        } else {
                            reject(new Error('No states created by adapter'));
                        }

                    } catch (error) {
                        console.error('❌ Integration test failed:', error);
                        reject(error);
                    }
                });
            }).timeout(45000);
        });
    }
});
```

#### Testing Success AND Failure Scenarios

**IMPORTANT:** For every "it works" test, implement corresponding "it fails gracefully" tests.

#### Key Integration Testing Rules for Starline

1. ✅ **ALWAYS use the harness** - `getHarness()` provides the testing environment
2. ✅ **Configure via objects** - Use `harness.objects.setObject()` to set Starline credentials
3. ✅ **Start properly** - Use `harness.startAdapterAndWait()` to start the adapter
4. ✅ **Check car states** - Use `harness.states.getState()` to verify car data states
5. ✅ **Use timeouts** - Allow time for async API operations with appropriate timeouts
6. ✅ **Test real workflow** - Initialize → Configure → Start → Connect to Starline → Verify States
7. ❌ **NEVER test Starline API URLs directly** - Let the adapter handle API calls
8. ❌ **NEVER bypass the harness system**

#### Workflow Dependencies

Integration tests should run ONLY after lint and adapter tests pass:

```yaml
integration-tests:
  needs: [check-and-lint, adapter-tests]
  runs-on: ubuntu-22.04
```

### API Testing with Credentials

For testing with actual Starline API credentials:

#### Password Encryption for Integration Tests

```javascript
async function encryptPassword(harness, password) {
    const systemConfig = await harness.objects.getObjectAsync("system.config");
    if (!systemConfig?.native?.secret) {
        throw new Error("Could not retrieve system secret for password encryption");
    }

    const secret = systemConfig.native.secret;
    let result = '';
    for (let i = 0; i < password.length; ++i) {
        result += String.fromCharCode(secret[i % secret.length].charCodeAt(0) ^ password.charCodeAt(i));
    }
    return result;
}
```

#### Test Connection Establishment

```javascript
it("Should connect to Starline API", async () => {
    const connectionState = await harness.states.getStateAsync("starline.0.info.connection");

    if (connectionState?.val === true) {
        console.log("✅ SUCCESS: Starline API connection established");
        return true;
    } else {
        throw new Error("Starline API Test Failed: Expected API connection to be established. " +
            "Check logs above for specific API errors (authentication, network issues, etc.)");
    }
}).timeout(120000);
```

---

## Development Best Practices

### Dependency Management

- Always use `npm` for dependency management
- Use `npm ci` for installing existing dependencies (respects package-lock.json)
- Use `npm install` only when adding or updating dependencies
- Keep dependencies minimal and focused
- Only update dependencies in separate Pull Requests

**When modifying package.json:**
1. Run `npm install` to sync package-lock.json
2. Commit both package.json and package-lock.json together

**Best Practices:**
- Prefer built-in Node.js modules when possible
- Use `@iobroker/adapter-core` for adapter base functionality
- Avoid deprecated packages
- Always check for security vulnerabilities before adding new dependencies

### HTTP Client Libraries

- **Preferred:** Use native `fetch` API (Node.js 20+ required)
- **Avoid:** `axios` unless specific features are required

**Example with fetch:**
```javascript
try {
  const response = await fetch('https://api.starline.ru/data');
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  const data = await response.json();
} catch (error) {
  this.log.error(`Starline API request failed: ${error.message}`);
}
```

**Other Recommendations:**
- **Logging:** Use adapter built-in logging (`this.log.*`)
- **Scheduling:** Use adapter built-in timers and intervals
- **File operations:** Use Node.js `fs/promises`
- **Configuration:** Use adapter config system

### Error Handling

- Always catch and log errors appropriately
- Use adapter log levels (error, warn, info, debug)
- Provide meaningful, user-friendly error messages
- Handle network failures gracefully
- Implement retry mechanisms where appropriate
- Always clean up timers, intervals, and resources in `unload()` method

For Starline adapter specifically:
- Log API connection status changes
- Log car command executions (without sensitive details)
- Debug log API request/response data (sanitized)
- Error log authentication failures or API errors

**Example:**
```javascript
try {
  await this.connectToStarline();
} catch (error) {
  this.log.error(`Failed to connect to Starline API: ${error.message}`);
  this.setState('info.connection', false, true);
  // Implement retry logic if needed
}
```

---

## Admin UI Configuration

### JSON-Config Setup

Use JSON-Config format for modern ioBroker admin interfaces.

**Guidelines:**
- ✅ Use consistent naming conventions
- ✅ Provide sensible default values
- ✅ Include validation for required fields
- ✅ Add tooltips for complex options
- ✅ Ensure translations for all supported languages (minimum English and German)
- ✅ Write end-user friendly labels, avoid technical jargon
- ✅ Use appropriate input types (password, select, checkbox) in JSON config
- ✅ Support secure credential storage for Starline API access

**Example JSON-Config Schema for Starline:**
```json
{
    "type": "panel",
    "items": {
        "login": {
            "type": "text",
            "label": "Starline Login",
            "placeholder": "your-email@example.com"
        },
        "password": {
            "type": "password",
            "label": "Starline Password"
        },
        "device_id": {
            "type": "text",
            "label": "Device ID",
            "help": "Your Starline device identifier"
        },
        "polling_interval": {
            "type": "number",
            "label": "Polling Interval (minutes)",
            "min": 1,
            "max": 60,
            "default": 5
        }
    }
}
```

### Translation Management

**CRITICAL:** Translation files must stay synchronized with `admin/jsonConfig.json`. Orphaned keys or missing translations cause UI issues and PR review delays.

#### Overview
- **Location:** `admin/i18n/{lang}/translations.json` for 11 languages (de, en, es, fr, it, nl, pl, pt, ru, uk, zh-cn)
- **Source of truth:** `admin/jsonConfig.json` - all `label` and `help` properties must have translations
- **Command:** `npm run translate` - auto-generates translations but does NOT remove orphaned keys
- **Formatting:** English uses tabs, other languages use 4 spaces

#### Critical Rules
1. ✅ Keys must match exactly with jsonConfig.json
2. ✅ No orphaned keys in translation files
3. ✅ All translations must be in native language (no English fallbacks)
4. ✅ Keys must be sorted alphabetically

#### Workflow for Translation Updates

**When modifying admin/jsonConfig.json:**

1. Make your changes to labels/help texts
2. Run automatic translation: `npm run translate`
3. Validate translations using a script or manual check
4. Remove orphaned keys manually from all translation files
5. Add missing translations in native languages
6. Run: `npm run lint && npm run test`

---

## Documentation

### README Updates

#### Required Sections for Starline Adapter
When updating README.md files, ensure these sections are present and well-documented:

1. **Installation** - Clear npm/ioBroker admin installation steps
2. **Configuration** - Detailed configuration options for Starline API credentials
3. **Usage** - Practical examples of car control and monitoring use cases
4. **Supported Devices** - List of compatible Starline telematics devices
5. **Changelog** - Version history and changes (use "## **WORK IN PROGRESS**" section for ongoing changes following AlCalzone release-script standard)
6. **License** - License information (typically MIT for ioBroker adapters)
7. **Support** - Links to issues, discussions, and community support

#### Documentation Standards
- Use clear, concise language
- Include code examples for Starline configuration
- Add screenshots for admin interface when applicable
- Maintain multilingual support (at minimum English and German)
- Document all car control functions and their effects
- Include troubleshooting section for common Starline API issues
- When creating PRs, add entries to README under "## **WORK IN PROGRESS**" section following ioBroker release script standard
- Always reference related issues in commits and PR descriptions (e.g., "solves #xx" or "fixes #xx")

#### Mandatory README Updates for PRs

For **every PR or new feature**, always add a user-friendly entry to README.md:

- Add entries under `## **WORK IN PROGRESS**` section
- Use format: `* (author) **TYPE**: Description of user-visible change`
- Types: **NEW** (features), **FIXED** (bugs), **ENHANCED** (improvements), **TESTING** (test additions), **CI/CD** (automation)
- Focus on user impact, not technical details

**Example:**
```markdown
## **WORK IN PROGRESS**

* (DutchmanNL) **FIXED**: Adapter now properly validates login credentials (fixes #25)
* (DutchmanNL) **NEW**: Added device discovery to simplify initial setup
```

### Changelog Management

Follow the [AlCalzone release-script](https://github.com/AlCalzone/release-script) standard.

#### Format Requirements

```markdown
# Changelog

<!--
  Placeholder for the next version (at the beginning of the line):
  ## **WORK IN PROGRESS**
-->

## **WORK IN PROGRESS**

- (author) **NEW**: Added new feature X
- (author) **FIXED**: Fixed bug Y (fixes #25)

## v0.1.0 (2023-01-01)
Initial release
```

#### Workflow Process
- **During Development:** All changes go under `## **WORK IN PROGRESS**`
- **For Every PR:** Add user-facing changes to WORK IN PROGRESS section
- **Before Merge:** Version number and date added when merging to main
- **Release Process:** Release-script automatically converts placeholder to actual version

#### Change Entry Format
- Format: `- (author) **TYPE**: User-friendly description`
- Types: **NEW**, **FIXED**, **ENHANCED**
- Focus on user impact, not technical implementation
- Reference issues: "fixes #XX" or "solves #XX"

---

## CI/CD & GitHub Actions

### Workflow Configuration

#### GitHub Actions Best Practices

**Must use ioBroker official testing actions:**
- `ioBroker/testing-action-check@v1` for lint and package validation
- `ioBroker/testing-action-adapter@v1` for adapter tests
- `ioBroker/testing-action-deploy@v1` for automated releases with Trusted Publishing (OIDC)

**Configuration:**
- **Node.js versions:** Test on 20.x, 22.x, 24.x
- **Platform:** Use ubuntu-22.04
- **Automated releases:** Deploy to npm on version tags (requires NPM Trusted Publishing)

#### Critical: Lint-First Validation Workflow

**ALWAYS run ESLint checks BEFORE other tests.** Benefits:
- Catches code quality issues immediately
- Prevents wasting CI resources on tests that would fail due to linting errors
- Provides faster feedback to developers
- Enforces consistent code quality

**Workflow Dependency Configuration:**
```yaml
jobs:
  check-and-lint:
    # Runs ESLint and package validation
    # Uses: ioBroker/testing-action-check@v1

  adapter-tests:
    needs: [check-and-lint]  # Wait for linting to pass
    # Run adapter unit tests

  integration-tests:
    needs: [check-and-lint, adapter-tests]  # Wait for both
    # Run integration tests
```

**Key Points:**
- The `check-and-lint` job has NO dependencies - runs first
- ALL other test jobs MUST list `check-and-lint` in their `needs` array
- If linting fails, no other tests run, saving time
- Fix all ESLint errors before proceeding

### Testing Integration

#### API Testing in CI/CD

For adapters with external API dependencies:

```yaml
demo-api-tests:
  if: contains(github.event.head_commit.message, '[skip ci]') == false
  runs-on: ubuntu-22.04

  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Use Node.js 20.x
      uses: actions/setup-node@v4
      with:
        node-version: 20.x
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run demo API tests
      run: npm run test:integration-demo
```

#### Testing Best Practices
- Run credential tests separately from main test suite
- Don't make credential tests required for deployment
- Provide clear failure messages for API issues
- Use appropriate timeouts for external calls (120+ seconds)

#### Package.json Integration
```json
{
  "scripts": {
    "test:integration-demo": "mocha test/integration-demo --exit"
  }
}
```

---

## Specific Patterns for Starline Integration

### State Management
- Create logical state hierarchy for car data (e.g., `car.engine.*`, `car.security.*`, `car.location.*`)
- Use appropriate state types and roles for each data point
- Implement proper state descriptions and units
- Cache frequently accessed states to improve performance

### State Creation
```javascript
// Create states for car data with proper types and roles
await this.setObjectNotExistsAsync('car.location.latitude', {
    type: 'state',
    common: {
        name: 'Car Latitude',
        type: 'number',
        role: 'value.gps.latitude',
        read: true,
        write: false,
        unit: '°'
    },
    native: {}
});
```

### Command Handling
```javascript
// Handle car control commands
this.on('stateChange', (id, state) => {
    if (state && !state.ack && id.endsWith('.command.engine')) {
        this.executeCarCommand('engine', state.val);
    }
});
```

### Error Recovery
```javascript
// Implement retry logic for API failures
async retryApiCall(apiFunction, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await apiFunction();
        } catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }
            await this.delay(1000 * attempt); // Exponential backoff
        }
    }
}
```

---

## Migration and Compatibility

### Node.js Version Management
- Support minimum Node.js version 18 as required by current ioBroker standards
- Test compatibility with latest LTS versions (20, 22, 24)
- Update dependencies when Node.js versions change
- Use appropriate async/await patterns and modern JavaScript features

### ioBroker Core Compatibility
- Maintain compatibility with js-controller >= 5.0
- Follow adapter lifecycle best practices (ready, unload, stateChange handlers)
- Use modern adapter APIs and avoid deprecated methods
- Implement proper adapter termination and cleanup

### Breaking Changes Management
- Document breaking changes clearly in changelog
- Provide migration guides for major version updates
- Use semantic versioning to communicate compatibility
- Test upgrade scenarios from previous versions

---

## Performance Optimization

### Memory Management
- Implement proper cleanup in unload() method
- Clear timers and intervals appropriately
- Avoid memory leaks in API polling loops
- Monitor memory usage during development and testing

### API Optimization for Starline
- Implement intelligent polling intervals based on car status
- Cache API responses to reduce redundant requests
- Use batch operations when possible
- Implement exponential backoff for failed requests

### State Updates
- Only update states when values actually change
- Use appropriate data types to minimize storage overhead
- Implement state caching for frequently accessed data
- Batch state updates when possible

---

## Security Best Practices

### Credential Management
- Never log passwords or API keys in plain text
- Use ioBroker's encryption for sensitive configuration data
- Implement secure storage of Starline API tokens
- Validate input to prevent injection attacks

### API Security
- Use HTTPS for all API communications
- Implement proper certificate validation
- Handle authentication tokens securely
- Follow principle of least privilege for API permissions

### Data Privacy
- Respect user privacy regarding location data
- Implement data retention policies if applicable
- Provide clear privacy documentation
- Allow users to control data sharing preferences

---

## Common Issues and Troubleshooting

### Starline API Issues
- **Authentication Errors**: Check credentials and device registration
- **Rate Limiting**: Implement backoff strategies and respect API limits
- **Network Timeouts**: Use appropriate timeout values and retry logic
- **Device Offline**: Handle gracefully when car is not connected

### Adapter Issues
- **State Creation Failures**: Verify object definitions and permissions
- **Memory Leaks**: Check for proper cleanup of timers and event listeners
- **Performance Issues**: Monitor polling intervals and API response times
- **Configuration Problems**: Validate all required settings on adapter start

### Debugging Techniques
```javascript
// Enable debug logging for Starline operations
this.log.debug('Starline API request: ' + JSON.stringify(requestData, null, 2));
this.log.debug('Starline API response: ' + JSON.stringify(responseData, null, 2));

// Log state changes for debugging
this.on('stateChange', (id, state) => {
    if (state && !state.ack) {
        this.log.debug(`Manual state change: ${id} = ${state.val}`);
    }
});
```

---

## Best Practices Summary

### Development Workflow
1. **Plan**: Define clear requirements and state structure
2. **Implement**: Follow ioBroker patterns and best practices
3. **Test**: Write comprehensive unit and integration tests
4. **Document**: Update README and code documentation
5. **Release**: Follow semantic versioning and changelog standards

### Code Quality
- Use TypeScript type definitions where available
- Implement comprehensive error handling
- Follow consistent coding style with linting
- Write self-documenting code with meaningful names
- Add appropriate JSDoc comments for public methods

### Maintenance
- Keep dependencies updated and secure
- Monitor for security vulnerabilities
- Respond promptly to user issues and bug reports
- Maintain backward compatibility when possible
- Plan for future Starline API changes