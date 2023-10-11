import { renderBasketCounter } from "./basket-counter.js";

export const CONCESSION_CRITERIA = "Under 16s";
export const FULL_PRICE_COUNTER_CLASS_NAME = "full-price-counter";
export const CONCESSION_COUNTER_CLASS_NAME = "concession-counter";
export const STRIPE_PUBLISHABLE_KEY = "pk_live_51MeRCLILyl1183MBu3f8SHBuvuf9URqu72vwU06ZApvRGDsibltt9oyXgPAYd2H9vd5UTGsMe6CRCBnyYpckMb0z00ui4yZAIp";
const TRANSACTION_FEE_PERCENTAGE = 0; //1.5;
const TRANSACTION_FEE_FLAT_RATE = 0; //0.2;

function counterButtonsClick(e, concertData, page) {
	let increment = 1;
	if (e.target.className.includes("minus"))
		increment = -1;

	const orderChange = {
		id: e.target.parentElement.parentElement.parentElement.parentElement.className.split("-")[1],
		fullPriceAdjustment: 0,
		concessionPriceAdjustment: 0
	};

	if (e.target.parentElement.parentElement.classList.contains("full-price"))
		orderChange.fullPriceAdjustment = increment;
	else
		orderChange.concessionPriceAdjustment = increment;


	const concerts = updateOrdersInBasket(orderChange, concertData);
	renderTicketsInBasketCounter(concerts);
	renderBasketCounter();

	const goToBasketBtn = e.target.parentElement.parentElement.parentElement.querySelector(".go-to-basket");
	if(goToBasketBtn && concerts[orderChange.id].numOfFullPrice === 0 && concerts[orderChange.id].numOfConcessions === 0)
		goToBasketBtn.classList.add("hidden");
	else if(goToBasketBtn)
		goToBasketBtn.classList.remove("hidden");

	if(page === "basket" && concerts.length === 0)
		emptyBasketInUI();

	return;
}

export function emptyBasketInUI() {
	document.querySelector(".concerts").parentElement.parentElement.classList.add("hidden");
	document.querySelector(".totals").classList.add("hidden");
	document.querySelector(".empty-message").classList.remove("hidden");
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

export async function getConcertsInfoFromOrders(orders) {
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

export function calculateSubTotal(orders, concerts) {
	let total = 0;
	for (const concert of concerts) {
		const order = orders[concert.id];
		if (order)
			total += order.numOfFullPrice * concert.fullPrice + order.numOfConcessions * concert.concessionPrice;
	}
	return total;
}

export function calcuateTransactionFee(subTotal) {
	return Math.round((subTotal * (TRANSACTION_FEE_PERCENTAGE / 100) + TRANSACTION_FEE_FLAT_RATE) * 100) / 100;
}

/**
 * displayError displays an error to the customer if something went wrong when fetching concerts from the API or adding tickets to the basket
 * @param {string} err - the error message to display to the customer
*/
export function displayError(err) {
	const message = document.querySelector(".message");
	message.innerHTML = err;
	message.classList.remove("hidden");
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

export function removeIfEmpty(e, page) {
	const orderId = e.target.parentElement.parentElement.parentElement.parentElement.className.split("-")[1];
	const concert = getOrdersFromBasket()[orderId];
	if (concert.numOfFullPrice === 0 && concert.numOfConcessions === 0)
		removeItemFromBasket(orderId, page);
	return;
}

export function removeItemFromBasket(orderId, page) {
	let concerts = getOrdersFromBasket();
	delete concerts[orderId];
	localStorage.setItem("concerts", JSON.stringify(concerts));
	const order = document.querySelector(`.concert-${orderId}`);
	if (order && page === "basket")
		order.remove();

	if(isObjectNull(concerts) && page === "basket")
		emptyBasketInUI();
		
	renderBasketCounter();
	return;
}

/**
 * renderConcert takes a given concert object and renders the information in an HTML block that is injected into the DOM
 * @param {object} c - a concert contain information like ID, title, description, location, date, ticket data etc.
 * @returns null
*/
export function renderConcert(concertData, insertPoint, page) {
	let fullPrice, concession;
	if (concertData.concessionPrice === 0)
		concession = "FREE";
	else
		concession = `£${concertData.concessionPrice}`;

	if (concertData.fullPrice === 0)
		fullPrice = "FREE";
	else
		fullPrice = `£${concertData.fullPrice}`;

	const fullPriceCount = `<span class="call-to-action minus counter">-</span><span class="${FULL_PRICE_COUNTER_CLASS_NAME}">0</span><span class="call-to-action plus counter">+</span>`;
	const concessionPriceCount = `<span class="call-to-action minus counter">-</span><span class="${CONCESSION_COUNTER_CLASS_NAME}">0</span><span class="call-to-action plus counter">+</span>`;

	const fullPriceValueAndCount = `
		<div class="ticket-info">
			<div>Adult</div>
			<div>${fullPrice}</div>
		</div>
		<div>${fullPriceCount}</div>`;

	const concessionValueAndCount = `
		<div class="ticket-info">
			<div>${CONCESSION_CRITERIA}</div>
			<div>${concession}</div>
		</div>
		<div>${concessionPriceCount}</div>`;

	let image = "", description = "", goToBasketBtn = "";
	if(page === "tickets") {
		image = `<div class="concert-column">
					<img class="concert-image" src=${concertData.imageURL} alt=${concertData.description}>
				</div>`;
		description = `<div>${concertData.description}</div>`;
		goToBasketBtn = "<a href=\"/basket\" class=\"hidden call-to-action go-to-basket\"><i class=\"fas fa-shopping-basket small-basket\"></i>Go to basket</a>";
	}


	let deleteBtnHTML = "";
	if(page === "basket")
		deleteBtnHTML = "<div class=\"concert-column\" <div class=\"tickets-info\"><div class=\"call-to-action delete\"><i class=\"fas fa-trash-alt\"></i></div></div>";

	const div = `
		<div class="concert concert-${concertData.id}">
			${image}
			<div class="concert-column">
				<div><b>${concertData.title}</b></div>
				${description}
				<div>
					<i alt="location icon" class="fa-solid fa-location-dot"></i>
					<span>${concertData.location}</span>
				</div>
				<div>
					<i alt="clock icon" class="fa-solid fa-clock"></i>
					<span>${concertData.date} ${concertData.time}</span>
				</div>
			</div>
			<div class="concert-column">
				<div class="tickets-info full-price">${fullPriceValueAndCount}</div>
				<div class="tickets-info concession">${concessionValueAndCount}</div>
				${goToBasketBtn}
			</div>
			${deleteBtnHTML}
		</div>
	`;
	document.querySelector(`${insertPoint}`).insertAdjacentHTML("beforeend", div);
	const concertCard = document.querySelector(`.concert-${concertData.id}`);
	const buttons = concertCard.querySelectorAll(".counter");
	buttons.forEach(button => button.addEventListener("click", event => counterButtonsClick(event, concertData, page)));
	buttons.forEach(button => button.addEventListener("click", e => removeIfEmpty(e, page)));
	const deleteBtn = concertCard.querySelector(".delete");
	if(deleteBtn)
		deleteBtn.addEventListener("click", e => removeItemFromBasket(e.currentTarget.parentElement.parentElement.className.split("-")[1], page));
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
		displayError("There are no more tickets are available");
	}
	return concerts;
}
