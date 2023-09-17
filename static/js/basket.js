import {
    calcuateTransactionFee,
    calculateSubTotal,
    emptyBasketInUI,
	getConcertsInfoFromOrders,
	getOrdersFromBasket,
	renderConcert,
	renderTicketsInBasketCounter,
} from "./basket-lib.js";

const BASKET_ITEMS = ".concerts";

async function main() {
	const orders = getOrdersFromBasket();
	const concerts = await getConcertsInfoFromOrders(orders);
	const spinner = document.querySelector(".spinner");
	spinner.remove();
	if(concerts.length === 0)
		emptyBasketInUI();
	else {
		for (const concert of concerts) {
			renderConcert(concert, BASKET_ITEMS, "basket");
		}
		renderTicketsInBasketCounter(orders);
		const subTotal = calculateSubTotal(orders, concerts);
		const transactionFee = calcuateTransactionFee(subTotal);
		renderTotal(subTotal, transactionFee, orders);
		addUpdateTotalEventListener(concerts);
	}
	return;
}

function addUpdateTotalEventListener(concerts) {
	const buttons = document.querySelectorAll(".tickets-info .call-to-action,.delete");
	
	
	buttons.forEach(button => {
		button.addEventListener("click", () => {
			const orders = getOrdersFromBasket();
			const subTotal = calculateSubTotal(orders, concerts);
			const transactionFee = calcuateTransactionFee(subTotal);
			renderTotal(subTotal, transactionFee, orders);
		});
	});
	return
}

function renderTotal(subTotal, transactionFee) {
	const total = subTotal + transactionFee;
	/*
	document.querySelector(".sub-total-value").innerHTML = `£${subTotal}`;
	document.querySelector(".transaction-fee-value").innerHTML = `£${transactionFee.toFixed(2)}`;
	*/
	document.querySelector(".total-value").innerHTML = `£${total.toFixed(2)}`;
	return;
}

main();
