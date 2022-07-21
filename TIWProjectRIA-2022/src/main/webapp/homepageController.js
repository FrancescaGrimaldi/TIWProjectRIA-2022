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
			messagecontainer.textContent = this.username;
		}
	}

	function CreatedMeeting(_alert, _place) {
		this.alert = _alert;
		this.place = _place;

		this.reset = function() {
			this.place.style.display = "none";
		};

		this.show = function(next) {
			const self = this;
			makeCall("GET", "GetCreatedMeetings", null,
				function(req) {
					if (req.readyState == 4) {
						let message = req.responseText;
						if (req.status == 200) {
							var meetingsToShow = JSON.parse(req.responseText);
							if (meetings == null || meetings.size() == 0) {   //check the variable type of meetings
								//let text = document.createElement("h4");
								place.textContent = "You haven't created any meeting";
								//place.appendChild(text);
								return;
							}
							let meetTable = document.createElement('table');
							meetTable.border = "1px soldid black";
							self.update(meetingsToShow, meetTable); // self visible by closure

						} else if (req.status == 403) {
							window.sessionStorage.removeItem('user');
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
			let tr = document.createElement('tr');
			let tabFields = ['Title', 'Date', 'Time', 'Duration', 'Maximum number of partecipants'];
			let th, text;
			let td1, td2, td3, td4, td5;
			//let title, date, time, duration, maxParts;

			for (var i = 0; i < tabFields.length; i++) {
				th = document.createElement('th'); 			//column
				text = document.createTextNode(array[i]); 	//column title
				th.appendChild(text);
				tr.appendChild(th);
			}
			meetTable.appendChild(tr);


			meetingsToShow.forEach(function(meet) {		// 'this' is not visible here, 'self' is
				tr = document.createElement('tr');

				td1 = document.createElement('td');
				td2 = document.createElement('td');
				td3 = document.createElement('td');
				td4 = document.createElement('td');
				td5 = document.createElement('td');

				/*title = document.createTextNode(meet.title);    	//da modificare con i tipi di variable giusto
				date = document.createTextNode(meet.date);			//da modificare con i tipi di variable giusto
				time = document.createTextNode(meet.time);			//da modificare con i tipi di variable giusto
				duration = document.createTextNode(meet.duration);	//da modificare con i tipi di variable giusto
				maxParts = document.createTextNode(meet.maxParts);	//da modificare con i tipi di variable giusto*/

				td1.textContent = meet.title;    	//da modificare con i tipi di variable giusto??
				td2.textContent = meet.date;
				td3.textContent = meet.time;
				td4.textContent = meet.duration;
				td5.textContent = meet.maxParts;

				tr.appendChild(td1);
				tr.appendChild(td2);
				tr.appendChild(td3);
				tr.appendChild(td4);
				tr.appendChild(td5);

				table.appendChild(tr);
			})

			place.appendChild(meetTable);
		}
	}





	function InvitedMeeting(_alert, _place) {
		this.alert = _alert;
		this.place = _place;

		this.reset = function() {
			this.place.style.display = "none";
		};

		this.show = function(next) {
			const self = this;
			makeCall("GET", "GetInvitedMeetings", null,
				function(req) {
					if (req.readyState == 4) {
						let message = req.responseText;
						if (req.status == 200) {
							var meetingsToShow = JSON.parse(req.responseText);
							if (meetings == null || meetings.size() == 0) {   //check the variable type of meetings
								//let text = document.createElement("h4");
								place.textContent = "You haven't been invited to any meeting";
								//place.appendChild(text);
								return;
							}
							let meetTable = document.createElement('table');
							meetTable.border = "1px soldid black";
							self.update(meetingsToShow, meetTable); // self visible by closure

						} else if (req.status == 403) {
							window.sessionStorage.removeItem('user');
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
			let tr = document.createElement('tr');
			let tabFields = ['Title', 'Date', 'Time', 'Duration', 'Max partecipants', 'Creator'];
			let th, text;
			let td1, td2, td3, td4, td5, td6;
			//let title, date, time, duration, maxParts;

			for (var i = 0; i < tabFields.length; i++) {
				th = document.createElement('th'); 			//column
				text = document.createTextNode(array[i]); 	//column title
				th.appendChild(text);
				tr.appendChild(th);
			}
			meetTable.appendChild(tr);


			meetingsToShow.forEach(function(meet) {		// 'this' is not visible here, 'self' is
				tr = document.createElement('tr');

				td1 = document.createElement('td');
				td2 = document.createElement('td');
				td3 = document.createElement('td');
				td4 = document.createElement('td');
				td5 = document.createElement('td');
				td6 = document.createElement('td');

				/*title = document.createTextNode(meet.title);    	//da modificare con i tipi di variable giusto
				date = document.createTextNode(meet.date);			//da modificare con i tipi di variable giusto
				time = document.createTextNode(meet.time);			//da modificare con i tipi di variable giusto
				duration = document.createTextNode(meet.duration);	//da modificare con i tipi di variable giusto
				maxParts = document.createTextNode(meet.maxParts);	//da modificare con i tipi di variable giusto
				creator = document.createTextNode(meet.creator);	//da modificare con i tipi di variable giusto*/

				td1.textContent = meet.title;    	//da modificare con i tipi di variable giusto??
				td2.textContent = meet.date;
				td3.textContent = meet.time;
				td4.textContent = meet.duration;
				td5.textContent = meet.maxParts;
				td6.textContent = meet.creator;

				tr.appendChild(td1);
				tr.appendChild(td2);
				tr.appendChild(td3);
				tr.appendChild(td4);
				tr.appendChild(td5);
				tr.appendChild(td6);

				table.appendChild(tr);
			})

			place.appendChild(meetTable);
		}
	}

	function minDate() {
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
		document.getElementById("datefield").setAttribute("min", today);
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
			createdMeeting = new CreatedMeeting(
				document.getElementById("genericMeetingError"),
				document.getElementById("createdMeetingArea")
			);

			// init invited meeting table
			invitedMeeting = new InvitedMeeting(
				document.getElementById("genericMeetingError"),
				document.getElementById("invitedMeetingArea")
			);

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
			documentHandler.reset();
			folderTree.show(false);
			wizard.reset();
		};
	}

})();