#!/usr/bin/env node
import { spawn } from "child_process";
import { request } from "http";
import { existsSync } from "fs";
import os from "os";
import path from "path";

const port = process.env.PORT || "3000";
const host = process.env.HOST || "localhost";
const url = `http://${host}:${port}`;

function waitForServer(timeoutMs = 20000, intervalMs = 250) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    function check() {
      const req = request(url, { method: "HEAD" }, () => {
        req.destroy();
        resolve();
      });

      req.on("error", () => {
        req.destroy();
        if (Date.now() - start >= timeoutMs) {
          reject(new Error(`Timeout waiting for ${url}`));
        } else {
          setTimeout(check, intervalMs);
        }
      });

      req.setTimeout(2000, () => {
        req.destroy();
        if (Date.now() - start >= timeoutMs) {
          reject(new Error(`Timeout waiting for ${url}`));
        } else {
          setTimeout(check, intervalMs);
        }
      });

      req.end();
    }

    check();
  });
}

function openChrome(targetUrl) {
  if (os.platform() !== "win32") {
    console.log(`Abra este endereço no navegador: ${targetUrl}`);
    return;
  }

  const candidatePaths = [
    process.env["PROGRAMFILES(X86)"] && path.join(process.env["PROGRAMFILES(X86)"], "Google", "Chrome", "Application", "chrome.exe"),
    process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, "Google", "Chrome", "Application", "chrome.exe"),
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "Google", "Chrome", "Application", "chrome.exe"),
  ].filter(Boolean);

  const chromePath = candidatePaths.find((candidate) => existsSync(candidate));

  if (chromePath) {
    spawn(chromePath, ["--new-window", targetUrl], {
      detached: true,
      stdio: "ignore",
    }).unref();
    return;
  }

  spawn("cmd", ["/c", "start", "", "chrome", "--new-window", targetUrl], {
    detached: true,
    stdio: "ignore",
  }).unref();
}

const nextDev = spawn("next", ["dev"], {
  stdio: "inherit",
  shell: true,
  cwd: process.cwd(),
});

waitForServer()
  .then(() => {
    console.log(`\nServidor disponível em ${url}. Abrindo Chrome...`);
    openChrome(url);
  })
  .catch((err) => {
    console.warn(`\nNão foi possível abrir o Chrome automaticamente: ${err.message}`);
  });

nextDev.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});
