const state = {
	products: [],
	category: 'ALL',
	cart: new Map(), // productId -> quantity
	promoCode: '',
};

const gridEl = document.getElementById('product-grid');
const productCountEl = document.getElementById('product-count');
const cartEmptyEl = document.getElementById('cart-empty');
const cartItemsEl = document.getElementById('cart-items');
const cartCountPillEl = document.getElementById('cart-count-pill');
const promoFormEl = document.getElementById('promo-form');
const promoInputEl = document.getElementById('promo-input');
const promoFeedbackEl = document.getElementById('promo-feedback');
const checkoutBtnEl = document.getElementById('checkout-btn');
const orderStatusEl = document.getElementById('order-status');

function formatMoney(cents) {
	return `$${(cents / 100).toFixed(2)}`;
}

function getCartItemsArray() {
	return Array.from(state.cart.entries()).map(([productId, quantity]) => ({
		productId,
		quantity,
	}));
}

function renderCatalog() {
	const filtered =
		state.category === 'ALL'
			? state.products
			: state.products.filter((p) => p.category === state.category);

	productCountEl.textContent = `${filtered.length} products`;
	gridEl.innerHTML = '';

	for (const product of filtered) {
		const card = document.createElement('article');
		card.className = 'product-card';
		card.setAttribute('role', 'listitem');

		const isSoldOut = product.stock === 0;
		const badgeClass = isSoldOut ? 'out' : product.stock <= 5 ? 'low' : 'best';
		const badgeText = product.badge || `${product.stock} in stock`;

		card.innerHTML = `
			<div>
				<div class="card-top-row">
					<span class="category-label">${product.category}</span>
					<span class="stock-badge ${badgeClass}">${badgeText}</span>
				</div>
				<h3 class="product-title">${product.name}</h3>
				<p class="product-desc">${product.description}</p>
			</div>
			<div class="card-bottom-row">
				<span class="price-tag">${formatMoney(product.priceCents)}</span>
				<button type="button" class="btn-primary add-btn" ${isSoldOut ? 'disabled' : ''}>
					${isSoldOut ? 'Out of Stock' : 'Add to Cart'}
				</button>
			</div>
		`;

		card.querySelector('.add-btn').addEventListener('click', () => {
			const currentQty = state.cart.get(product.id) ?? 0;
			if (currentQty + 1 > product.stock) {
				showOrderMessage(`Only ${product.stock} left in stock for "${product.name}".`, true);
				return;
			}
			state.cart.set(product.id, currentQty + 1);
			orderStatusEl.hidden = true;
			refreshQuote();
		});

		gridEl.appendChild(card);
	}
}

async function refreshQuote() {
	const items = getCartItemsArray();
	const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
	cartCountPillEl.textContent = `${totalQty} ${totalQty === 1 ? 'item' : 'items'}`;

	const res = await fetch('/api/cart/quote', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ items, promoCode: state.promoCode }),
	});
	const quote = await res.json();

	if (!quote.ok) {
		showOrderMessage(quote.error, true);
		return;
	}

	if (quote.lineItems.length === 0) {
		cartEmptyEl.hidden = false;
		cartItemsEl.hidden = true;
		checkoutBtnEl.disabled = true;
	} else {
		cartEmptyEl.hidden = true;
		cartItemsEl.hidden = false;
		checkoutBtnEl.disabled = false;
		cartItemsEl.innerHTML = '';

		for (const item of quote.lineItems) {
			const li = document.createElement('li');
			li.className = 'cart-row';
			li.innerHTML = `
				<div>
					<strong>${item.name}</strong>
					<div class="muted-meta">${formatMoney(item.unitPriceCents)} × ${item.quantity}</div>
				</div>
				<div class="qty-controls">
					<button type="button" class="qty-btn dec-btn" aria-label="Decrease quantity of ${item.name}">−</button>
					<span>${item.quantity}</span>
					<button type="button" class="qty-btn inc-btn" aria-label="Increase quantity of ${item.name}">+</button>
				</div>
			`;

			li.querySelector('.dec-btn').addEventListener('click', () => {
				if (item.quantity <= 1) state.cart.delete(item.productId);
				else state.cart.set(item.productId, item.quantity - 1);
				refreshQuote();
			});

			li.querySelector('.inc-btn').addEventListener('click', () => {
				const product = state.products.find((p) => p.id === item.productId);
				if (product && item.quantity + 1 > product.stock) {
					showOrderMessage(`Only ${product.stock} left in stock for "${product.name}".`, true);
					return;
				}
				state.cart.set(item.productId, item.quantity + 1);
				refreshQuote();
			});

			cartItemsEl.appendChild(li);
		}
	}

	document.getElementById('val-subtotal').textContent = formatMoney(quote.subtotalCents);
	document.getElementById('val-discount').textContent = `-${formatMoney(quote.discountCents)}`;
	document.getElementById('val-shipping').textContent =
		quote.lineItems.length === 0
			? '$0.00'
			: quote.shippingCents === 0
				? 'FREE'
				: formatMoney(quote.shippingCents);
	document.getElementById('val-tax').textContent = formatMoney(quote.taxCents);
	document.getElementById('val-total').textContent = formatMoney(quote.totalCents);
	promoFeedbackEl.textContent = quote.promoMessage ?? '';
}

function showOrderMessage(message, isError) {
	orderStatusEl.hidden = false;
	orderStatusEl.textContent = message;
	orderStatusEl.classList.toggle('error', Boolean(isError));
}

document.querySelectorAll('.filter-btn').forEach((btn) => {
	btn.addEventListener('click', () => {
		document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
		btn.classList.add('active');
		state.category = btn.dataset.category;
		renderCatalog();
	});
});

promoFormEl.addEventListener('submit', (e) => {
	e.preventDefault();
	state.promoCode = promoInputEl.value.trim();
	refreshQuote();
});

checkoutBtnEl.addEventListener('click', async () => {
	const res = await fetch('/api/checkout', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ items: getCartItemsArray(), promoCode: state.promoCode }),
	});
	const data = await res.json();
	if (!data.ok) {
		showOrderMessage(data.error, true);
		return;
	}
	state.cart.clear();
	state.promoCode = '';
	promoInputEl.value = '';
	await refreshQuote();
	showOrderMessage(`Order ${data.orderNumber} confirmed! Total charged: ${formatMoney(data.totalCents)}`, false);
});

async function init() {
	const res = await fetch('/api/products');
	const data = await res.json();
	state.products = data.products;
	renderCatalog();
	await refreshQuote();
}

init();
