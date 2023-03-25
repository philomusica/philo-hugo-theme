const CONCESSION_CRITERIA = "Accompanied children under 16";
const FULL_PRICE_COUNTER_CLASS_NAME = "full-price-counter"
const CONCESSION_COUNTER_CLASS_NAME = "concession-counter"

/**
 * displayError displays an error to the customer if something went wrong when fetching concerts from the API or adding tickets to the basket
 * @param {string} err - the error message to display to the customer
*/
export function displayError(err) {
	console.log(err);
	return;
}
