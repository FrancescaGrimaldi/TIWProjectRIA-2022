/**
 * Subscription management
 */
(function() {
	document.getElementById("subscribeButton").addEventListener("click", (e) => {
		e.preventDefault();
		var form = e.target.closest("form");
		if (form.checkValidity()) {
			makeCall("POST", "CreateUser", e.target.closest("form"), function(x) {
				if (x.readyState == XMLHttpRequest.DONE) {
					var message = x.responseText;
					switch (x.status) {
						case 200:
							sessionStorage.setItem("regSuccessful", "REGISTRATION SUCCESSFUL! You can now log in");
							window.location.href = "index.html";
							break;
						case 400: // bad request
							document.getElementById("genericErrors").textContent = message;
							break;
						case 406: // username already in use
							document.getElementById("chosenUsernameError").textContent = message;
							break;
						case 500: // server error SQL Exception
							document.getElementById("genericErrors").textContent = message;
							break;
						case 502: // server error
							alert(message);
							break;
					}
				}
			}, false);
		} else {
			form.reportValidity();
		}

	})

	//checks the validity of the email field
	document.querySelector("input[name='email']").addEventListener("blur", function() {
		var mail = this.value;
		
		if (!mail.includes(".") || !mail.includes("@")) {
			document.getElementById("emailError").textContent = "Email format is example@mail.com";
		} else {
			document.getElementById("emailError").textContent = "";
		}
	})
	
	//checks whether the password fields match
	document.querySelector("input[name='password2']").addEventListener("blur", function() {
		var pass1 = document.querySelector("input[name='password']").value;
		var pass2 = this.value;
		
		if (pass1 != pass2) {
			document.getElementById("passwordError").textContent = "Passwords do not match";
		} else {
			document.getElementById("passwordError").textContent = "";
		}
	})

	//loads homepage if user is already logged in
	window.onload = () => {
		var usrn = sessionStorage.getItem("username");
		if (usrn != null) {
			window.location.href = "Homepage.html";	
		}
	}

})();

    