import {CLONE_PROTOCOLS, DEFAULT_TOOL_IDS, SUPPORTED_TOOLS} from '../constants';

const STORAGE_ITEMS = {
  PROTOCOL: 'protocol',
  MODIFY_PAGES: 'modify-pages',
  TOOL_IDS: 'tool-ids',
  DEFAULT_TOOL_ID: 'default_tool_id'
};

const DEFAULTS = {
  PROTOCOL: CLONE_PROTOCOLS.HTTPS,
  MODIFY_PAGES: true
};

const saveToStorage = (key, value) => new Promise((resolve, reject) => {
  chrome.storage.local.set({[key]: value}, () => {
    if (chrome.runtime.lastError) {
      reject(chrome.runtime.lastError.message);
    } else {
      resolve();
    }
  });
});

const getFromStorage = key => new Promise((resolve, reject) => {
  chrome.storage.local.get([key], result => {
    if (chrome.runtime.lastError) {
      reject(chrome.runtime.lastError.message);
    } else {
      resolve(result[key]);
    }
  });
});

export function getProtocol() {
  return new Promise(resolve => {
    getFromStorage(STORAGE_ITEMS.PROTOCOL).
      then(protocol => {
        resolve(protocol || DEFAULTS.PROTOCOL);
      }).
      catch(() => {
        resolve(DEFAULTS.PROTOCOL);
      });
  });
}

export function saveProtocol(protocol) {
  return new Promise(resolve => {
    saveToStorage(STORAGE_ITEMS.PROTOCOL, protocol).
      then(resolve).
      catch(() => {
        resolve();
      });
  });
}

export function getModifyPages() {
  return new Promise(resolve => {
    getFromStorage(STORAGE_ITEMS.MODIFY_PAGES).
      then(allow => {
        resolve(allow == null ? DEFAULTS.MODIFY_PAGES : allow);
      }).
      catch(() => {
        resolve(DEFAULTS.MODIFY_PAGES);
      });
  });
}

export function saveModifyPages(allow) {
  return new Promise(resolve => {
    saveToStorage(STORAGE_ITEMS.MODIFY_PAGES, allow).
      then(resolve).
      catch(() => {
        resolve();
      });
  });
}


export function saveActiveToolIds(toolIds) {
  return new Promise(resolve => {
    saveToStorage(STORAGE_ITEMS.TOOL_IDS, toolIds).then(resolve).catch(() => {
      resolve();
    });
  });
}

export function getActiveToolIds() {
  return new Promise(resolve => {
    getFromStorage(STORAGE_ITEMS.TOOL_IDS).then(ids => {
      resolve((ids == null || ids.length === 0) ? Object.keys(SUPPORTED_TOOLS) : ids);
    }).catch(() => {
      resolve(Object.keys(SUPPORTED_TOOLS));
    });
  });
}

export function saveDefaultToolIds(toolIds) {
  return new Promise(resolve => {
    saveToStorage(STORAGE_ITEMS.DEFAULT_TOOL_ID, toolIds).then(resolve).catch(() => {
      resolve();
    });
  });
}

export function getDefaultToolIds() {
  return new Promise(resolve => {
    getFromStorage(STORAGE_ITEMS.DEFAULT_TOOL_ID).then(ids => {
      resolve(ids || DEFAULT_TOOL_IDS);
    }).catch(() => {
      resolve(DEFAULT_TOOL_IDS);
    });
  });
}
