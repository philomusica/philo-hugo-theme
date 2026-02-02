const addLabels = () => {
	const tableEl = document.querySelector("table");
	const thEls = tableEl.querySelectorAll("thead th");
	const tdLabels = Array.from(thEls).map(el => el.innerText);
	tableEl.querySelectorAll("tbody tr").forEach( tr => {
		Array.from(tr.children).forEach((td, ndx) =>  td.setAttribute("label", tdLabels[ndx]));
	});
};

addLabels();
