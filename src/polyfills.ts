/**
 * Polyfills for MultiversX SDK-dApp
 */

// Buffer polyfill
import { Buffer } from 'buffer';
window.Buffer = window.Buffer || Buffer;

// Process polyfill
if (typeof window !== 'undefined' && !window.process) {
  window.process = { env: {} } as any;
}

// Global polyfill
if (typeof window !== 'undefined' && !window.global) {
  window.global = window as any;
}

// TextEncoder polyfill (needed for some browsers)
if (typeof window !== 'undefined' && !window.TextEncoder) {
  window.TextEncoder = TextEncoder;
}

// TextDecoder polyfill (needed for some browsers)
if (typeof window !== 'undefined' && !window.TextDecoder) {
  window.TextDecoder = TextDecoder;
}

// Crypto polyfill
if (typeof window !== 'undefined' && !window.crypto) {
  window.crypto = require('crypto').webcrypto;
} 