import {
	getOrdersFromBasket,
	removeIfEmpty,
	removeItemFromBasket,
	renderConcert,
	renderTicketsInBasketCounter,
} from "./basket-lib.js";

const BASKET_ITEMS = "basket-items";
const TRANSACTION_FEE = "transaction-fee";
const SUB_TOTAL = "sub-total";
const TOTAL = "total";
const TRANSACTION_FEE_PERCENTAGE = 1.5;
const TRANSACTION_FEE_FLAT_RATE = 0.2;

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
	const result = renderTotal(subTotal, transactionFee, orders, BASKET_ITEMS);
	if (!result)
		addEmptyBasketMessage(BASKET_ITEMS);
	else
		addCheckoutButton(TOTAL);
	addUpdateTotalEventListener(concerts);
	return;
}

function addCheckoutButton(insertPoint) {
	const checkoutButton = document.querySelector(".checkout");
	if (!checkoutButton)
		document.querySelector(`.${insertPoint}`).insertAdjacentHTML("afterend", `<button class="checkout">Checkout</button>`);
	return;
}

function addDeleteButtons(orders) {
	for (const [id, _] of Object.entries(orders)) {
		const concertCard = document.querySelector(`.concert-${id}`);
		concertCard.insertAdjacentHTML("beforeend", "<button class=\"delete\">X</button>");
		const deleteButton = concertCard.querySelector(".delete");
		deleteButton.addEventListener("click", e => removeItemFromBasket(e.target.parentElement.className.split('-')[1]));
	}
	return
}

function addEmptyBasketMessage(insertPoint) {
	const basketItems = document.querySelector(`.${insertPoint}`);
	basketItems.insertAdjacentHTML("beforeend", "<div>Your basket is empty</div>");
	return;
}

function addUpdateTotalEventListener(concerts) {
	const buttons = document.querySelectorAll("button");
	buttons.forEach(button => {
		button.addEventListener("click", () => {
			const orders = getOrdersFromBasket();
			const subTotal = calculateSubTotal(orders, concerts);
			const transactionFee = calcuateTransactionFee(subTotal);
			const result = renderTotal(subTotal, transactionFee, orders, BASKET_ITEMS);
			if (!result)
				addEmptyBasketMessage(BASKET_ITEMS);
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
	return Math.round((subTotal * (TRANSACTION_FEE_PERCENTAGE/100) + TRANSACTION_FEE_FLAT_RATE) * 100) / 100;
}

async function getConcertFromOrder(orderId) {
	if (orderId === "1044")
		return JSON.parse(`{"id":"1044","title":"Eternal Light","imageURL":"/img/spring-2023-poster-st-stephens.png","location":"St Stephen's Barbourne, Worcester","date":"Mon 25 Dec 2023","time":"6:49 PM","availableTickets":140,"fullPrice":10,"concessionPrice":0}`);
	else if (orderId === "1045")
		return JSON.parse(`{"id":"1045","title":"Eternal Light","imageURL":"/img/spring-2023-poster-st-stephens.png","location":"Holy Trinity Gloucester","date":"Mon 1 Jan 2024","time":"7:00 PM","availableTickets":140,"fullPrice":10,"concessionPrice":0}`);
	/*
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
	*/
	return JSON.parse(result);
}

async function getConcertsInfoFromOrders(orders) {
	let concerts = new Array();
	for (const [id] of Object.entries(orders)) {
		concerts.push(await getConcertFromOrder(id));
	}
	return concerts;
}

function isObjectNull(obj) {
	return obj && Object.keys(obj).length === 0 && Object.getPrototypeOf(obj) === Object.prototype;
}

function renderTotal(subTotal, transactionFee, orders, insertPoint) {
	let result = false;
	const total = subTotal+transactionFee;
	const ordersNode = document.querySelector(`.${insertPoint}`);

	const subTotalText = `SubTotal: ${subTotal}`;
	const transactionFeeText = `Transaction Fee: ${transactionFee}`;
	const totalText = `Total: ${total}`;

	const subTotalHTML = `<div class="${SUB_TOTAL}">${subTotalText}</div>`;
	const transactionFeeHTML = `<div class="${TRANSACTION_FEE}">${transactionFeeText}</div>`;
	const totalHTML = `<div class="${TOTAL}">${totalText}</div>`;

	const subTotalNode = document.querySelector(`.${SUB_TOTAL}`);
	const transactionFeeNode = document.querySelector(`.${TRANSACTION_FEE}`);
	const totalNode = document.querySelector(`.${TOTAL}`);
	if (isObjectNull(orders)) {
		if(totalNode) totalNode.remove();
		if(subTotalNode) subTotalNode.remove();
		if(transactionFeeNode) transactionFeeNode.remove();
	} else if (!isObjectNull(orders)) {
		updateInnerTextOrCreateHTML(totalNode, totalText, totalHTML, ordersNode);
		updateInnerTextOrCreateHTML(transactionFeeNode, transactionFeeText, transactionFeeHTML, ordersNode);
		updateInnerTextOrCreateHTML(subTotalNode, subTotalText, subTotalHTML, ordersNode);
		result = true;
	}
	return result;
}

function updateInnerTextOrCreateHTML(existingNode, innerText, htmlElement, insertNode) {
	if (existingNode)
		existingNode.innerHTML = innerText;
	else
		insertNode.insertAdjacentHTML("afterend", htmlElement);
}

main();
