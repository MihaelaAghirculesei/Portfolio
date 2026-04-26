import { APP_BASE_HREF } from '@angular/common';
import { CSP_NONCE } from '@angular/core';
import { CommonEngine } from '@angular/ssr/node';
import express from 'express';
import compression from 'compression';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import bootstrap from './src/main.server';

function generateNonce(): string {
  return randomBytes(16).toString('base64');
}

function buildCspHeader(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    `style-src 'self' 'nonce-${nonce}'`,
    "font-src 'self'",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.aghirculesei.workers.dev",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const allowedHosts = (process.env['ALLOWED_HOSTS'] ?? 'localhost,127.0.0.1,aghirculesei.pages.dev')
    .split(',')
    .map(h => h.trim());
  const commonEngine = new CommonEngine({ allowedHosts });

  server.use(compression({ level: 9, threshold: 0 }));

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  server.get('*.*', express.static(browserDistFolder, {
    maxAge: '1y'
  }));

  server.get('*', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;
    const nonce = generateNonce();

    res.setHeader('Content-Security-Policy', buildCspHeader(nonce));

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [
          { provide: APP_BASE_HREF, useValue: baseUrl },
          { provide: CSP_NONCE, useValue: nonce },
        ],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  const server = app();
  server.listen(port);

}

run();
