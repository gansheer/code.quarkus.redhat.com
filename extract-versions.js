const fs = require('fs');

/**
 * Extract platform versions and their corresponding camel versions from platform_props.json
 * @param {string} filePath - Path to the platform_props.json file
 * @returns {Object} Map with platformVersion as key and camel versions as values
 */
function extractPlatformCamelVersions(filePath) {
  const platformProps = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const extensions = platformProps.streamProps.platform.extensions || [];
  const streams = platformProps.streamProps.platform.streams || [];

  const versionMap = {};

  streams.forEach(stream => {
    const platformVersion = stream.platformVersion;

    // Find camel extensions that match this platform version
    const camelExtensions = extensions.filter(ext => {
      // Check if it's a camel extension
      if (!ext.id || !ext.id.startsWith('org.apache.camel.quarkus:')) {
        return false;
      }

      // Check if the BOM matches this platform version
      if (ext.bom && ext.bom.includes(platformVersion)) {
        return true;
      }

      return false;
    });

    // Extract unique camel versions from guide URLs
    const camelVersions = new Set();

    camelExtensions.forEach(ext => {
      if (ext.guide) {
        // Extract version from guide URL like:
        // https://docs.redhat.com/en/documentation/red_hat_build_of_apache_camel/4.14/html-single/...
        const match = ext.guide.match(/red_hat_build_of_apache_camel\/(\d+\.\d+)\//);
        if (match && match[1]) {
          camelVersions.add(match[1]);
        }
      }
    });

    versionMap[platformVersion] = Array.from(camelVersions).sort();
  });

  return versionMap;
}

// Usage example
const versionMap = extractPlatformCamelVersions('./platform_props.json');
console.log('Platform to Camel Versions Map:');
console.log(JSON.stringify(versionMap, null, 2));

// Export for use as a module
module.exports = { extractPlatformCamelVersions };
