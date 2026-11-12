import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCartSummary, formatMoney } from '../src/checkout.mjs';

test('calculates cart subtotal, free shipping over $100, and 8% tax', () => {
	const summary = calculateCartSummary([{ productId: 'kbd-tkl-pro', quantity: 1 }]);

	assert.equal(summary.subtotalCents, 12900);
	assert.equal(summary.discountCents, 0);
	assert.equal(summary.shippingCents, 0);
	assert.equal(summary.taxCents, 1032);
	assert.equal(summary.totalCents, 13932);
	assert.equal(formatMoney(summary.totalCents), '$139.32');
});

test('charges $9.00 standard shipping under $100 unless FREESHIP is applied', () => {
	const withoutPromo = calculateCartSummary([{ productId: 'mug-insulated', quantity: 1 }]);
	assert.equal(withoutPromo.subtotalCents, 2800);
	assert.equal(withoutPromo.shippingCents, 900);

	const withFreeShip = calculateCartSummary([{ productId: 'mug-insulated', quantity: 1 }], {
		promoCode: 'freeship',
	});
	assert.equal(withFreeShip.appliedPromo, 'FREESHIP');
	assert.equal(withFreeShip.shippingCents, 0);
});

test('applies SAVE20 promo code when subtotal is at least $50.00', () => {
	const summary = calculateCartSummary([{ productId: 'hoodie-heavy', quantity: 1 }], {
		promoCode: 'SAVE20',
	});

	assert.equal(summary.appliedPromo, 'SAVE20');
	assert.equal(summary.subtotalCents, 6800);
	assert.equal(summary.discountCents, 1360);
	// Discounted subtotal is $54.40 (< $100), so standard shipping ($9.00) applies
	assert.equal(summary.shippingCents, 900);
	assert.equal(summary.taxCents, 435);
	assert.equal(summary.totalCents, 6775);
});

test('blocks checkout when an item is out of stock or exceeds available inventory', () => {
	assert.throws(
		() => calculateCartSummary([{ productId: 'cap-corduroy', quantity: 1 }]),
		/out of stock/i
	);

	assert.throws(
		() => calculateCartSummary([{ productId: 'dock-tb4', quantity: 5 }]),
		/Only 3 left in stock/i
	);
});

test('applies FLASH15 weekend promo code on orders of $40.00+', () => {
	const summary = calculateCartSummary([{ productId: 'mat-desk-xl', quantity: 1 }], {
		promoCode: 'FLASH15',
	});

	assert.equal(summary.appliedPromo, 'FLASH15');
	assert.equal(summary.discountCents, 660);
});
