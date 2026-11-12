import { PROMO_CODES, getProductById } from './catalog.mjs';

export const FREE_SHIPPING_THRESHOLD_CENTS = 10000; // $100.00
export const STANDARD_SHIPPING_CENTS = 900; // $9.00
export const DEFAULT_TAX_RATE = 0.08; // 8%

/**
 * Calculates cart totals, validates inventory stock, applies promo codes,
 * and computes shipping + sales tax in integer cents to avoid float drift.
 *
 * @param {Array<{productId: string, quantity: number}>} items
 * @param {{promoCode?: string, taxRate?: number}} [options]
 */
export function calculateCartSummary(items = [], options = {}) {
	if (!Array.isArray(items) || items.length === 0) {
		return {
			ok: true,
			lineItems: [],
			subtotalCents: 0,
			discountCents: 0,
			shippingCents: 0,
			taxCents: 0,
			totalCents: 0,
			appliedPromo: null,
			promoMessage: null,
		};
	}

	const lineItems = [];
	let subtotalCents = 0;

	for (const entry of items) {
		const quantity = Number(entry?.quantity ?? 0);
		if (!Number.isInteger(quantity) || quantity <= 0) {
			throw new Error(`Invalid quantity for product "${entry?.productId}".`);
		}

		const product = getProductById(entry.productId);
		if (!product) {
			throw new Error(`Unknown product "${entry.productId}".`);
		}

		if (product.stock < quantity) {
			throw new Error(
				product.stock === 0
					? `"${product.name}" is currently out of stock.`
					: `Only ${product.stock} left in stock for "${product.name}".`
			);
		}

		const lineTotalCents = product.priceCents * quantity;
		subtotalCents += lineTotalCents;
		lineItems.push({
			productId: product.id,
			name: product.name,
			unitPriceCents: product.priceCents,
			quantity,
			lineTotalCents,
		});
	}

	let discountCents = 0;
	let appliedPromo = null;
	let promoMessage = null;
	let waiveShipping = false;

	const rawCode = (options.promoCode ?? '').trim().toUpperCase();
	if (rawCode) {
		const promo = PROMO_CODES[rawCode];
		if (!promo) {
			promoMessage = `Promo code "${rawCode}" is not recognized.`;
		} else if (subtotalCents < promo.minSubtotalCents) {
			const minDollars = (promo.minSubtotalCents / 100).toFixed(2);
			promoMessage = `Code "${rawCode}" requires a $${minDollars} minimum subtotal.`;
		} else {
			appliedPromo = promo.code;
			promoMessage = promo.description;
			if (promo.type === 'percent') {
				discountCents = Math.round((subtotalCents * promo.percentOff) / 100);
			} else if (promo.type === 'fixed') {
				discountCents = promo.amountOffCents;
			} else if (promo.type === 'free_shipping') {
				waiveShipping = true;
			}
		}
	}

	// Never allow discounts to exceed cart subtotal
	discountCents = Math.min(subtotalCents, discountCents);
	const discountedSubtotalCents = subtotalCents - discountCents;

	const shippingCents =
		waiveShipping || discountedSubtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : STANDARD_SHIPPING_CENTS;

	const taxRate = options.taxRate ?? DEFAULT_TAX_RATE;
	const taxCents = Math.round(discountedSubtotalCents * taxRate);
	const totalCents = discountedSubtotalCents + shippingCents + taxCents;

	return {
		ok: true,
		lineItems,
		subtotalCents,
		discountCents,
		shippingCents,
		taxCents,
		totalCents,
		appliedPromo,
		promoMessage,
	};
}

export function formatMoney(cents) {
	return `$${(cents / 100).toFixed(2)}`;
}
