# Extensions and Codespaces Troubleshooting

## Common Issues

### "Remote Extension host terminated unexpectedly"

This error typically occurs when:

1. Too many extensions are installed
2. Conflicting extensions are active
3. Memory limits are reached
4. Extensions designed for local development are used in Codespaces

## Extensions to Avoid in Codespaces

These extensions should **not** be installed in Codespaces as they cause conflicts:

- **Remote Repositories** (`ms-vscode.remote-repositories`)
- **Remote - Tunnels** (`ms-vscode.remote-tunnels`)
- **Remote - Containers** (`ms-vscode-remote.remote-containers`)
- **Remote - SSH** (`ms-vscode-remote.remote-ssh`)
- **Remote - WSL** (`ms-vscode-remote.remote-wsl`)

## Fixing Extension Host Crashes

If you experience crashes:

1. **Run the cleanup script**:

   ```bash
   npm run extensions:cleanup
   ```

2. **Reload the window**: Use the Command Palette (Ctrl+Shift+P) and select "Developer: Reload
   Window"

3. **Increase memory (if possible)**: If you have control over Codespaces configuration, increase
   the memory allocation

4. **Monitor extension CPU usage**: Use the Process Explorer in VS Code to identify
   resource-intensive extensions

## Performance Optimization

Consider these strategies to improve Codespaces performance:

1. Use lightweight theme extensions
2. Disable telemetry in extensions where possible
3. Use workspace-specific settings to disable features you don't need
4. Periodically run the cleanup script to remove unnecessary extensions

## Required vs. Optional Extensions

### Required

- ESLint, Prettier (code quality)
- Tailwind CSS IntelliSense (styling)
- Supabase (backend)
- GitHub Codespaces (core functionality)

### Optional

- GitHub Copilot (AI assistance)
- GitLens (Git information)

## Reporting Issues

If extension problems persist after following these steps:

1. Check VS Code logs
2. File an issue in the repository
3. Try working in a new Codespace temporarily
