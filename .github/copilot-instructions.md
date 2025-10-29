# ioBroker Adapter Development with GitHub Copilot

**Version:** 0.4.2
**Template Source:** https://github.com/DrozmotiX/ioBroker-Copilot-Instructions

This file contains instructions and best practices for GitHub Copilot when working on ioBroker adapter development.

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

## Testing

### Unit Testing
- Use Jest as the primary testing framework for ioBroker adapters
- Create tests for all adapter main functions and helper methods
- Test error handling scenarios and edge cases
- Mock external API calls to Starline services for reliable testing
- Ensure tests don't require actual car connection
- For Starline adapter, provide example data files with mock car status responses to allow testing without live connection
- Example test structure:
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

**IMPORTANT**: Use the official `@iobroker/testing` framework for all integration tests. This is the ONLY correct way to test ioBroker adapters.

**Official Documentation**: https://github.com/ioBroker/testing

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
                            resolve();
                        } else {
                            reject(new Error('No states created by adapter'));
                        }
                        
                    } catch (error) {
                        console.error('❌ Integration test failed:', error);
                        reject(error);
                    }
                });
            });
        });
    }
}).timeout(45000);
```

#### Key Integration Testing Rules for Starline

1. **NEVER test Starline API URLs directly** - Let the adapter handle API calls
2. **ALWAYS use the harness** - `getHarness()` provides the testing environment  
3. **Configure via objects** - Use `harness.objects.setObject()` to set Starline credentials
4. **Start properly** - Use `harness.startAdapterAndWait()` to start the adapter
5. **Check car states** - Use `harness.states.getState()` to verify car data states
6. **Use timeouts** - Allow time for async API operations with appropriate timeouts
7. **Test real workflow** - Initialize → Configure → Start → Connect to Starline → Verify States

#### Starline-Specific API Testing with Credentials
For testing with actual Starline API credentials:

1. **Use test/demo credentials when available**
2. **Implement password encryption** for integration tests:
   ```javascript
   async function encryptPassword(harness, password) {
       const systemConfig = await harness.objects.getObjectAsync("system.config");
       if (!systemConfig || !systemConfig.native || !systemConfig.native.secret) {
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
3. **Test connection establishment**:
   ```javascript
   it("Should connect to Starline API", async () => {
       const connectionState = await harness.states.getStateAsync("starline.0.info.connection");
       
       if (connectionState && connectionState.val === true) {
           console.log("✅ SUCCESS: Starline API connection established");
           return true;
       } else {
           throw new Error("Starline API Test Failed: Expected API connection to be established. " +
               "Check logs above for specific API errors (authentication, network issues, etc.)");
       }
   }).timeout(120000);
   ```

## Error Handling

### API Communication
- Implement robust error handling for Starline API calls
- Handle network timeouts and connection failures gracefully
- Retry failed requests with exponential backoff
- Log appropriate error messages without exposing sensitive data

### Adapter Lifecycle
- Properly handle adapter start/stop/restart scenarios
- Clean up timers and intervals in unload() method
- Manage connection states appropriately
- Handle configuration changes without breaking existing connections

## Logging Best Practices

Use appropriate logging levels:
- `this.log.error()` - Critical errors that prevent functionality
- `this.log.warn()` - Non-critical issues or deprecated features
- `this.log.info()` - Important operational information
- `this.log.debug()` - Detailed debugging information (not shown by default)

For Starline adapter specifically:
- Log API connection status changes
- Log car command executions (without sensitive details)
- Debug log API request/response data (sanitized)
- Error log authentication failures or API errors

## Configuration Management

### JSON-Config Best Practices
- Define clear configuration schema in io-package.json
- Validate configuration parameters on adapter start
- Provide helpful error messages for invalid configurations
- Support secure credential storage for Starline API access

### State Management
- Create appropriate state structure for car data
- Use meaningful state names and descriptions
- Set proper state types and roles
- Implement state caching for frequently accessed data

## Development Guidelines

Follow ioBroker adapter development patterns:
- Use appropriate logging levels (error, warn, info, debug)
- Implement proper error handling and recovery
- Ensure clean resource cleanup in unload() method
- Test both success and failure scenarios
- Follow semantic versioning for releases
- Maintain compatibility with minimum ioBroker version

### Code Style
- Use consistent indentation and formatting
- Add JSDoc comments for functions and methods
- Use meaningful variable and function names
- Follow ESLint configuration defined in the project

### API Integration
- Store Starline API credentials securely in adapter configuration
- Implement proper authentication handling
- Rate limit API requests to avoid service restrictions
- Cache API responses where appropriate to reduce load

## Dependency Management

### Production Dependencies
- Keep production dependencies minimal
- Use `@iobroker/adapter-core` as the base adapter framework
- Prefer well-maintained libraries with active communities
- Always check for security vulnerabilities before adding new dependencies

### Development Dependencies  
- Use `@iobroker/testing` for integration tests
- Include appropriate linting and formatting tools (ESLint, Prettier)
- Use TypeScript type definitions when available
- Keep dev dependencies up to date for security and functionality

## CI/CD Guidelines

### GitHub Actions
- Use the official ioBroker test-and-release workflow as the foundation
- Ensure tests run on multiple Node.js versions (18, 20, 22)
- Include integration tests in CI pipeline
- Test on multiple operating systems (Linux, Windows, macOS) when relevant

### Release Process
- Follow semantic versioning (semver) strictly
- Use conventional commit messages for automated changelog generation
- Ensure all tests pass before releasing
- Update documentation with each release

### Automated Testing
```yaml
# Example CI pipeline for Starline adapter
name: Test and Release

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]
    
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run test:integration
```

## README Updates

### Required Sections for Starline Adapter
When updating README.md files, ensure these sections are present and well-documented:

1. **Installation** - Clear npm/ioBroker admin installation steps
2. **Configuration** - Detailed configuration options for Starline API credentials
3. **Usage** - Practical examples of car control and monitoring use cases
4. **Supported Devices** - List of compatible Starline telematics devices
5. **Changelog** - Version history and changes (use "## **WORK IN PROGRESS**" section for ongoing changes following AlCalzone release-script standard)
6. **License** - License information (typically MIT for ioBroker adapters)
7. **Support** - Links to issues, discussions, and community support

### Documentation Standards
- Use clear, concise language
- Include code examples for Starline configuration
- Add screenshots for admin interface when applicable
- Maintain multilingual support (at minimum English and German)
- Document all car control functions and their effects
- Include troubleshooting section for common Starline API issues
- When creating PRs, add entries to README under "## **WORK IN PROGRESS**" section following ioBroker release script standard
- Always reference related issues in commits and PR descriptions (e.g., "solves #xx" or "fixes #xx")

## JSON-Config Management

### Admin Interface Configuration
- Define clear configuration schema in io-package.json for Starline credentials
- Use appropriate input types (password, select, checkbox) in JSON config
- Implement proper validation for configuration parameters
- Provide helpful tooltips and descriptions for each configuration option
- Support secure credential storage for Starline API access

### Example JSON-Config Schema for Starline:
```javascript
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

### State Structure Management
- Create logical state hierarchy for car data (e.g., `car.engine.*`, `car.security.*`, `car.location.*`)
- Use appropriate state types and roles for each data point
- Implement proper state descriptions and units
- Cache frequently accessed states to improve performance

## Specific Patterns for Starline Integration

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

This initial setup provides GitHub Copilot with comprehensive context about the ioBroker.starline adapter for enhanced code suggestions and development assistance.

## Migration and Compatibility

### Node.js Version Management
- Support minimum Node.js version 18 as required by current ioBroker standards
- Test compatibility with latest LTS versions (20, 22)
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

This comprehensive guide provides GitHub Copilot with detailed context about ioBroker adapter development patterns, Starline-specific requirements, and best practices for creating reliable, maintainable, and secure integration code.