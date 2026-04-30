# Alfred 4/5 Workflow for VSCode Workspaces

Get a list of your VS Code workspaces in alfred

- Type `vsc` into alfred to get a list
- Works with **local** and **remote** workspaces
- Scan custom project directories in addition to recent workspaces

![](assets/workflow-usage.png)

Forked from https://github.com/kbshl/alfred-vscode

Blogpost: https://hartenfeller.dev/blog/alfred-vscode-workflow

## Installation

You need `code` added to shell path: https://code.visualstudio.com/docs/setup/mac#_launching-from-the-command-line

You need a [currently maintained Node.js version](https://nodejs.org/en/about/previous-releases).

```bash
npm install --global @phartenfeller/alfred-vscode-workspaces
```

## Configuration

### Project Directories (optional)

You can configure additional directories to scan for projects. All first-level subdirectories will be listed as available workspaces.

1. Open Alfred Preferences → Workflows
2. Right-click on "VSCode Workspaces" and select "Configure..."
3. In the "Project Directories" field, add your project folders (one per line):

```
~/Projects
~/Work
~/GitHub
```

Projects from these directories will be merged with your recent VS Code workspaces (duplicates are automatically removed).
