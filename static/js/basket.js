import {
	getOrdersFromBasket,
	renderConcert,
	renderTicketsInBasketCounter,
} from "./basket-lib.js";

async function main() {
	const orders = getOrdersFromBasket();
	const concerts = await getConcertsInfoFromOrders(orders);
	for (const concert of concerts) {
		renderConcert(concert);
		document.querySelectorAll(`.concert-${concert.id} button`).forEach(button => button.addEventListener("click", removeIfEmpty));
		addDeleteButtons(orders, concert);
	}
	renderTicketsInBasketCounter(orders);
}

function addDeleteButtons(orders) {
	for(const [id, _ ] of Object.entries(orders)) {
		const concertCard = document.querySelector(`.concert-${id}`);
		concertCard.insertAdjacentHTML("beforeend", "<button class=\"delete\">X</button>");
		const deleteButton = concertCard.querySelector(".delete");
		deleteButton.addEventListener("click", e => removeItemFromBasket(e.target.parentElement.className.split('-')[1]));
	}
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
		concerts.push(await getConcertFromOrder(id));
	}
	return concerts;
}

function removeIfEmpty(e) {
	const orderId = e.target.parentElement.parentElement.className.split('-')[1];
	const concert = getOrdersFromBasket()[orderId];
	if(concert.fullPriceCount === 0 && concert.concessionPriceCount === 0)
		removeItemFromBasket(orderId);
	return;
}
	

function removeItemFromBasket(orderId) {
	let concerts = getOrdersFromBasket();
	delete concerts[orderId];
	sessionStorage.setItem("concerts", JSON.stringify(concerts));
	const order = document.querySelector(`.concert-${orderId}`);
	order.remove();
	return;
}

main();
