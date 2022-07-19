/**
 * Subscription management
 */
(function() {
	document.getElementById("subscribeButton").addEventListener("click", (e) => {
		e.preventDefault();
		var form = e.target.closest("form");
		if (form.checkValidity()) {
			if (document.querySelector("input[name=password]").value == document.querySelector("input[name=password2]").value) {
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
								document.getElementById("error").textContent = message;
								break;
							case 502: // server error
								alert(message);
								break;
						}
					}
				}, false);
				document.getElementById("genericErrors").textContent = "";
			} else {
				document.getElementById("genericErrors").textContent = "Passwords have to match."
			}
		} else {
			form.reportValidity();
		}

	})

	document.querySelector("input[name='email']").addEventListener("blur", function(e) {
		var mail = this.value
		
		if (!mail.includes(".") || !mail.includes("@")) {
			document.getElementById("emailError").textContent = "Email format is example@mail.com."
		} else {
			document.getElementById("emailError").textContent = ""
		}
	})
	
	document.querySelector("input[name='password2']").addEventListener("blur", function(e) {
		var pass1 = document.querySelector("input[name='password']").value;
		var pass2 = this.value;
		
		if (pass1 != pass2) {
			document.getElementById("passwordError").textContent = "Password have to match."
		} else {
			document.getElementById("passwordError").textContent = ""
		}
	})

})();

    