// Modern Node.js 18+ has native DOMException globally available.
// We map the deprecated node-domexception package to this native object.
module.exports = globalThis.DOMException;
