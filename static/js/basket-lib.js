import { renderBasketCounter } from "./basketCounter.js";

export const CONCESSION_CRITERIA = "Accompanied children under 16";
export const FULL_PRICE_COUNTER_CLASS_NAME = "full-price-counter";
export const CONCESSION_COUNTER_CLASS_NAME = "concession-counter";
export const STRIPE_PUBLISHABLE_KEY = "pk_test_51MeRCLILyl1183MBN3PdFoF4iXh0ByTfGwg7C2xzEy8laiPSG7kxnwGLW4VdXRZqVHRSdtlXfej5nr8izn9XG9XY00orFiJohU";

function counterButtonsClick(e, concertData) {
	let increment = 1;
	if (e.target.className === "call-to-action minus")
		increment = -1;

	const orderChange = {
		id: e.target.parentElement.parentElement.parentElement.className.split("-")[1],
		fullPriceAdjustment: 0,
		concessionPriceAdjustment: 0
	};

	if (e.target.parentElement.className === "tickets-info full-price")
		orderChange.fullPriceAdjustment = increment;
	else
		orderChange.concessionPriceAdjustment = increment;

	const concerts = updateOrdersInBasket(orderChange, concertData);
	renderTicketsInBasketCounter(concerts);
	renderBasketCounter();
	return;
}

/**
 * displayError displays an error to the customer if something went wrong when fetching concerts from the API or adding tickets to the basket
 * @param {string} err - the error message to display to the customer
*/
export function displayError(err) {
	document.querySelector(".concerts").innerHTML = err;
	return;
}

/**
 * getOrdersFromBasket checks the localStorage relating to tickets a customer has put in their basket, and returns this data in an object of objects
 * @returns {object} basketItems - an object of containing objects for each concert, the objects are named by concert ID an contain number of tickets for each type which the customer has put in their basket. If no concerts, an empty object is returned
*/
export function getOrdersFromBasket() {
	const concerts = JSON.parse(localStorage.getItem("concerts"));
	return concerts ? concerts : {};
}

export function isObjectNull(obj) {
	return obj && Object.keys(obj).length === 0 && Object.getPrototypeOf(obj) === Object.prototype;
}

export function removeIfEmpty(e) {
	const orderId = e.target.parentElement.parentElement.parentElement.className.split("-")[1];
	const concert = getOrdersFromBasket()[orderId];
	if (concert.numOfFullPrice === 0 && concert.numOfConcessions === 0)
		removeItemFromBasket(orderId);
	return;
}

export function removeItemFromBasket(orderId) {
	let concerts = getOrdersFromBasket();
	delete concerts[orderId];
	localStorage.setItem("concerts", JSON.stringify(concerts));
	const order = document.querySelector(`.concert-${orderId}`);
	if (order)
		order.remove();
	renderBasketCounter();
	return;
}

/**
 * renderConcert takes a given concert object and renders the information in an HTML block that is injected into the DOM
 * @param {object} c - a concert contain information like ID, title, description, location, date, ticket data etc.
 * @returns null
*/
export function renderConcert(concertData, insertPoint, editable) {
	let fullPrice, concession;
	if (concertData.concessionPrice === 0)
		concession = "FREE";
	else
		concession = `£${concertData.concessionPrice}`;

	if (concertData.fullPrice === 0)
		fullPrice = "FREE";
	else
		fullPrice = `£${concertData.fullPrice}`;

	let fullPriceCount, conccessionPriceCount;
	if (editable) {
		fullPriceCount = `<span class="call-to-action minus">-</span><span class="${FULL_PRICE_COUNTER_CLASS_NAME}">0</span><span class="call-to-action plus">+</span>`;
		conccessionPriceCount = `<span class="call-to-action minus">-</span><span class="${CONCESSION_COUNTER_CLASS_NAME}">0</span><span class="call-to-action plus">+</span>`;
	} else {
		fullPriceCount = `<span class="${FULL_PRICE_COUNTER_CLASS_NAME}">0</span>`;
		conccessionPriceCount = `<span class="${CONCESSION_COUNTER_CLASS_NAME}">0</span>`;
	}

	const fullPriceValueAndCount = `
		<div class="tickets-info full-price">
			<div>Adult: ${fullPrice}</div> ${fullPriceCount}
		</div>`;

	const concessionValueAndCount = `
		<div class="tickets-info concession">
			<div>${CONCESSION_CRITERIA}: ${concession}</div> ${conccessionPriceCount}
		</div>
	`;

	const div = `
		<div class="concert concert-${concertData.id}">
			<div class="concert-column">
				<img class="concert-image" src=${concertData.imageURL} alt=${concertData.description}>
			</div>
			<div class="concert-column">
				<div><b>${concertData.title}</b></div>
				<div>${concertData.description}</div>
				<div>${concertData.location}</div>
				<div>${concertData.date} ${concertData.time}</div>
			</div>
			<div class="concert-column">
				${fullPriceValueAndCount}
				${concessionValueAndCount}
			</div>
		</div>
	`;
	document.querySelector(`${insertPoint}`).insertAdjacentHTML("beforeend", div);
	const buttons = document.querySelectorAll(`.concert-${concertData.id} .call-to-action`);
	buttons.forEach(button => button.addEventListener("click", event => counterButtonsClick(event, concertData)));
	buttons.forEach(button => button.addEventListener("click", removeIfEmpty));
	return;
}

/**
 * renderTicketsInBasketCounter takes the basket items from the getOrdersFromBasket function call and updates the UI with these values
 * @param {object} orders - the data returned from getOrdersFromBasket call
*/
export function renderTicketsInBasketCounter(orders) {
	for (const [id, order] of Object.entries(orders)) {
		const fullPriceCounter = document.querySelector(`.concert-${id} .${FULL_PRICE_COUNTER_CLASS_NAME}`);
		if (fullPriceCounter)
			fullPriceCounter.innerHTML = order.numOfFullPrice;

		const concessionCounter = document.querySelector(`.concert-${id} .${CONCESSION_COUNTER_CLASS_NAME}`);
		if (concessionCounter)
			concessionCounter.innerHTML = order.numOfConcessions;
	}
}

/**
 * updateOrdersInBasket updates the orders saved in the sesionStorage
 * @param {object} order - an object containing the concertID and numerial change to each ticket type
 * @return {object} concerts - an updated basket
*/
export function updateOrdersInBasket(order, concertData) {
	const concerts = getOrdersFromBasket();
	const existingOrder = concerts[order.id];
	let newOrder = { ...existingOrder };

	// Math.max ensures no minus number
	newOrder.numOfFullPrice = Math.max((existingOrder ? existingOrder.numOfFullPrice : 0) + order.fullPriceAdjustment, 0);
	newOrder.numOfConcessions = Math.max((existingOrder ? existingOrder.numOfConcessions : 0) + order.concessionPriceAdjustment, 0);

	if ((newOrder.numOfFullPrice + newOrder.numOfConcessions) <= concertData.availableTickets) {
		concerts[order.id] = newOrder;
		localStorage.setItem("concerts", JSON.stringify(concerts));
	} else {
		displayError("no more tickets are available");
	}
	return concerts;
}
