function calculateNoItemsInBasket() {
    const concerts = JSON.parse(localStorage.getItem("concerts"));
    const result = concerts ? concerts : {};
    let count = 0;
    for(const [, order ] of Object.entries(result)) {
        count += order.numOfFullPrice + (order.numOfConcessions >= 0 ? order.numOfConcessions : 0);
    }
    return count;
}

function updateUI(count) {
	const counter = document.querySelector(".basket-counter");
	if(count == 0)
		counter.classList.add("hidden");
	else
		counter.classList.remove("hidden");
	counter.innerHTML = count;
}

export function renderBasketCounter() {
	const count = calculateNoItemsInBasket();
	updateUI(count);
}


renderBasketCounter();
