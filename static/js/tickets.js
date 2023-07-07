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
			concertData.forEach(c => renderConcert(c, ".concerts", true));

		else
			renderConcert(concertData, ".concerts", true)

		const orders = getOrdersFromBasket();
		renderTicketsInBasketCounter(orders);
	}
	return;
}

/**
 * main is the entry point for this component
*/
function main() {
	const spinner = document.querySelector(".spinner");
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
			spinner.remove();
			if(!res.ok)
				throw new Error("Unable to find concerts");
			return res.json()})
		.then(res =>  renderConcertData(res))
		.catch(err => displayError(err));
		*/
		spinner.remove();
		renderConcertData([
    {
        "id": "1047",
        "title": "Handel's Messiah",
        "description": "Philomusica's debut performance at St. Philip's \u0026 St. James', bringing you a choral favourite in Handel's Messiah.",
        "imageURL": "/img/philo-back-of-tewks-min.jpg",
        "location": "St. Philip's \u0026 St. James', Cheltenham",
        "date": "Sat 18 Nov 2023",
        "time": "7:30 PM",
        "availableTickets": 236,
        "fullPrice": 15,
        "concessionPrice": 0
    }
])
	//displayError("There are no concert tickets available at the moment. Please check back again later");
	return;
}

// Call entrypoint function
main();
