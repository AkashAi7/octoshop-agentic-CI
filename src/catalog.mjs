/**
 * OctoShop Product Catalog
 * Zero-dependency e-commerce catalog for the GitHub Agentic Workflows demo & lab.
 */

export const PRODUCTS = Object.freeze([
	{
		id: 'kbd-tkl-pro',
		name: 'OctoKey TKL Mechanical Keyboard',
		category: 'Hardware',
		priceCents: 12900,
		stock: 14,
		badge: 'Bestseller',
		description: 'Hot-swappable tactile switches, aluminum frame, and PBT keycaps.',
	},
	{
		id: 'dock-tb4',
		name: 'ThunderHub 12-Port USB-C Dock',
		category: 'Hardware',
		priceCents: 16900,
		stock: 3,
		badge: 'Low Stock',
		description: 'Dual 4K60 display output, 96W host charging, and 2.5Gb Ethernet.',
	},
	{
		id: 'hoodie-heavy',
		name: 'Merge-Ready Heavyweight Hoodie',
		category: 'Apparel',
		priceCents: 6800,
		stock: 28,
		badge: null,
		description: '450gsm organic cotton fleece with embroidered branch icon.',
	},
	{
		id: 'mug-insulated',
		name: 'Zero-Downtime Insulated Desk Tumbler',
		category: 'Accessories',
		priceCents: 2800,
		stock: 42,
		badge: null,
		description: 'Double-wall stainless steel, 16oz capacity, leak-proof sip lid.',
	},
	{
		id: 'cap-corduroy',
		name: 'Ship-It Corduroy Cap',
		category: 'Apparel',
		priceCents: 3200,
		stock: 0,
		badge: 'Sold Out',
		description: 'Unstructured 6-panel cap with brass strap closure.',
	},
	{
		id: 'mat-desk-xl',
		name: 'Dark-Mode Felt & Cork Desk Mat',
		category: 'Accessories',
		priceCents: 4400,
		stock: 19,
		badge: null,
		description: '900x400mm merino wool felt surface with non-slip cork base.',
	},
]);

export const PROMO_CODES = Object.freeze({
	SAVE20: {
		code: 'SAVE20',
		type: 'percent',
		percentOff: 20,
		minSubtotalCents: 5000,
		description: '20% off orders of $50.00 or more',
	},
	WELCOME10: {
		code: 'WELCOME10',
		type: 'fixed',
		amountOffCents: 1000,
		minSubtotalCents: 3000,
		description: '$10.00 off orders of $30.00 or more',
	},
	FREESHIP: {
		code: 'FREESHIP',
		type: 'free_shipping',
		minSubtotalCents: 0,
		description: 'Free standard shipping on any order',
	},
});

export function getProductById(productId) {
	return PRODUCTS.find((item) => item.id === productId) ?? null;
}
