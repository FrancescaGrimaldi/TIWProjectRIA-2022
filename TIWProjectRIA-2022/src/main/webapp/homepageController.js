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
			messagecontainer.textContent = "Welcome back, " + this.username;
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

							let meetTable = document.createElement("table");
							meetTable.border = "1px soldid black";
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
				th = document.createElement("th"); 			//column
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
							if (meetingsToShow == null || meetingsToShow.length == 0) {   //check the variable type of meetings
								self.alert.textContent = "You haven't been invited to any meeting";
								return;
							}

							let meetTable = document.createElement("table");
							meetTable.border = "1px soldid black";
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
								var rUsers = JSON.parse(req.responseText);
								var sUsers = [];
								var attempt = 1;
								var toDeselect = 0;

								sessionStorage.setItem("attempt", attempt);

								if (rUsers == null || rUsers.length == 0) {   //check the variable type of meetings
									self.alert.textContent = "Your contact list is empty";
									return;
								}

								let usersTable = document.createElement("table");
								usersTable.border = "1px soldid black";
								self.update(rUsers, sUsers, attempt, toDeselect, usersTable); // self visible by closure

								openModal(document.querySelector(button.dataset.modalTarget));

								if (next) next();

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
			
			/*if (this.toDeselect == 0)
				document.getElementById("errorUsersArea").textContext("This is your attempt number " + this.attempt);
			if (this.toDeselect > 0)
				document.getElementById("errorUsersArea").textContext("This is your attempt number " + this.attempt +
					". You need to deselect at least " + this.toDeselect + " people.");*/

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


	const openModalButtons = document.querySelectorAll('[data-modal-target]');
	const cancelModalButtons = document.querySelectorAll('[data-cancel-button]');
	const submitModalButtons = document.querySelectorAll('[data-submit-button]');
	const overlay = document.getElementById('overlay');
	
	document.getElementById("createMeetingButton").addEventListener('click', (e) => {
		e.preventDefault();
		var form = e.target.closest("form");

		var registeredUsers = new RegisteredUsers(
			document.getElementById("errorUsersArea"),
			document.getElementById("usersArea"),
			form);
		registeredUsers.show();
	});

	/*openModalButtons.forEach(button => {
		button.addEventListener('click', (e) => {
			// e.preventDefault();
			var form = e.target.closest("form");
			//document.write("	sto aggiungendo il listener su submit1 meeting");

			var registeredUsers = new RegisteredUsers(
				document.getElementById("errorUsersArea"),
				document.getElementById("usersArea"),
				form);
			registeredUsers.show();
		})
	})*/
	
	document.getElementById("inviteButton").addEventListener('click', (e) => {
		e.preventDefault();
			var form = e.target.closest("form");
			if (form.checkValidity()) {
				makeCall("POST", "InvitePeople", e.target.closest("form"), function(req) {
					if (req.readyState == XMLHttpRequest.DONE) {
						var message = req.responseText;
						switch (req.status) {
							case 200:
								document.write("Sono nel case 200 di invite ppl")
								sessionStorage.removeItem("attempt");
								closeModal(button.closest('.modal'));
								
								createdMeeting.show();
								invitedMeeting.show();
								break;
								
							case 202:
								document.write("Sono nel case 202 di invite ppl")
								document.write("rusers =" + rUsers)
								//rUsers = JSON.parse(req.responseText.rUsersJson);
								sUsers = JSON.parse(req.responseText.sUsersJson);
								document.write("\nsusers = " + sUsers)
								//attempt = JSON.parse(req.responseText.attemptJson);
								attempt = session.getAttribute("attempt") + 1;
								toDeselect = sUsers.length - form.elements['maxPart'];
								
								sessionStorage.setItem("attempt", attempt);
								registeredUsers.update(rUsers, sUsers, attempt, toDeselect, usersTable);
								break;
								
							case 400: // bad request
								sessionStorage.removeItem("attempt");
								closeModal(button.closest('.modal'));
								break;
								
							case 502: // server error
								alert(message);
								closeModal(button.closest('.modal'));
								break;
						}
					}
				}, false);
			} else {
				form.reportValidity();
			}
	});

	/*submitModalButtons.forEach(button => {
		button.addEventListener('click', (e) => {
			e.preventDefault();
			var form = e.target.closest("form");
			if (form.checkValidity()) {
				makeCall("POST", "InvitePeople", e.target.closest("form"), function(req) {
					if (req.readyState == XMLHttpRequest.DONE) {
						var message = req.responseText;
						switch (req.status) {
							case 200:
								sessionStorage.removeItem("attempt");
								closeModal(button.closest('.modal'));
								
								createdMeeting.show();
								invitedMeeting.show();
								break;
								
							case 202:
								rUsers = JSON.parse(req.responseText.rUsersJson);
								sUsers = JSON.parse(req.responseText.sUsersJson);
								attempt = JSON.parse(req.responseText.attemptJson);
								toDeselect = JSON.parse(req.responseText.toDeselectJson);
								
								sessionStorage.setItem("attempt", attempt);
								registeredUsers.update(rUsers, sUsers, attempt, toDeselect, usersTable);
								break;
								
							case 400: // bad request
								sessionStorage.removeItem("attempt");
								closeModal(button.closest('.modal'));
								break;
								
							case 502: // server error
								alert(message);
								closeModal(button.closest('.modal'));
								break;
						}
					}
				}, false);
			} else {
				form.reportValidity();
			}
		})
	})*/
	
	document.getElementById("cancelButton").addEventListener('click', (e) => {
		const modal = button.closest('.modal');
			//svuota tutto e poi
			closeModal(modal);
	});
	
	

	/*cancelModalButtons.forEach(button => {
		button.addEventListener('click', (e) => {
			const modal = button.closest('.modal');
			//svuota tutto e poi
			closeModal(modal);
		})
	})*/


	function openModal(modal) {
		if (modal == null) return;

		modal.classList.add('active');
		overlay.classList.add('active');
	}

	function closeModal(modal) {
		if (modal == null) return;

		modal.classList.remove('active');
		overlay.classList.remove('active');
	}


	function PageOrchestrator() {

		this.start = function() {

			// init welcome message
			welcomeMessage = new WelcomeMessage(sessionStorage.getItem("username"), document.getElementById("welcomeMessage"));
			welcomeMessage.show();

			// handles logout
			document.getElementById("logoutButton").addEventListener('click', () => {
				window.sessionStorage.removeItem("username");
			})

			// init created meeting table
			var createdMeeting = new CreatedMeeting(
				document.getElementById("voidCMeetingArea"),
				document.getElementById("createdMeetingArea")
			);
			createdMeeting.show();

			// init invited meeting table
			var invitedMeeting = new InvitedMeeting(
				document.getElementById("voidIMeetingArea"),
				document.getElementById("invitedMeetingArea")
			);
			invitedMeeting.show();

			//↓ ↓ ↓ ↓ ↓ ↓ ↓   TO ADAPT OR DELETE   ↓ ↓ ↓ ↓ ↓ ↓ ↓
			/* register folder_form wizard
			wizard = new Wizard(document.getElementById("create-content"));
			*/
		};

		this.refresh = function() {
			document.getElementById("genericMeetingError").textContent = "";
			createdMeeting.reset();
			invitedMeeting.reset();

			//↓ ↓ ↓ ↓ ↓ ↓ ↓   TO ADAPT OR DELETE   ↓ ↓ ↓ ↓ ↓ ↓ ↓
			/*documentHandler.reset();
			folderTree.show(false);
			wizard.reset();*/
		};
	}

})();