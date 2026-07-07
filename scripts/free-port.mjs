#!/usr/bin/env node
/**
 * Kill whatever process is listening on a TCP port, cross-platform.
 *
 * Wired as a `predev` hook so starting the API/web never loses a race to a stale
 * dev server left running from a previous session (the "two-driver" problem, where
 * the browser silently hits an old process bound to the port with outdated code/env).
 *
 * Usage: node scripts/free-port.mjs <port> [<port> ...]
 * Never fails the build — a free port is the success case and produces no output.
 */
import { execSync } from 'node:child_process';

const ports = process.argv.slice(2).map((p) => parseInt(p, 10)).filter((p) => p > 0);
if (ports.length === 0) process.exit(0);

const isWindows = process.platform === 'win32';

for (const port of ports) {
  try {
    const pids = isWindows ? pidsWindows(port) : pidsUnix(port);
    for (const pid of pids) {
      if (pid === process.pid) continue;
      try {
        if (isWindows) execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
        else process.kill(pid, 'SIGKILL');
        console.log(`[free-port] freed port ${port} (killed pid ${pid})`);
      } catch {
        /* process already gone — ignore */
      }
    }
  } catch {
    /* nothing listening on this port — the normal case */
  }
}

function pidsWindows(port) {
  const out = execSync(`netstat -ano -p tcp`, { encoding: 'utf8' });
  const set = new Set();
  for (const line of out.split(/\r?\n/)) {
    // Columns: Proto  Local Address  Foreign Address  State  PID
    const m = line.match(/^\s*TCP\s+\S+:(\d+)\s+\S+\s+LISTENING\s+(\d+)\s*$/i);
    if (m && parseInt(m[1], 10) === port) set.add(parseInt(m[2], 10));
  }
  return [...set];
}

function pidsUnix(port) {
  const out = execSync(`lsof -ti tcp:${port} -s tcp:LISTEN`, { encoding: 'utf8' });
  return out
    .split(/\s+/)
    .map((p) => parseInt(p, 10))
    .filter((p) => p > 0);
}
