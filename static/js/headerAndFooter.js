const hamburger = document.querySelector(".hamburger");
const cross = document.querySelector(".cross");
const menu = document.querySelector(".menu");
const menuItem = document.querySelectorAll(".menu-item");
const menuLink = document.querySelectorAll(".menu-link");
const mq = window.matchMedia( "(min-width: 1100px)" );
const subItems = document.querySelectorAll(".sub-items");
const chevrons = document.querySelectorAll(".fa-chevron-down");

const flattenNavItems = () => {
    menu.classList.add("flatten");
    menu.style.height = "0px";
	closeAllSubMenuForMobile();
};

const setNavBarHeight = () => {
    const navBarHeight = menuItem[0].scrollHeight * menuItem.length + 10;
    menu.style.height = navBarHeight + "px";
};

const openNavItems = () => {
    menu.classList.remove("flatten");
    setNavBarHeight();
};

const openHamburger = () => {
    hamburger.classList.add("hidden", "no-display");
    cross.classList.remove("hidden", "no-display");
    openNavItems();
};

const closeHamburger = () => {
	closeAllSubMenuForMobile();
    cross.classList.add("hidden", "no-display");
    hamburger.classList.remove("hidden", "no-display");
    flattenNavItems();
};

hamburger.addEventListener("click", () => {
    openHamburger();
});

cross.addEventListener("click", () => {
    closeHamburger();
});

const subMenus = document.querySelectorAll(".sub-menu");

const openCloseSubMenuOnHover = (e) => {
	const subPages = e.target.querySelector(".sub-items");
	if (subPages.classList.contains("hidden"))
		subPages.classList.remove("hidden");
	else
		subPages.classList.add("hidden");
};

const closeAllSubMenuForMobile = () => {
	subItems.forEach(e => {
	const subMenuHeight = Number.parseInt(e.style.height);
	if(subMenuHeight > 0)
		menu.style.height = Number.parseInt(menu.style.height) - subMenuHeight + "px";
	e.classList.add("hidden");
	e.classList.add("flatten");
	e.style.height = "0px";
	});
	chevrons.forEach(e => e.classList.remove("turn-chevron"));
};

const openSubMenu = e => {
	e.classList.remove("hidden");
	e.classList.remove("flatten");
	const subMenuHeight = setSubMenuHeight(e);
	menu.style.height = Number.parseInt(menu.style.height) + subMenuHeight + "px";
};

const setSubMenuHeight = (e) => {
	const items = e.querySelectorAll("a");
    const height = items[0].scrollHeight * items.length;
    e.style.height = height + "px";
	return height;
};

const openCloseSubMenuForMobile = (e) => {
	const sb = e.currentTarget.parentElement.nextElementSibling;
	const isClosed = sb.classList.contains("hidden");
	closeAllSubMenuForMobile();
	if(isClosed) {
		openSubMenu(sb);
		e.target.classList.toggle("turn-chevron");
	}
};

const widthChange = (mq) => {
    if (mq.matches) {
        menu.classList.remove("flatten");
        menu.style.height = "unset";
        hamburger.classList.add("hidden","no-display");
        cross.classList.add("hidden", "no-display");
        menu.classList.remove("collapsible");
        menuLink.forEach(item => item.removeEventListener("click", closeHamburger));
				subMenus.forEach(e => {
					e.addEventListener("mouseenter", openCloseSubMenuOnHover);
					e.addEventListener("mouseleave", openCloseSubMenuOnHover);
				});
				closeAllSubMenuForMobile();
				subItems.forEach(e => e.classList.remove("flatten"));
				chevrons.forEach(e => e.removeEventListener("click", openCloseSubMenuForMobile));
				chevrons.forEach(e => e.classList.add("hidden", "no-display"));

    } else {
        hamburger.classList.remove("hidden", "no-display");
        cross.classList.add("hidden", "no-display");
        menuLink.forEach(item => item.addEventListener("click", closeHamburger));
        flattenNavItems();
        setTimeout(() => menu.classList.add("collapsible"), 200);
		subMenus.forEach(e => {
			e.removeEventListener("mouseenter",openCloseSubMenuOnHover);
			e.removeEventListener("mouseleave", openCloseSubMenuOnHover);
		});
		chevrons.forEach(e => e.addEventListener("click", openCloseSubMenuForMobile));
		chevrons.forEach(e => e.classList.remove("hidden", "no-display"));
    }
};

widthChange(mq);
mq.addEventListener("change", widthChange);
