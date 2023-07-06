import { STRIPE_PUBLISHABLE_KEY } from "./basket-lib.js";
import { renderBasketCounter } from "./basketCounter.js";

const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);

const clientSecret = new URLSearchParams(window.location.search).get("payment_intent_client_secret");

if(clientSecret)
	stripe.retrievePaymentIntent(clientSecret).then(({paymentIntent}) => {
		const messageTitle = document.querySelector("#message-title");
		const message = document.querySelector("#message");
		console.log(paymentIntent);

		switch(paymentIntent.status) {
			case "succeeded":
				messageTitle.innerHTML = "Payment Successful";
				message.innerHTML = "Please check your email inbox for your eTickets.";
				localStorage.clear();
				renderBasketCounter();
				break;
			case "processing":
				messageTitle.innerHTML = "Payment in progress";
				message.innerHTML = "Payment processing. We'll update you when payment is received.";
				break;
			case "requires_payment_method":
				messageTitle.innerHTML = "Payment failed";
				message.innerHTML = "Payment failed. Please try another payment method";
				break;
			default:
				messageTitle.innerHTML = "Something went wrong";
				message.innerHTML = "Please try again and check you've got your contact details right. If you continue to have issues please let us know and also check with your bank.";
				break;
		}
	});
