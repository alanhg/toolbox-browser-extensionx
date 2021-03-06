import {SUPPORTED_TOOLS} from '../constants';

import {getActiveToolIds, getDefaultToolIds} from './storage';

const convertNumberToIndex = number => number - 1;

export function getToolboxURN(toolTag, cloneUrl) {
  if (toolTag === SUPPORTED_TOOLS.code.tag) {
    return `vscode://vscode.git/clone?url=${cloneUrl}`;
  }
  return `jetbrains://${toolTag}/checkout/git?checkout.repo=${cloneUrl}&idea.required.plugins.id=Git4Idea`;
}

export function getToolboxNavURN(toolTag, project, filePath, lineNumber = null) {
  const lineIndex = convertNumberToIndex(lineNumber == null ? 1 : lineNumber);
  const columnIndex = convertNumberToIndex(1);
  return `jetbrains://${toolTag}/navigate/reference?project=${project}&path=${filePath}:${lineIndex}:${columnIndex}`;
}

export function callToolbox(action) {
  const fakeAction = document.createElement('a');
  fakeAction.style.position = 'absolute';
  fakeAction.style.left = '-9999em';
  fakeAction.href = action;
  document.body.appendChild(fakeAction);
  fakeAction.click();
  document.body.removeChild(fakeAction);
}


export const getDefaultTools = () => new Promise(resolve => getDefaultToolIds().then(defaultToolIds => {
  resolve(Object.values(SUPPORTED_TOOLS).filter(item => defaultToolIds.includes(item.tag)));
}));


export const filterToolsByActive = originalTools => new Promise(resolve => {
  Promise.all([getActiveToolIds(), getDefaultTools()]).then(([activeToolIds, defaultTools]) => {
    const toolIds = [];
    const tools = originalTools.filter(tool => {
      if (activeToolIds.includes(tool.tag)) {
        toolIds.push(tool.tag);
        return true;
      }
      return false;
    });
    resolve(tools.concat(defaultTools.filter(tool => !toolIds.includes(tool.tag))));
  });
});
