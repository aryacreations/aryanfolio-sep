const fs = require('fs');

const elements = {};
const listeners = {};

function createEl(tag, id = '', className = '') {
  return {
    tagName: tag,
    id: id,
    className: className,
    value: '',
    src: '',
    textContent: '',
    innerHTML: '',
    style: {},
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => false
    },
    addEventListener: (evt, fn) => {
      listeners[`${id || className}_${evt}`] = fn;
    },
    querySelectorAll: () => [],
    querySelector: () => null,
    setAttribute: () => {},
    getAttribute: () => ''
  };
}

const html = fs.readFileSync('admin.html', 'utf8');
const idMatches = [...html.matchAll(/id=["']([^"']+)["']/g)].map(m => m[1]);
idMatches.forEach(id => {
  elements[id] = createEl('div', id);
});

global.window = global;
global.document = {
  getElementById: (id) => elements[id] || null,
  querySelectorAll: (sel) => {
    if (sel === '.nav-tab-btn') return [createEl('button', '', 'nav-tab-btn')];
    if (sel === '.tab-pane') return [createEl('div', 'tab-hero', 'tab-pane')];
    if (sel === '.save-tab-btn') return [createEl('button', '', 'save-tab-btn')];
    return [];
  },
  querySelector: (sel) => createEl('div'),
  addEventListener: (evt, fn) => {
    if (evt === 'DOMContentLoaded') fn();
  }
};

const store = {};
global.localStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => { store[k] = v; },
  removeItem: (k) => { delete store[k]; }
};

global.BroadcastChannel = class {
  constructor(name) {}
  postMessage() {}
  close() {}
};

global.CustomEvent = class {};
global.dispatchEvent = () => {};

eval(fs.readFileSync('data.js', 'utf8'));
eval(fs.readFileSync('admin.js', 'utf8'));

// Now simulate clicking saveAllBtn!
try {
  const saveFn = listeners['saveAllBtn_click'];
  if (saveFn) {
    saveFn();
    console.log("saveAllBtn clicked successfully!");
    console.log("Stored in localStorage:", Object.keys(store));
    const storedData = JSON.parse(store['aryan_portfolio_data_v1']);
    console.log("Stored Profile Name:", storedData.profile.name);
    console.log("Stored Projects count:", storedData.projects.length);
  } else {
    console.log("ERROR: saveAllBtn listener not found!");
  }
} catch (e) {
  console.error("ERROR during saveAllBtn click:", e);
}
