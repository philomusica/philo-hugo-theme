import { STRIPE_PUBLISHABLE_KEY, displayError, getOrdersFromBasket, isObjectNull } from "./basket-lib.js";

const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
const RETURN_URL = "https://dev.philomusica.org.uk/complete.html";

async function generatePaymentIntent(paymentRequest) {
	let clientSecret = null;
	try {
		const response = await fetch('https://api.philomusica.org.uk/order', {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(paymentRequest),
		});
		clientSecret = await response.json();
	} catch(e) {
		console.log("Error generating payment intent");
	}
	return clientSecret;
}

async function processPayment(event, orderLines) {
	event.target.classList.add("hidden");
    const firstName = document.querySelector('input[id="first-name"]');
    const lastName = document.querySelector('input[id="last-name"]');
    const email = document.querySelector('input[id="email"]');
	const order = {
		orderLines,
		firstName: firstName.value,
		lastName: lastName.value,
		email: email.value
	}
	const { clientSecret } = await generatePaymentIntent(order);
	/*
	firstName.readOnly = true;
	lastName.readOnly = true;
	email.readOnly = true;
	*/
	
	document.querySelector("#submit").classList.remove("hidden");
	if(clientSecret) {
		const options = {
			clientSecret,
			appearance: {},
		}
		const elements = stripe.elements(options);

		const paymentElement = elements.create("payment");
		paymentElement.mount("#payment-element");

		const form = document.querySelector("#payment-form");
		form.addEventListener("submit", async event => {
			event.preventDefault();

			const { error } = await stripe.confirmPayment({
				elements,
				confirmParams: {
					return_url: RETURN_URL,
				},
			});

			if(error) {
				const messageContainer = document.querySelector("#error-message");
				messageContainer.textContent = error.message;
			} else {
			}
		});
	}
}

async function main() {
	const orders = getOrdersFromBasket()
	if(isObjectNull(orders))
		displayError("Can't proceed to checkout as there are no items in your basket");
	else {
		// change { 1234: { fullPrice: 2, concession: 2} } to { id: 1234, fullPrice: 2, concession: 2 }
		const orderLines = Object.entries(orders).map(([concertId, value]) => ({concertId, ...value})); 
		const formSubmit = document.querySelector(".form-input .call-to-action");
		console.log(formSubmit);
		formSubmit.addEventListener("click", (e) => processPayment(e, orderLines));
	}
}

main();
