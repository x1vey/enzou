// Centralized content store for Enzou Drywall LLC
// All text, images, and colors editable via admin panel

import defaultJsonContent from './content.json';

const STORAGE_KEY = 'enzou_site_content';
const DEFAULT_CONTENT = defaultJsonContent;

export function getContent() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return deepMerge(DEFAULT_CONTENT, parsed);
    }
  } catch (e) {
    console.warn('Failed to load stored content, using defaults', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_CONTENT));
}

export function saveContent(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Failed to save content', e);
    return false;
  }
}

export function resetContent() {
  localStorage.removeItem(STORAGE_KEY);
  return JSON.parse(JSON.stringify(DEFAULT_CONTENT));
}

function deepMerge(target, source) {
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}
