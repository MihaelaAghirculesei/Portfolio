// Serves a build directory through wrangler's local Pages runtime — the same
// _headers/CSP and 404.html handling Cloudflare Pages applies in production.
import { spawn, spawnSync } from 'node:child_process';
import { join } from 'node:path';

function waitForServer(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    (function poll() {
      fetch(url)
        .then(() => resolve())
        .catch(() => {
          if (Date.now() > deadline) reject(new Error(`server did not come up within ${timeoutMs}ms`));
          else setTimeout(poll, 500);
        });
    })();
  });
}

/**
 * Starts `wrangler pages dev <dir>` and resolves once it answers requests.
 * Always call `stop()` (e.g. in a `finally`), or the port stays taken.
 */
export async function startPagesDevServer(dir, port, { timeoutMs = 30_000 } = {}) {
  // wrangler (via its .cmd shim on Windows, or directly on POSIX) spawns its
  // own workerd child to actually serve requests. `server.kill()` only signals
  // the immediate child — on Windows that's the cmd.exe shim, so the real
  // wrangler + workerd processes are orphaned and keep the port (and the
  // shared .wrangler/state SQLite files) locked for every run after. Kill the
  // whole tree instead: `taskkill /T` on Windows, or the detached process
  // group on POSIX.
  const wranglerBin = join('node_modules', '.bin', process.platform === 'win32' ? 'wrangler.cmd' : 'wrangler');
  const server = spawn(wranglerBin, ['pages', 'dev', dir, '--port', String(port)], {
    stdio: 'ignore',
    shell: process.platform === 'win32',
    detached: process.platform !== 'win32',
  });

  function stop() {
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      try {
        process.kill(-server.pid, 'SIGKILL');
      } catch {
        server.kill('SIGKILL');
      }
    }
  }

  const url = `http://localhost:${port}`;
  try {
    await waitForServer(url, timeoutMs);
  } catch (err) {
    stop();
    throw err;
  }
  return { url, stop };
}
