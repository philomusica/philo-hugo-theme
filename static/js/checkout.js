import {
	STRIPE_PUBLISHABLE_KEY,
	calcuateTransactionFee,
	calculateSubTotal,
	getConcertsInfoFromOrders,
	getOrdersFromBasket,
	isObjectNull
} from "./basket-lib.js";

const stripe = Stripe(STRIPE_PUBLISHABLE_KEY); // eslint-disable-line no-undef
const RETURN_URL = "https://philomusica.org.uk/complete";
const nextButton = document.querySelector("#next-btn");

async function main() {
	const orders = getOrdersFromBasket();
	if (isObjectNull(orders)) {
		document.querySelector(".checkout-forms").classList.add("hidden");
		document.querySelector(".empty-message").classList.remove("hidden");
	} else {
		const orders = getOrdersFromBasket();
		//const concerts = await getConcertsInfoFromOrders(orders);
		const concertsJson = `
		[
			{
			"id": "1050",
			"title": "Come and Sing: Faure Requiem",
			"description": "Join Philomusica for a Come and Sing day where we will be tackling Faure's Requiem and Rutter's Five Traditional Songs",
			"imageURL": "/img/spring-2024-concert-st-stephens.jpg",
			"location": "St. Stephen's, Barbourne, Worcester, WR3 7HS",
			"date": "Sat 11 May 2024",
			"time": "1:00 PM",
			"availableTickets": 298,
			"fullPrice": 10,
			"concessionPrice": 0,
			"additionalRequiredInfo": {
			"perTicket": [
			{
			"key": "part",
			"question": "What part do you sing?",
			"formType": "select",
			"options": [
			"Soprano",
			"Alto",
			"Tenor",
			"Bass",
			"Not sure"
			]
			},
			{
				"key": "borrow",
				"question": "Do you need to borrow a score?",
				"formType": "select",
				"options": [
					"Faure",
					"Rutter",
					"Both",
					"Neither"
				]
			},
			{
				"key": "allergies",
				"question": "Do you have an allergies (for cattery purposes)?",
				"formType": "text"
			}
			],
			"perPurchase": [
			{
			"key": "contact",
			"question": "Can we contact you about future events?",
			"formType": "checkbox"
			}
			]
			}
			}
			]
		`
		const concerts = JSON.parse(concertsJson);
		addAdditionFields(concerts, orders);
		const subTotal = calculateSubTotal(orders, concerts);
		const transactionFee = calcuateTransactionFee(subTotal);
		const total = subTotal + transactionFee;
		document.querySelector(".total-value").innerHTML = `£${total.toFixed(2)}`;
	}
}

function addCheckboxField(field, concertId, isPerTicket) {
	const checkboxHTML = `
		<div class="form-input">
			<span>${field.question}</span>
			<input id="${field.key}" data-concertid="${concertId}" data-isperticket="${isPerTicket}" style="width: auto; margin-left: 1rem" type="checkbox"  />
		</div>
	`;

	nextButton.insertAdjacentHTML("beforebegin", checkboxHTML);
}

function addSelectField(field, concertId, isPerTicket) {
	let selectHTML = `
		<div class="form-input">
			<span>${field.question}</span>
			<select id="${field.key}" data-concertid="${concertId}" data-isperticket="${isPerTicket}" style="border: solid 1px #f0f0f0;" required>
				<option value="">--Please choose an option--</option>
		`;
	field.options.forEach(option => selectHTML = selectHTML.concat(`<option value="${option}">${option}</option>`));
	selectHTML = selectHTML.concat("</select></div>");

	nextButton.insertAdjacentHTML("beforebegin", selectHTML);
}

function addTextField(field, concertId, isPerTicket) {
	const textHTML = `
		<div class="form-input">
			<div>${field.question}</div>
			<input id="${field.key}" data-concertid="${concertId}" data-isperticket="${isPerTicket}" type="text" class="text-input" />
		</div>
	`;
	nextButton.insertAdjacentHTML("beforebegin", textHTML);

}

function addPerTicketField(field, concertId) {
	const isPerTicket = true;
	switch (field.formType) {
		case "select":
			addSelectField(field, concertId, isPerTicket);
			break;
		case "text":
			addTextField(field, concertId, isPerTicket);
	}
}

function addPerPurchaseField(field, concertId) {
	const isPerTicket = false;
	if (document.querySelector(`#${field.key}`) === null) {
		switch (field.formType) {
			case "checkbox":
				addCheckboxField(field, concertId, isPerTicket);
				break;
		}
	}
}

function addAttendeeHeader(attendeeNum) {
	const headerHTML = `<h4>Attendee ${attendeeNum}</h4>`;
	nextButton.insertAdjacentHTML("beforebegin", headerHTML);
}

function addAdditionFields(concerts, orders) {
	concerts.forEach(concert => {
		concert.additionalRequiredInfo.perPurchase.forEach(field => addPerPurchaseField(field, concert.id));
		const ordersForConcert = orders[concert.id];
		const numTicketsForConcert = ordersForConcert.numOfFullPrice + ordersForConcert.numOfConcessions;
		for (let i = 0; i < numTicketsForConcert; i++) {
			addAttendeeHeader(i + 1);
			concert.additionalRequiredInfo.perTicket.forEach(field => addPerTicketField(field, concert.id));
		}
	});
}

async function generatePaymentIntent(paymentRequest) {
	let clientSecret = null;
	try {
		const response = await fetch("https://api.philomusica.org.uk/order", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(paymentRequest),
		});
		clientSecret = await response.json();
	} catch (e) {
		console.log("Error generating payment intent");
	}
	return clientSecret;
}

window.processPayment = async function processPayment(event) {
	event.preventDefault();
	//event.target.classList.add("hidden");
	const orders = getOrdersFromBasket();
	console.log(orders);

	const order = {
		additionalFields: {
		}
	};

	const coreFields = [ "firstName", "lastName", "email" ];

	const inputs = Array.from(document.querySelectorAll("input"));
	inputs.filter(input => input.id !== "next-btn").forEach(input => {
		if(coreFields.includes(input.id))
			order[input.id] = input.value
		else {
			if(input.dataset.isperticket)
				order.additionalFields[input.id] = input.value;
		}
	});

	// change { 1234: { fullPrice: 2, concession: 2} } to { id: 1234, fullPrice: 2, concession: 2 }
	const orderLines = Object.entries(orders).map(([concertId, value]) => ({ concertId, ...value }));
	order.orderLines = orderLines;

	console.log(order);



	/*
	const spinner = document.querySelector(".spinner");

	spinner.classList.remove("hidden");
	const { clientSecret } = await generatePaymentIntent(order);

	document.querySelector("#submit").classList.remove("hidden");
	if (clientSecret) {
		const options = {
			clientSecret,
			appearance: {},
		};
		const elements = stripe.elements(options);

		spinner.remove();
		const paymentElement = elements.create("payment", { layout: "accordion" });
		paymentElement.mount("#payment-element");

		const form = document.querySelector("#payment-form");
		form.addEventListener("submit", async event => {
			event.preventDefault();

			const { error } = await stripe.confirmPayment({
				elements,
				confirmParams: {
					return_url: RETURN_URL,
					payment_method_data: {
						billing_details: {
							name: `${firstName.value} ${lastName.value}`,
							email: email.value,
						},
					},
				},
			});

			if (error) {
				const messageContainer = document.querySelector("#error-message");
				messageContainer.textContent = error.message;
			}
		});
	}
	*/
};

main();
