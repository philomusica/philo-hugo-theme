import { STRIPE_PUBLISHABLE_KEY } from "./basket-lib.js";

const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);

const clientSecret = new URLSearchParams(window.location.search).get("payment_intent_client_secret");

stripe.retrievePaymentIntent(clientSecret).then(({paymentIntent}) => {
	const message = document.querySelector("#message");

	switch(paymentIntent.status) {
		case "succeeded":
			message.innerHTML = "Success! Payment received.";
			break;
		case "processing":
			message.innerHTML = "Payment processing. We'll update you when payment is received.";
			break;
		case "requires_payment_method":
			message.innerHTML = "Payment failed. Please try another payment method";
			break;
		default:
			message.innerHTML = "Something went wrong.";
			break;
	}
});
