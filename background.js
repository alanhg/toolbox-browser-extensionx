import {
  getProtocol,
  saveProtocol,
  getModifyPages,
  saveModifyPages, getActiveToolIds, saveActiveToolIds
} from './api/storage';
import {createExtensionMenu} from './api/menu';
import {SUPPORTED_TOOLS} from './constants';

const handleInstalled = () => {
  const manifest = chrome.runtime.getManifest();
  const uninstallUrl = `https://www.jetbrains.com/toolbox-app/uninstall/extension/?version=${manifest.version}`;
  chrome.runtime.setUninstallURL(uninstallUrl, () => {
    // eslint-disable-next-line no-void
    void chrome.runtime.lastError;
  });
};

// eslint-disable-next-line complexity
const handleMessage = (message, sender, sendResponse) => {
  switch (message.type) {
    case 'get-active-tools':
      getActiveToolIds().then(activeIds => {
        chrome.runtime.sendMessage({
          type: 'init-active-tool-ids',
          newValue: Object.entries(SUPPORTED_TOOLS).map(([toolId, item]) => ({
            ...item,
            id: toolId,
            checked: activeIds.includes(toolId)
          }))
        });
      });
      break;
    case 'update-active-tool-ids':
      saveActiveToolIds(message.data.toolIds).then(() => sendResponse({}));
      break;
    case 'enable-page-action':
      chrome.browserAction.setIcon({
        tabId: sender.tab.id,
        path: {128: 'icon-128.png'}
      });

      const {
        project,
        https,
        ssh
      } = message;
      const uri = encodeURI(`jetbrains-toolbox-clone-popup.html?project=${project}&https=${https}&ssh=${ssh}`);
      chrome.browserAction.setPopup(
        {
          tabId: sender.tab.id,
          popup: chrome.runtime.getURL(uri)
        }
      );
      break;
    case 'disable-page-action':
      chrome.browserAction.setIcon({
        tabId: sender.tab.id,
        path: {128: 'icon-disabled-128.png'}
      });
      chrome.browserAction.setPopup(
        {
          tabId: sender.tab.id,
          popup: chrome.runtime.getURL('jetbrains-toolbox-disabled-popup.html')
        }
      );
      break;
    case 'get-protocol':
      getProtocol().then(protocol => {
        sendResponse({protocol});
      });
      return true;
    case 'save-protocol':
      saveProtocol(message.protocol).then(() => {
        // sync options page if it is open
        chrome.runtime.sendMessage({
          type: 'protocol-changed',
          newValue: message.protocol
        });
      }).catch(() => {
        // do nothing
      });
      break;
    case 'get-modify-pages':
      getModifyPages().then(allow => {
        sendResponse({allow});
      });
      return true;
    case 'save-modify-pages':
      saveModifyPages(message.allow).then(() => {
        chrome.tabs.query({}, tabs => {
          tabs.forEach(t => {
            chrome.tabs.sendMessage(t.id, {
              type: 'modify-pages-changed',
              newValue: message.allow
            });
          });
        });
      }).catch(() => {
        // do nothing
      });
      break;
      // no default
  }

  return undefined;
};

chrome.runtime.onInstalled.addListener(handleInstalled);
chrome.runtime.onMessage.addListener(handleMessage);

createExtensionMenu();
