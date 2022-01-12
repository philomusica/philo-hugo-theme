/*
    CONTACT
*/
function clearForm(name, email, message) {
    name.value = "";
    email.value = "";
    message.value = "";
}

function feedbackToUser(result) {
    if(result === "success") {
        const successMessage = document.querySelector(".alert-success");
        successMessage.classList.remove("transparent");
    } else if (result === "fail") {
        const failMessage = document.querySelector(".alert-fail");
        failMessage.classList.remove("transparent");
    } else if (result === "no-captcha") {
        const failMessage = document.querySelector(".alert-warn");
        failMessage.classList.remove("transparent");
    }
    setTimeout(clearAlert, 5000);
}

function clearAlert() {
    const alerts = document.querySelectorAll(".alert");
    alerts.forEach(alert => {
        if(!alert.classList.contains("transparent")) {
            alert.classList.add("transparent");
        }
    });
}

/* eslint-disable */
function processForm(e) {
/* eslint-enable */
    e.preventDefault();
    clearAlert();
    var URL = "https://api.philomusica.org.uk/contact/contact-us";

    const name = document.querySelector("input[id=\"name\"]");
    const email = document.querySelector("input[id=\"email\"]");
    var message = document.querySelector("textarea[id=\"message\"]");
    var data = {
       name : name.value,
       email : email.value,
       message : message.value,
		/* eslint-disable */
       captchaResponse: grecaptcha.getResponse()
	   /* eslint-enable */
    };

    if(data.captchaResponse === "" || data.captchaResponse === null) {
        feedbackToUser("no-captcha");
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open("POST", URL, true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");

    // send the collected data as JSON
    xhr.send(JSON.stringify(data));

    xhr.onload = function () {
        if(xhr.status === 200) {
            feedbackToUser("success");
        } else {
            feedbackToUser("fail");
        }
    };

    xhr.onerror = function() {
        feedbackToUser("fail");
    };

    clearForm(name, email, message);
     
  }

