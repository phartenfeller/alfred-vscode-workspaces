/* eslint-disable prefer-regex-literals */
import BetterSqlite3 from 'better-sqlite3';

// VS Code's WorkspacesHistoryMainService reads recents from a single key in
// the APPLICATION_SHARED storage scope. We mirror that exactly so this stays
// in sync with VS Code's own "Open Recent" list.
// https://github.com/microsoft/vscode/blob/main/src/vs/platform/workspaces/electron-main/workspacesHistoryMainService.ts
const query = `SELECT value FROM ItemTable WHERE key = 'history.recentlyOpenedPathsList'`;

const localWs = new RegExp('^file://(.+)$');
const remoteSshWs = new RegExp('^vscode-remote://ssh-remote+(.+?(?=/))(.+)$');
const remoteWslWs = new RegExp('^vscode-remote://wsl+(.+?(?=/))(.+)$');
const codespacesWs = new RegExp('^vscode-remote://vsonline+(.+?(?=/))(.+)$');
const devContainerWs = new RegExp(
  '^vscode-remote://dev-container+(.+?(?=/))(.+)$'
);

// eslint-disable-next-line no-unused-vars
function hlpLog(...args) {
  // console.log(...args);
}

// mostly copied from https://github.com/microsoft/PowerToys/blob/35c14385146e7dc8aec50f0c1cf7fb23da462906/src/modules/launcher/Plugins/Community.PowerToys.Run.Plugin.VSCodeWorkspaces/WorkspacesHelper/ParseVSCodeUri.cs#L21
function getWorkspaceType(path) {
  if (!path) return null;
  const cleaned = path.replace('%2B', '+');

  let match = localWs.exec(cleaned);
  if (match) {
    hlpLog(cleaned, 'local', JSON.stringify(match));
    return { type: 'Local', machineName: null, path: match[0] };
  }

  match = remoteSshWs.exec(cleaned);
  if (match) {
    hlpLog(cleaned, 'remoteSSH', JSON.stringify(match));

    return {
      type: 'RemoteSSH',
      machineName: match[1].replace('+', ''),
      path: match[2],
    };
  }

  match = remoteWslWs.exec(cleaned);
  if (match) {
    hlpLog(cleaned, 'RemoteWSL', JSON.stringify(match));

    return {
      type: 'RemoteWSL',
      machineName: match[1].replace('+', ''),
      path: match[2],
    };
  }

  match = codespacesWs.exec(cleaned);
  if (match) {
    hlpLog(cleaned, 'Codespace', JSON.stringify(match));
    return {
      type: 'Codespace',
      machineName: match[1].replace('+', ''),
      path: match[2],
    };
  }

  match = devContainerWs.exec(cleaned);
  if (match) {
    hlpLog(cleaned, 'DevContainer', JSON.stringify(match));
    return {
      type: 'DevContainer',
      machineName: match[1].replace('+', ''),
      path: match[2],
    };
  }

  return {
    type: 'unknown',
    machineName: null,
    path: cleaned,
  };
}

function processRow(row) {
  if (!row || !row.value) return [];
  hlpLog('before parse', typeof row.value);
  let parsed;
  try {
    parsed = JSON.parse(row.value);
  } catch (err) {
    hlpLog('parse error', err);
    return [];
  }
  const entries = parsed && parsed.entries ? parsed.entries : [];
  return entries.map((item) => {
    // workspaces are displayed like this:
    // {
    //   "workspace": {
    //     "id": "6aa0e4fae71308aee03a022e92f67863",
    //     "configPath": "file:///Users/phartenfeller/Downloads/test.code-workspace"
    //   }
    // },
    if (item.workspace) {
      const ws = item.workspace;
      return {
        item: null,
        remoteAuthority: null,
        folderUri: ws.configPath,
        type: 'Workspace',
        machineName: null,
        path: ws.configPath,
      };
    }
    // local: { "folderUri": "file:///Users/.../project" }
    // remote: { "folderUri": "vscode-remote://...", "label": "...",
    //           "remoteAuthority": "..." }
    return {
      item: item.label,
      remoteAuthority: item.remoteAuthority,
      folderUri: item.folderUri,
      ...getWorkspaceType(item.folderUri),
    };
  });
}

function queryProjects(storagePath) {
  const db = new BetterSqlite3(storagePath, { readonly: true });
  const rows = db.prepare(query).all();
  db.close();
  return rows;
}

function getLastItem(path) {
  return path.substring(path.lastIndexOf('/') + 1);
}

function getProjects(storagePaths) {
  const paths = Array.isArray(storagePaths) ? storagePaths : [storagePaths];
  const seen = new Set();

  const collected = paths
    .flatMap((storagePath) => {
      hlpLog('storagePath', storagePath);
      return queryProjects(storagePath);
    })
    .flatMap((row) => processRow(row))
    .filter((r) => {
      if (!r || !r.type) return false;
      const dedupKey = r.folderUri || r.path;
      if (seen.has(dedupKey)) return false;
      seen.add(dedupKey);
      return true;
    });

  return collected.map((r) => ({
    item: r.item,
    remoteAuthority: r.remoteAuthority,
    type: r.type,
    machineName: r.machineName,
    path: r.path,
    folderUri: r.folderUri,

    title: r.machineName
      ? `${r.machineName} » ${getLastItem(r.path)}`
      : getLastItem(r.path),
    subtitle: r.path,
    icon: { path: 'icon.png' },
    uid: r.folderUri,
  }));
}

export default getProjects;
