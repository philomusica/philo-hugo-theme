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
	console.log(concertData);
	if(concertData) {
		if(Array.isArray(concertData))
			concertData.forEach(c => renderConcert(c));

		else
			renderConcert(concertData)

		const orders = getOrdersFromBasket();
		renderTicketsInBasketCounter(orders);
	}
	return;
}

/**
 * main is the entry point for this component
*/
function main() {
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
	return;
}

// Call entrypoint function
main();
