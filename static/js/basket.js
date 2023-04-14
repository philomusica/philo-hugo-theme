import {
	getOrdersFromBasket,
	removeIfEmpty,
	removeItemFromBasket,
	renderConcert,
	renderTicketsInBasketCounter,
} from "./basket-lib.js";

const BASKET_ITEMS = "basket-items";
const TOTAL = "total";

async function main() {
	const orders = getOrdersFromBasket();
	const concerts = await getConcertsInfoFromOrders(orders);
	for (const concert of concerts) {
		renderConcert(concert, BASKET_ITEMS, true);
		document.querySelectorAll(`.concert-${concert.id} button`).forEach(button => button.addEventListener("click", removeIfEmpty));
	}
	addDeleteButtons(orders);
	renderTicketsInBasketCounter(orders);
	const total = calculateTotal(orders, concerts);
	const result = renderTotal(total, orders, BASKET_ITEMS);
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
			const total = calculateTotal(orders, concerts);
			const result = renderTotal(total, orders, BASKET_ITEMS);
			if (!result)
				addEmptyBasketMessage(BASKET_ITEMS);
			else
				addCheckoutButton(TOTAL);
		});
	});
	return
}

function calculateTotal(orders, concerts) {
	let total = 0;
	for (const concert of concerts) {
		const order = orders[concert.id];
		if (order)
			total += order.fullPriceCount * concert.fullPrice + order.concessionPriceCount * concert.concessionPrice;
	}
	return total;
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

function renderTotal(total, orders, insertPoint) {
	let result = false;
	const innerText = `Total: ${total}`;
	let totalNode = document.querySelector(`.${TOTAL}`);
	if (orders && Object.keys(orders).length === 0 && Object.getPrototypeOf(orders) === Object.prototype && totalNode) {
		totalNode.remove();
	} else if (orders && Object.keys(orders).length > 0 && Object.getPrototypeOf(orders) === Object.prototype) {
		result = true;
		if (totalNode) {
			totalNode.innerHTML = innerText;
		} else {
			const totalHTML = `<div class="${TOTAL}">${innerText}</div>`;
			const ordersHTML = document.querySelector(`.${insertPoint}`);
			ordersHTML.insertAdjacentHTML("afterend", totalHTML);
		}
	}
	return result;
}

main();
