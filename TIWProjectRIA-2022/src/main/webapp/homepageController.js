/**
 * Homepage Management
 */

(function() { // avoid variables ending up in the global scope

	let pageOrchestrator = new PageOrchestrator();

	window.addEventListener("load", () => {
		if (sessionStorage.getItem("username") == null) {
			window.location.href = "index.html";
		} else {
			pageOrchestrator.start(); // initialize the components
			pageOrchestrator.refresh();
		} // display initial content
	}, false);


	function WelcomeMessage(_username, messagecontainer) {
		this.username = _username;
		this.show = function() {
			messagecontainer.textContent = "Nice to see you again, " + this.username;
		}
	}

	function CreatedMeeting(_alert, _place) {
		this.alert = _alert;
		this.place = _place;

		this.reset = function() {
			this.place.style.visibility = "hidden";
		};

		this.show = function(next) {
			const self = this;
			makeCall("GET", "GetCreatedMeetings", null,
				function(req) {
					if (req.readyState == 4) {
						let message = req.responseText;
						if (req.status == 200) {
							var meetingsToShow = JSON.parse(req.responseText);
							if (meetingsToShow == null || meetingsToShow.length == 0) {   //check the variable type of meetings
								self.alert.textContent = "You haven't created any meeting";
								return;
							}
							
							self.alert.textContent = "";
							let meetTable = document.createElement("table");
							self.update(meetingsToShow, meetTable); // self visible by closure

							if (next) next();

						} else if (req.status == 403) {
							window.sessionStorage.removeItem("username");
						}
						else {
							self.alert.textContent = message;
						}
					}
				}
			);
		};

		this.update = function(_meetingsToShow, _meetTable) {
			this.meetingsToShow = _meetingsToShow;
			this.meetTable = _meetTable;

			let self = this;
			let tr = document.createElement("tr");
			let tabFields = ['Title', 'Date', 'Time', 'Duration', 'Maximum number of partecipants'];
			let th, text;
			let td1, td2, td3, td4, td5;

			this.place.innerHTML = "";

			for (var i = 0; i < tabFields.length; i++) {
				th = document.createElement("th"); 				//column
				text = document.createTextNode(tabFields[i]); 	//column title
				th.appendChild(text);
				tr.appendChild(th);
			}
			this.meetTable.appendChild(tr);


			this.meetingsToShow.forEach(function(meet) {		// 'this' is not visible here, 'self' is
				tr = document.createElement("tr");

				td1 = document.createElement("td");
				td2 = document.createElement("td");
				td3 = document.createElement("td");
				td4 = document.createElement("td");
				td5 = document.createElement("td");

				td1.textContent = meet.title;
				td2.textContent = meet.date;
				td3.textContent = meet.time;
				td4.textContent = meet.duration;
				td5.textContent = meet.maxPart;

				tr.appendChild(td1);
				tr.appendChild(td2);
				tr.appendChild(td3);
				tr.appendChild(td4);
				tr.appendChild(td5);

				self.meetTable.appendChild(tr);
			});

			this.place.appendChild(this.meetTable);
			this.place.style.visibility = "visible";
		}
	}


	function InvitedMeeting(_alert, _place) {
		this.alert = _alert;
		this.place = _place;

		this.reset = function() {
			this.place.style.visibility = "hidden";
		};

		this.show = function(next) {
			const self = this;
			makeCall("GET", "GetInvitedMeetings", null,
				function(req) {
					if (req.readyState == 4) {
						let message = req.responseText;
						if (req.status == 200) {
							var meetingsToShow = JSON.parse(req.responseText);
							if (meetingsToShow == null || meetingsToShow.length == 0) {
								self.alert.textContent = "You haven't been invited to any meeting";
								return;
							}
							
							self.alert.textContent = "";
							let meetTable = document.createElement("table");
							self.update(meetingsToShow, meetTable); // self visible by closure

							if (next) next();

						} else if (req.status == 403) {
							window.sessionStorage.removeItem("username");
						}
						else {
							self.alert.textContent = message;
						}
					}
				}
			);
		};

		this.update = function(_meetingsToShow, _meetTable) {
			this.meetingsToShow = _meetingsToShow;
			this.meetTable = _meetTable;

			let self = this;
			let tr = document.createElement("tr");
			let tabFields = ['Title', 'Date', 'Time', 'Duration', 'Max partecipants', 'Creator'];
			let th, text;
			let td1, td2, td3, td4, td5, td6;

			this.place.innerHTML = "";

			for (var i = 0; i < tabFields.length; i++) {
				th = document.createElement("th"); 				//column
				text = document.createTextNode(tabFields[i]); 	//column title
				th.appendChild(text);
				tr.appendChild(th);
			}
			this.meetTable.appendChild(tr);


			this.meetingsToShow.forEach(function(meet) {		// 'this' is not visible here, 'self' is
				tr = document.createElement("tr");

				td1 = document.createElement("td");
				td2 = document.createElement("td");
				td3 = document.createElement("td");
				td4 = document.createElement("td");
				td5 = document.createElement("td");
				td6 = document.createElement("td");

				td1.textContent = meet.title;
				td2.textContent = meet.date;
				td3.textContent = meet.time;
				td4.textContent = meet.duration;
				td5.textContent = meet.maxPart;
				td6.textContent = meet.creatorUsername;

				tr.appendChild(td1);
				tr.appendChild(td2);
				tr.appendChild(td3);
				tr.appendChild(td4);
				tr.appendChild(td5);
				tr.appendChild(td6);

				self.meetTable.appendChild(tr);
			})

			this.place.appendChild(this.meetTable);
			this.place.style.visibility = "visible";
		}
	}

	var rUsers;
	var sUsers;
	var attempt;
	var toDeselect;
	
	function RegisteredUsers(_alert, _place, _form) {
		this.alert = _alert;
		this.place = _place;
		this.form = _form;

		this.reset = function() {
			this.place.style.visibility = "hidden";
		};

		this.show = function(next) {

			const self = this;
			if (this.form.checkValidity()) {
				makeCall("POST", "GoToRecordsPage", this.form,
					function(req) {
						if (req.readyState == 4) {
							let message = req.responseText;
							if (req.status == 200) {
								rUsers = JSON.parse(req.responseText);
								sUsers = [];
								attempt = 1;
								toDeselect = 0;

								sessionStorage.setItem("attempt", attempt);

								if (rUsers == null || rUsers.length == 0) {
									self.alert.textContent = "Your contact list is empty";
									return;
								}

								let usersTable = document.createElement("table");
								self.update(rUsers, sUsers, attempt, toDeselect, usersTable); // self visible by closure

								modal_container.classList.add("show");

								if (next) next();

							} else if (req.status == 400) {
								document.getElementById("genericMeetingError").textContent = message;
							} else if (req.status == 401) {
								window.location.href = "index.html";
							} else if (req.status == 403) {
								window.sessionStorage.removeItem("username");
							}
							else {
								self.alert.textContent = message;
							}
						}
					}, false);
			} else {
				this.form.reportValidity();
			}
		};

		this.update = function(_rUsers, _sUsers, _attempt, _toDeselect, _usersTable) {
			this.usersTable = _usersTable;
			this.rUsers = _rUsers;
			this.sUsers = _sUsers;
			this.attempt = _attempt;
			this.toDeselect = _toDeselect;


			let self = this;
			let tr = document.createElement("tr");
			let tabFields = ['Invited', 'Username', 'Email', 'Name', 'Surname'];
			let th, text;
			let td1, td2, td3, td4, td5;

			this.place.innerHTML = "";

			for (var i = 0; i < tabFields.length; i++) {
				th = document.createElement("th"); 				//column
				text = document.createTextNode(tabFields[i]); 	//column title
				th.appendChild(text);
				tr.appendChild(th);
			}
			this.usersTable.appendChild(tr);

			this.rUsers.forEach(function(user) {		// 'this' is not visible here, 'self' is
				tr = document.createElement("tr");

				td1 = document.createElement("input");
				td2 = document.createElement("td");
				td3 = document.createElement("td");
				td4 = document.createElement("td");
				td5 = document.createElement("td");

				td1.type = "checkbox";
				td1.name = "id";
				td1.value = user.username;
				td1.checked = self.sUsers != null && self.sUsers.includes(user.username);


				td2.textContent = user.username;
				td3.textContent = user.email;
				td4.textContent = user.name;
				td5.textContent = user.surname;

				tr.appendChild(td1);
				tr.appendChild(td2);
				tr.appendChild(td3);
				tr.appendChild(td4);
				tr.appendChild(td5);

				self.usersTable.appendChild(tr);
			})

			this.place.appendChild(this.usersTable);
			this.place.style.visibility = "visible";
		}
	}

	function setMinDate(_place) {
		this.place = _place;

		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth() + 1; //January is 0
		var yyyy = today.getFullYear();
		if (dd < 10) {
			dd = '0' + dd
		}

		if (mm < 10) {
			mm = '0' + mm
		}

		today = yyyy + '-' + mm + '-' + dd;
		this.place.setAttribute("min", today);
	}
	document.querySelector("input[name='date']").addEventListener("blur", setMinDate(document.getElementById("datefield")));

	const inviteButton = document.getElementById("inviteButton");
	const cancelButton = document.getElementById("cancelButton");
	const submitButton = document.getElementById("createMeetingButton");
	const modal_container = document.getElementById("modal-container");
	
	var registeredUsers;
	
	submitButton.addEventListener('click', (e) => {
		e.preventDefault();
		var form = e.target.closest("form");

		registeredUsers = new RegisteredUsers(
			document.getElementById("errorUsersArea"),
			document.getElementById("usersArea"),
			form);
		registeredUsers.show();

	});

	inviteButton.addEventListener('click', (e) => {
		e.preventDefault();
			var form = e.target.closest("form");
			if (form.checkValidity()) {
				makeCall("POST", "InviteToMeeting", e.target.closest("form"), function(req) {
					if (req.readyState == XMLHttpRequest.DONE) {
						var message = req.responseText;
						switch (req.status) {
							case 200:
								backToHomepage();
								createdMeeting.show();
								invitedMeeting.show();
								break;
								
							case 202:
								sUsers = JSON.parse(req.responseText);
								
								attempt = sessionStorage.getItem("attempt");
								attempt++;
								var maxPart = document.getElementById("maxPart").value;
								
								if (sUsers.length != 0) {
									toDeselect = sUsers.length - maxPart;
								}
								
								sessionStorage.setItem("attempt", attempt);
								
								if (attempt == 2 && sUsers.length != 0) {
									document.getElementById("errorUsersArea").textContent =
									("This is your attempt number " + attempt + ". You need to de-select " + toDeselect + " user(s)");
								
								} else if (attempt == 2){
									document.getElementById("errorUsersArea").textContent =	("This is your attempt number " + attempt);
								
								} else if (attempt == 3 && sUsers.length != 0) {
									document.getElementById("errorUsersArea").textContent =
										("This is your attempt number " + attempt +
										 ". You need to de-select " + toDeselect + " user(s)" +
										 ". Be careful because this is the last one!");
								
								} else if (attempt == 3) {
									document.getElementById("errorUsersArea").textContent =
										("This is your attempt number " + attempt +
										 ". Be careful because this is the last one!");
								}
										 
								registeredUsers.update(rUsers, sUsers, attempt, toDeselect, usersTable);
								break;
								
							case 400: // bad request
								alert("Too many attempts to create a meeting with the wrong number of participants! " +
									  "It won't be created. You will be redirected to the Homepage");
								backToHomepage();
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
	});
	
	cancelButton.addEventListener('click', (e) => {
		e.preventDefault();
		backToHomepage();
	});
	
	function backToHomepage() {
		attempt = 0;
		document.getElementById("errorUsersArea").textContent = "";
		sessionStorage.removeItem("attempt");
		
		let inputs = document.querySelectorAll("input");
		inputs.forEach((input) => (input.value = ""));
		
		modal_container.classList.remove("show");
	}

	var createdMeeting;
	var invitedMeeting;
	
	function PageOrchestrator() {

		this.start = function() {

			// init welcome message
			let welcomeMessage = new WelcomeMessage(sessionStorage.getItem("username"), document.getElementById("welcomeMessage"));
			welcomeMessage.show();

			// handles logout
			document.getElementById("logoutButton").addEventListener('click', () => {
				window.sessionStorage.removeItem("username");
			})

			// init created meeting table
			createdMeeting = new CreatedMeeting(
				document.getElementById("voidCMeetingArea"),
				document.getElementById("createdMeetingArea")
			);
			createdMeeting.show();

			// init invited meeting table
			invitedMeeting = new InvitedMeeting(
				document.getElementById("voidIMeetingArea"),
				document.getElementById("invitedMeetingArea")
			);
			invitedMeeting.show();
			
		};

		this.refresh = function() {
			document.getElementById("genericMeetingError").textContent = "";
			createdMeeting.reset();
			invitedMeeting.reset();

		};
	}

})();