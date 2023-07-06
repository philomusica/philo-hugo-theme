import {
	displayError,
	getOrdersFromBasket,
	isObjectNull,
	removeIfEmpty,
	removeItemFromBasket,
	renderConcert,
	renderTicketsInBasketCounter,
} from "./basket-lib.js";

const BASKET_ITEMS = ".concerts";
const TRANSACTION_FEE = "transaction-fee";
const SUB_TOTAL = "sub-total";
const TOTAL = "total";
const TRANSACTION_FEE_PERCENTAGE = 1.5;
const TRANSACTION_FEE_FLAT_RATE = 0.2;
const EMPTY_BASKET_MESSAGE = "Your basket is empty";

async function main() {
	const orders = getOrdersFromBasket();
	const concerts = await getConcertsInfoFromOrders(orders);
	for (const concert of concerts) {
		renderConcert(concert, BASKET_ITEMS, true);
		document.querySelectorAll(`.concert-${concert.id} button`).forEach(button => button.addEventListener("click", removeIfEmpty));
	}
	addDeleteButtons(orders);
	renderTicketsInBasketCounter(orders);
	const subTotal = calculateSubTotal(orders, concerts);
	const transactionFee = calcuateTransactionFee(subTotal);
	const result = renderTotal(subTotal, transactionFee, orders);
	if (!result)
		displayError(EMPTY_BASKET_MESSAGE);
	else
		addCheckoutButton(TOTAL);
	addUpdateTotalEventListener(concerts);
	return;
}

function addCheckoutButton(insertPoint) {
	const checkoutButton = document.querySelector(".checkout");
	if (!checkoutButton)
		document.querySelector(`.${insertPoint}`).insertAdjacentHTML("afterend", "<a class=\"call-to-action checkout\" href=\"/checkout.html\">Checkout</a>");
	return;
}

function addDeleteButtons(orders) {
	for (const [id, _] of Object.entries(orders)) {
		const concertCard = document.querySelector(`.concert-${id}`);
		concertCard.insertAdjacentHTML("beforeend", `<div class="tickets-info"><div class="call-to-action delete">X</div></div>`);
		const deleteButton = concertCard.querySelector(".delete");
		deleteButton.addEventListener("click", e => removeItemFromBasket(e.target.parentElement.parentElement.className.split('-')[1]));
	}
	return
}

function addUpdateTotalEventListener(concerts) {
	const buttons = document.querySelectorAll(".tickets-info .call-to-action");
	
	buttons.forEach(button => {
		button.addEventListener("click", () => {
			const orders = getOrdersFromBasket();
			const subTotal = calculateSubTotal(orders, concerts);
			const transactionFee = calcuateTransactionFee(subTotal);
			const result = renderTotal(subTotal, transactionFee, orders);
			if (!result)
				displayError(EMPTY_BASKET_MESSAGE);
			else
				addCheckoutButton(TOTAL);
		});
	});
	return
}

function calculateSubTotal(orders, concerts) {
	let total = 0;
	for (const concert of concerts) {
		const order = orders[concert.id];
		if (order)
			total += order.numOfFullPrice * concert.fullPrice + order.numOfConcessions * concert.concessionPrice;
	}
	return total;
}

function calcuateTransactionFee(subTotal) {
	return Math.round((subTotal * (TRANSACTION_FEE_PERCENTAGE / 100) + TRANSACTION_FEE_FLAT_RATE) * 100) / 100;
}

async function getConcertFromOrder(orderId) {
	let result;
	try {
		const url = `https://api.philomusica.org.uk/concerts?id=${orderId}`;
		const response = await fetch(url, {
			method: "GET",
			headers: {
				"Accept": "application/json"
			},
		});
		result = await response.json();
	} catch (e) {
		console.log("error calling api", e);
	}
	return result;
}

async function getConcertsInfoFromOrders(orders) {
	let concerts = new Array();
	for (const [id] of Object.entries(orders)) {
		const concert = await getConcertFromOrder(id);
		if(concert.error) {
			delete orders[id];
			removeItemFromBasket(id);
		} else {
			concerts.push(concert);
		}
	}
	return concerts;
}

function renderTotal(subTotal, transactionFee, orders) {
	let result = false;
	const total = subTotal + transactionFee;
	const ordersNode = document.querySelector(`.totals`);

	const subTotalText = `SubTotal: £${subTotal}`;
	const transactionFeeText = `Transaction Fee: £${transactionFee.toFixed(2)}`;
	const totalText = `Total: £${total.toFixed(2)}`;

	const subTotalHTML = `<div class="${SUB_TOTAL}">${subTotalText}</div>`;
	const transactionFeeHTML = `<div class="${TRANSACTION_FEE}">${transactionFeeText}</div>`;
	const totalHTML = `<div class="${TOTAL}">${totalText}</div>`;

	const subTotalNode = document.querySelector(`.${SUB_TOTAL}`);
	const transactionFeeNode = document.querySelector(`.${TRANSACTION_FEE}`);
	const totalNode = document.querySelector(`.${TOTAL}`);
	const checkoutButton = document.querySelector(".checkout");
	if (isObjectNull(orders)) {
		if (totalNode) totalNode.remove();
		if (subTotalNode) subTotalNode.remove();
		if (transactionFeeNode) transactionFeeNode.remove();
		if (checkoutButton) checkoutButton.remove();
	} else if (!isObjectNull(orders)) {
		updateInnerTextOrCreateHTML(subTotalNode, subTotalText, subTotalHTML, ordersNode);
		updateInnerTextOrCreateHTML(transactionFeeNode, transactionFeeText, transactionFeeHTML, ordersNode);
		updateInnerTextOrCreateHTML(totalNode, totalText, totalHTML, ordersNode);
		result = true;
	}
	return result;
}

function updateInnerTextOrCreateHTML(existingNode, innerText, htmlElement, insertNode) {
	if (existingNode)
		existingNode.innerHTML = innerText;
	else
		insertNode.insertAdjacentHTML("beforeend", htmlElement);
}

main();
