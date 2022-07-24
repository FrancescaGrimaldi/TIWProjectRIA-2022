/**
 * Login management
 */
(function() { // avoid variables ending up in the global scope
    document.getElementById("loginbutton").addEventListener('click', (e) => {
        var form = e.target.closest("form");
        if (form.checkValidity()) {
            makeCall("POST", 'CheckLogin', e.target.closest("form"),
                function(req) {
                    if (req.readyState == XMLHttpRequest.DONE) {
                        var message = req.responseText;
                        switch (req.status) {
                            case 200:
                                sessionStorage.setItem("username", message); //mette username nella sessione
                                window.location.href = "Homepage.html";
                                break;
                            case 400: // bad request
                                document.getElementById("errorMsg").textContent = message;
                                break;
                            case 401: // unauthorized
                                document.getElementById("errorMsg").textContent = message;
                                break;
                            case 500: // server error
                                alert(message);
                                break;
                        }
                    }
                }
            );
        } else {
            form.reportValidity();
        }
    });

    
	window.onload = () => {
		//shows a message stating that the registration on the website was successful
		var reg = sessionStorage.getItem("regSuccessful");
		if (reg != null) {
			sessionStorage.removeItem("regSuccessful");
			document.getElementById("registration").textContent = reg;
		}
		
		//loads homepage if user is already logged in
		var usrn = sessionStorage.getItem("username");
		if (usrn != null) {
			window.location.href = "Homepage.html";	
		}
	}

})();