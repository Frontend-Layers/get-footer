// Wait for the DOM to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', async () => {
  // Select all elements with the attribute 'data-get-footer'
  const footerElements = document.querySelectorAll('[data-get-footer]');
  if (!footerElements.length) return; // Early exit if no elements found

  /**
   * Fetches package data from npm registry.
   * @param {string} pkg - The package name to fetch data for.
   * @returns {Promise<Object|null>} - Returns package data or null if fetch fails.
   */
  const getNpmData = async (pkg) => {
    try {
      const response = await fetch(`https://registry.npmjs.org/${pkg}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      return {
        name: data.name || pkg,
        version: data['dist-tags']?.latest || 'Unknown',
        description: data.description || '',
        lastUpdate: new Date(data.time[data['dist-tags']?.latest]).toISOString().split('T')[0] || 'Unknown',
        author: typeof data.author === 'object' ? data.author.name : data.author || 'Unknown',
        license: data.license || 'Unknown',
        homepage: data.homepage || '',
        repository: data.repository?.url || '',
        maintainers: data.maintainers || [],
        dist: data.dist || {}
      };
    } catch (error) {
      console.error(`Failed to fetch data for package ${pkg}:`, error);
      return null;
    }
  };


  function formatDownloads(downloads) {
    if (downloads < 1000) return downloads.toString();
    if (downloads < 1000000) return (downloads / 1000).toFixed(1) + 'k';
    if (downloads < 1000000000) return (downloads / 1000000).toFixed(1) + 'M';
    return (downloads / 1000000000).toFixed(1) + 'B';
  }

  /**
   * Fetches download statistics for a package from npm registry.
   * @param {string} pkg - The package name to fetch download stats for.
   * @returns {Promise<string>} - Returns the number of downloads or 'Unknown' if fetch fails.
   */
  const getDownloads = async (pkg) => {
    try {
      const response = await fetch(`https://api.npmjs.org/downloads/point/last-month/${pkg}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return formatDownloads(data.downloads.toString());
    } catch (error) {
      console.error(`Failed to fetch downloads for package ${pkg}:`, error);
      return 'Unknown';
    }
  };

  // Define templates for various footer styles
  const footerTemplates = {
    modern: (data) => `${data.license || 'MIT'} © ${new Date().getFullYear()} 📦 ${data.name} · ${data.version}`,
    classic: (data) => `${data.license || 'MIT'} © ${new Date().getFullYear()} ${data.name} - ${data.version}`,
    minimal: (data) => `${data.name} ${data.version}`,
    boxed: (data) => `${data.name} © ${new Date().getFullYear()} 📦 · Licensed under ${data.license || 'MIT'}`,
    extended: (data) => `© ${new Date().getFullYear()} ${data.name} | v${data.version} | Last updated: ${data.lastUpdate} | Licensed under ${data.license || 'MIT'}`,
    corporate: (data) => `Copyright © ${new Date().getFullYear()} ${data.name}, Inc. | All rights reserved. Licensed under ${data.license || 'MIT'}.`,
    full: (data) => `
      <p>Package: ${data.name}</p>
      <p>Version: ${data.version}</p>
      <p>Description: ${data.description || 'No description'}</p>
      <p>Last Update: ${data.lastUpdate || 'Unknown'}</p>
      <p>License: ${data.license || 'Not specified'}</p>
    `
  };

  // Use a Map for caching fetched package data to reduce API calls
  const packageCache = new Map();

  // Process each footer element found
  footerElements.forEach(async (elFooter) => {
    try {
      const { pkg, target, template, format } = parse(elFooter.getAttribute('data-get-footer'));
      if (!pkg) {
        console.warn("No package specified for footer element", elFooter);
        return;
      }

      let pData = packageCache.get(pkg);
      if (!pData) {
        pData = await getNpmData(pkg);
        if (pData) {
          // Fetch downloads separately
          pData.totalDownloads = await getDownloads(pkg);
          packageCache.set(pkg, pData);
        }
      }
      if (!pData) {
        console.warn("Could not fetch data for package:", pkg);
        return;
      }

      let elTarget = elFooter;
      if (target) {
        elTarget = document.querySelector(target);
        if (!elTarget) {
          console.error(`Target element "${target}" not found`);
          return;
        }
      }

      if (format) {
        // Process custom format string
        let content = format;
        const variables = {
          '%author': pData.author || 'Unknown',
          '%copy': '©',
          '%description': pData.description,
          '%homepage': pData.homepage || '',
          '%lastUpdate': pData.lastUpdate,
          '%license': pData.license || 'Unknown',
          '%maintainers': Array.isArray(pData.maintainers) ? pData.maintainers.map(m => m.name).join(', ') : '',
          '%name': pData.name,
          '%repository': pData.repository || '',
          '%version': pData.version,
          '%year': new Date().getFullYear(),
          '%totalDownloads': pData.totalDownloads,
          '%npmURL': `https://www.npmjs.com/package/${pData.name}`
        };

        // Replace placeholders with actual data
        for (const [key, value] of Object.entries(variables)) {
          content = content.replace(new RegExp(key, 'g'), value);
        }

        // Clean up the formatted string for consistency
        content = content
          .replace(/\s+/g, ' ')
          .replace(/\s+,/g, ',')
          .replace(/,+/g, ',')
          .replace(/^,+|,+$/g, '')
          .trim()
          .replace(/\(\s*\)/g, '');

        elTarget.innerHTML = content;
      } else {
        // Apply the selected template
        const templateFn = footerTemplates[template || 'modern'];
        elTarget.innerHTML = templateFn(pData);
      }
    } catch (error) {
      console.error('Error processing footer:', error);
    }
  });
});

/**
 * Escapes special characters in a string for use in a regular expression.
 * @param {string} string - The string to escape.
 * @returns {string} - The escaped string.
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Parses the 'data-get-footer' attribute to extract configuration.
 * @param {string} attr - The attribute value to parse.
 * @returns {Object} - Configuration object with parsed values.
 */
/**
 * Parses the 'data-get-footer' attribute to extract configuration.
 * @param {string} attr - The attribute value to parse.
 * @returns {Object} - Configuration object with parsed values.
 */
function parse(attr) {
  if (!attr) return {};

  // First, check if there's a format block
  const formatMatch = attr.match(/\{([^}]+)\}/);

  if (formatMatch) {
    // Split only the part before the format block
    const beforeFormat = attr.substring(0, attr.indexOf('{')).trim();
    const parts = beforeFormat.split(',').map(part => part.trim()).filter(Boolean);

    return {
      pkg: parts[0] || null,
      target: parts[1] && (parts[1].startsWith('#') || parts[1].startsWith('.')) ? parts[1] : null,
      template: parts[1] && !parts[1].startsWith('#') && !parts[1].startsWith('.') ? parts[1] : 'modern',
      format: formatMatch[1].replace(/\{[^}]*\}/g, match => `%${match.slice(1, -1)}`)
    };
  } else {
    // If no format block, process as before
    const parts = attr.split(',').map(part => part.trim()).filter(Boolean);
    return {
      pkg: parts[0] || null,
      target: parts[1] && (parts[1].startsWith('#') || parts[1].startsWith('.')) ? parts[1] : null,
      template: parts[1] && !parts[1].startsWith('#') && !parts[1].startsWith('.') ? parts[1] :
        parts[2] ? parts[2] : 'modern',
      format: null
    };
  }
}