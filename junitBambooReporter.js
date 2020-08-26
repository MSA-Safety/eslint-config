/**
 * From: https://github.com/eslint/eslint/blob/master/lib/formatters/junit.js
 * @fileoverview jUnit Reporter
 * @author Jamund Ferguson
 */

/* modified by Chadd Cron for MSA's purposes */
'use strict';

const xmlEscape = require('eslint/lib/util/xml-escape');

//------------------------------------------------------------------------------
// Helper Functions
//------------------------------------------------------------------------------

/**
 * Returns the severity of warning or error
 * @param {Object} message message object to examine
 * @returns {string} severity level
 * @private
 */
function getMessageType(message) {
  if (message.fatal || message.severity === 2) {
    return 'Error';
  }

  return 'Warning';
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = function(results) {
  let output = '';

  output += '<?xml version="1.0" encoding="utf-8"?>\n';
  output += '<testsuites>\n';

  let wrote = false;

  results.forEach(result => {
    const messages = result.messages;

    if (messages.length) {
      output += `<testsuite package="org.eslint" time="0" tests="${messages.length || 1}"` +
        ` errors="${messages.length}" name="${result.filePath}">\n`;
      wrote = true;
    }

    messages.forEach(message => {
      const type = message.fatal ? 'error' : 'failure';

      output += `<testcase time="0" name="org.eslint.${message.ruleId || 'unknown'}">`;
      output += `<${type} message="${xmlEscape(message.message || '')}">`;
      output += '<![CDATA[';
      output += `line ${message.line || 0}, col `;
      output += `${message.column || 0}, ${getMessageType(message)}`;
      output += ` - ${xmlEscape(message.message || '')}`;
      output += (message.ruleId ? ` (${message.ruleId})` : '');
      output += ']]>';
      output += `</${type}>`;
      output += '</testcase>\n';
    });

    if (messages.length) {
      output += '</testsuite>\n';
    }
  });

  if (!wrote) {
    output += `<testsuite package="org.eslint" time="0" tests="1" errors="0" name="ESLint">\n`;
    output += `<testcase name="eslint" time="0" classname="eslint"/>\n`;
    output += '</testsuite>\n';
  }

  output += '</testsuites>\n';

  return output;
};
