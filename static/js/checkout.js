import { getOrdersFromBasket } from "./basket-lib.js";

const stripe = Stripe('pk_test_51MeRCLILyl1183MBN3PdFoF4iXh0ByTfGwg7C2xzEy8laiPSG7kxnwGLW4VdXRZqVHRSdtlXfej5nr8izn9XG9XY00orFiJohU');
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

async function main() {
	console.log("checkout.js connected");
	const orders = getOrdersFromBasket()
	// change { 1234: { fullPrice: 2, concession: 2} } to { id: 1234, fullPrice: 2, concession: 2 }
	const orderLines = Object.entries(orders).map(([concertId, value]) => ({concertId, ...value})); 
	const order = {
		orderLines,
		firstName,
		lastName,
		emailAdress
	};
	const clientSecret = await generatePaymentIntent(order);
	if(clientSecret) {
		const options = {
			clientSecret,
			appearance: {/* */},
		}
		const elements = stripe.elements(options);

		const paymentElement = elements.create("payment");
		paymentElement.mount("#payment-element");

		const form = document.querySelector("payment-form");
		form.addEventListener("submit", async event => {
			event.preventDefault();

			const { error } = await stripe.confirmPayment({
				elements,
				confirmPayment: {
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

main();
