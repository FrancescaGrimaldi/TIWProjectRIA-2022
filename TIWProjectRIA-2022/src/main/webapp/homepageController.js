/**
 * Homepage Management
 */

(function() { // avoid variables ending up in the global scope

	function printCreatedMeeting(meetings) {

		if (meetings == null || meetings.size() == 0) {   //check the variable type of meetings
			let text = document.createElement("h4");
			text.textContent = "You haven't created any meeting";
			document.getElementById('createdMeetingArea').appendChild(text);
			return;
		}

		var meetTable = document.createElement('table');
		var tr = document.createElement('tr');
		var tabFields = ['Title', 'Date', 'Time', 'Duration', 'Maximum number of partecipants'];

		for (var i = 0; i < tabFields.length; i++) {
			var th = document.createElement('th'); 			//column
			var text = document.createTextNode(array[i]); 	//column title
			th.appendChild(text);
			tr.appendChild(th);
		}
		meetTable.appendChild(tr);



		for (let meet of meetings.children) {   //da modificare con i tipi di variable giusto e lista giusta
			var tr = document.createElement('tr');

			var td1 = document.createElement('td');
			var td2 = document.createElement('td');
			var td3 = document.createElement('td');
			var td4 = document.createElement('td');
			var td5 = document.createElement('td');

			var title = document.createTextNode(meet.title);    	//da modificare con i tipi di variable giusto
			var date = document.createTextNode(meet.date);			//da modificare con i tipi di variable giusto
			var time = document.createTextNode(meet.time);			//da modificare con i tipi di variable giusto
			var duration = document.createTextNode(meet.duration);	//da modificare con i tipi di variable giusto
			var maxParts = document.createTextNode(meet.maxParts);	//da modificare con i tipi di variable giusto

			td1.appendChild(title);
			td2.appendChild(date);
			td3.appendChild(time);
			td4.appendChild(duration);
			td5.appendChild(maxParts);

			tr.appendChild(td1);
			tr.appendChild(td2);
			tr.appendChild(td3);
			tr.appendChild(td4);
			tr.appendChild(td5);

			table.appendChild(tr);
		}

		document.getElementById('createdMeetingArea').appendChild(meetTable);
	}


	function printInvitededMeeting(meetings) {

		if (meetings == null || meetings.size() == 0) {   //check the variable type of meetings
			let text = document.createElement("h4");
			text.textContent = "You haven't been invited to any meeting";
			document.getElementById('createdMeetingArea').appendChild(text);
			return;
		}

		var meetTable = document.createElement('table');
		var tr = document.createElement('tr');
		var tabFields = ['Title', 'Date', 'Time', 'Duration', 'Max partecipants', 'Creator'];

		for (var i = 0; i < tabFields.length; i++) {
			var th = document.createElement('th'); 			//column
			var text = document.createTextNode(array[i]); 	//column title
			th.appendChild(text);
			tr.appendChild(th);
		}
		meetTable.appendChild(tr);



		for (let meet of meetings.children) {   //da modificare con i tipi di variable giusto e lista giusta
			var tr = document.createElement('tr');

			var td1 = document.createElement('td');
			var td2 = document.createElement('td');
			var td3 = document.createElement('td');
			var td4 = document.createElement('td');
			var td5 = document.createElement('td');
			var td6 = document.createElement('td');

			var title = document.createTextNode(meet.title);    	//da modificare con i tipi di variable giusto
			var date = document.createTextNode(meet.date);			//da modificare con i tipi di variable giusto
			var time = document.createTextNode(meet.time);			//da modificare con i tipi di variable giusto
			var duration = document.createTextNode(meet.duration);	//da modificare con i tipi di variable giusto
			var maxParts = document.createTextNode(meet.maxParts);	//da modificare con i tipi di variable giusto
			var creator = document.createTextNode(meet.creator);	//da modificare con i tipi di variable giusto

			td1.appendChild(title);
			td2.appendChild(date);
			td3.appendChild(time);
			td4.appendChild(duration);
			td5.appendChild(maxParts);
			td6.appendChild(creator);

			tr.appendChild(td1);
			tr.appendChild(td2);
			tr.appendChild(td3);
			tr.appendChild(td4);
			tr.appendChild(td5);
			tr.appendChild(td6);

			table.appendChild(tr);
		}

		document.getElementById('invitedMeetingArea').appendChild(meetTable);
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


})();