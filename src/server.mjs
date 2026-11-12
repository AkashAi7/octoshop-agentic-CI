import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRODUCTS, PROMO_CODES } from './catalog.mjs';
import { calculateCartSummary } from './checkout.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '..', 'public');
const PORT = Number(process.env.PORT || 3000);

const MIME_TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.js': 'application/javascript; charset=utf-8',
	'.mjs': 'application/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
};

function sendJson(res, statusCode, payload) {
	res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
	res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
	return new Promise((resolve, reject) => {
		let body = '';
		req.on('data', (chunk) => {
			body += chunk;
			if (body.length > 64 * 1024) {
				reject(new Error('Request payload too large'));
			}
		});
		req.on('end', () => {
			try {
				resolve(body ? JSON.parse(body) : {});
			} catch {
				reject(new Error('Invalid JSON body'));
			}
		});
		req.on('error', reject);
	});
}

export function createStoreServer() {
	return http.createServer(async (req, res) => {
		const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

		if (req.method === 'GET' && url.pathname === '/api/products') {
			return sendJson(res, 200, {
				products: PRODUCTS,
				promos: Object.values(PROMO_CODES),
			});
		}

		if (req.method === 'POST' && url.pathname === '/api/cart/quote') {
			try {
				const body = await readJsonBody(req);
				const summary = calculateCartSummary(body.items ?? [], { promoCode: body.promoCode ?? '' });
				return sendJson(res, 200, summary);
			} catch (err) {
				return sendJson(res, 400, {
					ok: false,
					error: err instanceof Error ? err.message : 'Unable to calculate cart quote.',
				});
			}
		}

		if (req.method === 'POST' && url.pathname === '/api/checkout') {
			try {
				const body = await readJsonBody(req);
				const summary = calculateCartSummary(body.items ?? [], { promoCode: body.promoCode ?? '' });
				if (summary.lineItems.length === 0) {
					return sendJson(res, 400, { ok: false, error: 'Cannot place an empty order.' });
				}
				const orderNumber = `OCTO-${Math.floor(100000 + Math.random() * 900000)}`;
				return sendJson(res, 200, {
					ok: true,
					orderNumber,
					...summary,
				});
			} catch (err) {
				return sendJson(res, 400, {
					ok: false,
					error: err instanceof Error ? err.message : 'Checkout failed.',
				});
			}
		}

		const requestedPath = url.pathname === '/' ? 'index.html' : url.pathname.replace(/^\/+/, '');
		const safePath = path.normalize(requestedPath).replace(/^(\.\.(\/|\\|$))+/, '');
		const filePath = path.join(publicDir, safePath);

		if (!filePath.startsWith(publicDir) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
			res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
			res.end('Not found');
			return;
		}

		const ext = path.extname(filePath);
		res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] ?? 'application/octet-stream' });
		fs.createReadStream(filePath).pipe(res);
	});
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const server = createStoreServer();
	server.listen(PORT, () => {
		console.log(`OctoShop storefront running at http://localhost:${PORT}`);
	});
}
