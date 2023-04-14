import {
	getOrdersFromBasket,
	displayError,
	renderConcert,
	renderTicketsInBasketCounter
} from './basket-lib.js';

/**
 * getQueryParameters receives any query parameters from the tickets URL, and generates a string that can be appended to the API to query a specific concert
 * @returns {string} params - a string that can be appended to the API call to filter on specific concerts
*/
function getQueryParameter() {
	let params = "";
	const searchKey = "id";
	if (window.location.search !== "") {
		const usp = new URLSearchParams(window.location.search);
		if (usp.has(searchKey))
			params = `?id=${usp.get(searchKey)}`;
	}
	// TODO implement getting param from url	
	return params;
}

/**
 * renderConcertData takes the requestBody received in the response from the API call to get concert(s), and renders the data in the UI
 * @param {object} requestBody the body object from the response object that is returned from the API call
*/
function renderConcertData(concertData) {
	if (concertData) {
		if (Array.isArray(concertData))
			concertData.forEach(c => renderConcert(c, "concerts", true));

		else
			renderConcert(concertData, "concerts", true)

		const orders = getOrdersFromBasket();
		renderTicketsInBasketCounter(orders);
	}
	return;
}

/**
 * main is the entry point for this component
*/
function main() {
	/*
	const qp = getQueryParameter();
	const url = `https://api.philomusica.org.uk/concerts${qp}`;
	fetch(url, {
		method: "GET",
		headers: {
			"Accept": "application/json"
		},
	})
		.then(res => {
			if(!res.ok)
				throw new Error("Unable to find concerts");
			return res.json()})
		.then(res =>  renderConcertData(res))
		.catch(err => displayError(err));
	*/
	renderConcertData(JSON.parse(`[{"id":"1044","title":"Eternal Light","imageURL":"/img/spring-2023-poster-st-stephens.png","location":"St Stephen's Barbourne, Worcester","date":"Mon 25 Dec 2023","time":"6:49 PM","availableTickets":140,"fullPrice":10,"concessionPrice":0},{"id":"1045","title":"Eternal Light","imageURL":"/img/spring-2023-poster-st-stephens.png","location":"Holy Trinity Gloucester","date":"Mon 1 Jan 2024","time":"7:00 PM","availableTickets":140,"fullPrice":10,"concessionPrice":0}]`));
	return;
}

// Call entrypoint function
main();
