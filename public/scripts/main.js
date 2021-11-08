var rhit = rhit || {};

rhit.FB_COLLECTION_LOCATION = "locations";
rhit.FB_KEY_NAME = "name";
rhit.FB_KEY_TYPE = "type";
rhit.FB_KEY_STATE = "state";
rhit.FB_KEY_CUSTOM = "custom";
rhit.FB_KEY_VISITED = "visited";
rhit.FB_KEY_DATE_VISITED = "dateVisited";
rhit.FB_KEY_NOTE = "note";
rhit.FB_KEY_AUTHOR = "author";
rhit.fbLocationsManager = null;
rhit.fbSingleLocationManager = null;

rhit.FB_COLLECTION_USER = "users";
rhit.FB_KEY_UID = "uid";
rhit.FB_KEY_USERNAME = "username";
rhit.FB_KEY_LOCATIONS_VISITED = "locationsVisited";
rhit.FB_KEY_FRIEND_IDS = "friendIds";
rhit.fbUsersManager = null;
rhit.fbSingleUserManager = null;

rhit.fbAuthManager = null;

let statesArray = ["Alaska",
	"Alabama",
	"Arkansas",
	"American Samoa",
	"Arizona",
	"California",
	"Colorado",
	"Connecticut",
	"District of Columbia",
	"Delaware",
	"Florida",
	"Georgia",
	"Guam",
	"Hawaii",
	"Iowa",
	"Idaho",
	"Illinois",
	"Indiana",
	"Kansas",
	"Kentucky",
	"Louisiana",
	"Massachusetts",
	"Maryland",
	"Maine",
	"Michigan",
	"Minnesota",
	"Missouri",
	"Mississippi",
	"Montana",
	"North Carolina",
	" North Dakota",
	"Nebraska",
	"New Hampshire",
	"New Jersey",
	"New Mexico",
	"Nevada",
	"New York",
	"Ohio",
	"Oklahoma",
	"Oregon",
	"Pennsylvania",
	"Puerto Rico",
	"Rhode Island",
	"South Carolina",
	"South Dakota",
	"Tennessee",
	"Texas",
	"Utah",
	"Virginia",
	"Virgin Islands",
	"Vermont",
	"Washington",
	"Wisconsin",
	"West Virginia",
	"Wyoming"
];
let typesArray = ["National Park", "Art Museum", "Theater", "Amusement Park", "Historical Site", "Zoo"]

// From: https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

rhit.ChecklistController = class {
	constructor() {

		document.querySelector("#customTab").addEventListener("click", (event) => {
			window.location.href = `/checklist.html?uid=${uid}`;
		});

		//Start listening
		rhit.fbLocationsManager.beginListening(this.updateCheckList.bind(this));
	}

	updateCheckList() {

		//make a new quoteListContainer
		const newList = htmlToElement('<div id="locationContainer"></div>');

		//Fill qlc with quote cards using a loop
		for (let i = 0; i < rhit.fbLocationsManager.length; i++) {
			const mq = rhit.fbLocationsManager.getLocationAtIndex(i);
			const newCard = this._createCard(mq);

			newCard.onclick = (event) => {
				window.location.href = `/location.html?id=${mq.id}`;
			};
			newList.appendChild(newCard);
		}

	}

	_createCard(clLocation) {
		return htmlToElement(`<div class="form-check">
	  <input class="form-check-input" type="checkbox" value="" id=${clLocation.id}>
	  <label class="form-check-label" for=${clLocation.id}>
		${clLocation.name}
	  </label>
	</div>`)
	}
}

rhit.CatalogListController = class {
	constructor() {

		document.querySelector("#submitAddPlace").addEventListener("click", (event) => {
			const name = document.querySelector("#inputName").value;
			const state = statesArray[document.querySelector("#stateSelect").value - 1];
			const type = typesArray[document.querySelector("#typeSelect").value - 1];
			const dateVisited = document.querySelector("#inputDate").value;
			const notes = document.querySelector("#inputNotes").value;
			const custom = true;
			const visited = true;
			rhit.fbLocationsManager.add(name, state, type, dateVisited, notes, custom, visited);
			// rhit.fbUsersManager.
		});

		$("#addPlaceDialog").on("show.bs.modal", (event) => {
			// Pre animation
			document.querySelector("#inputName").value = "";
			document.querySelector("#stateSelect").value = "";
			document.querySelector("#typeSelect").value = "";
			document.querySelector("#inputDate").value = "";
			document.querySelector("#inputNotes").value = "";
		});
		$("#addPlaceDialog").on("shown.bs.modal", (event) => {
			// Post animation
			document.querySelector("#inputName").focus();
		});

		// Start Listening!
		rhit.fbLocationsManager.beginListening(this.updateList.bind(this));

	}

	updateList() {
		// TODO: updateList
		console.log("Updating catalog!");
		console.log(`Num locations = ${rhit.fbLocationsManager.length}`);
		console.log("Example quote = ", rhit.fbLocationsManager.getLocationAtIndex(0));

		// Make a new catalogPage container
		const newList = htmlToElement('<div id="catalogPage" class="container page-container"></div>');

		// Fill the catalogPage container with location cards using a loop
		for (let i = 0; i < rhit.fbLocationsManager.length; i++) {
			const loc = rhit.fbLocationsManager.getLocationAtIndex(i);
			const newCard = this._createCard(loc);

			newCard.onclick = (event) => {
				window.location.href = `/locationDetail.html?id=${loc.id}`;
			};
			newList.appendChild(newCard);
		}

		// Remove the old catalogPage container
		const oldList = document.querySelector("#catalogPage");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		// Put in the new catalogPage container
		oldList.parentElement.appendChild(newList);
	}

	_createCard(location) {
		return htmlToElement(`<div class="card">
        <div class="card-body">
          <h5 class="card-title">${location.name}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${location.state}</h6>
        </div>
      </div>`);
	}
}

rhit.Location = class {
	constructor(id, name, state, type, dateVisited, notes, custom, visited, author) {
		this.id = id;
		this.name = name;
		this.state = state;
		this.type = type;
		this.dateVisited = dateVisited;
		this.notes = notes;
		this.custom = custom;
		this.visited = visited;
		this.author = author;
	}
}

rhit.FbLocationsManager = class {
	// TODO: FbLocationsManager

	constructor(uid) {
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_LOCATION);
		this._unsubscribe = null;
	}

	// Add a new document with a generated id.
	add(name, state, type, dateVisited, note, custom, visited) {
		this._ref.add({
				[rhit.FB_KEY_NAME]: name,
				[rhit.FB_KEY_TYPE]: type,
				[rhit.FB_KEY_STATE]: state,
				[rhit.FB_KEY_DATE_VISITED]: dateVisited,
				[rhit.FB_KEY_NOTE]: note,
				[rhit.FB_KEY_CUSTOM]: custom,
				[rhit.FB_KEY_VISITED]: visited,
				// [rhit.FB_KEY_AUTHOR]: this.uid,
			})
			.then((docRef) => {
				console.log("Document written with ID: ", docRef.id);
			})
			.catch((error) => {
				console.error("Error adding document: ", error);
			});
	};

	beginListening(changeListener) {
		let query = this._ref.orderBy(rhit.FB_KEY_DATE_VISITED, "desc");
		if (this._uid) {
			query = query.where(rhit.FB_KEY_AUTHOR, "==", this._uid);
		}
		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			console.log("Location update!");
			this._documentSnapshots = querySnapshot.docs;
			changeListener();
		});
	}

	stopListening() {
		this._unsubscribe();
	}

	get length() {
		return this._documentSnapshots.length;
	}

	getLocationAtIndex(index) {
		const docSnapshot = this._documentSnapshots[index];
		const mq = new rhit.Location(docSnapshot.id,
			docSnapshot.get(rhit.FB_KEY_NAME),
			docSnapshot.get(rhit.FB_KEY_STATE),
			docSnapshot.get(rhit.FB_KEY_TYPE),
			docSnapshot.get(rhit.FB_KEY_DATE_VISITED),
			docSnapshot.get(rhit.FB_KEY_NOTE),
			docSnapshot.get(rhit.FB_KEY_CUSTOM),
			docSnapshot.get(rhit.FB_KEY_VISITED),
			docSnapshot.get(rhit.FB_KEY_AUTHOR),
		);
		return mq;
	}
}

rhit.FbSingleLocation = class {
	constructor(locationId) {
		this._documentSnapshot = {};
		this._unsubscribe = null;
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_LOCATION).doc(locationId);
	}
	beginListening(changeListener) {

		this._unsubscribe = this._ref.onSnapshot((doc) => {
			if (doc.exists) {
				console.log("Document data:", doc.data());
				this._documentSnapshot = doc;
				changeListener();
			} else {
				console.log("No such document!");
			}
		});
	}

	stopListening() {
		this._unsubscribe();
	}
	update(name, state, type, dateVisited, note) {
		this._ref.update({
				[rhit.FB_KEY_NAME]: name,
				[rhit.FB_KEY_TYPE]: type,
				[rhit.FB_KEY_STATE]: state,
				[rhit.FB_KEY_DATE_VISITED]: dateVisited,
				[rhit.FB_KEY_NOTE]: note,

			})
			.then(() => {
				console.log("Document successfully updated");
			})
			.catch((error) => {
				console.error("Error adding document: ", error);
			});
	}

	delete() {
		return this._ref.delete();
	}

	get name() {
		return this._documentSnapshot.get(rhit.FB_KEY_NAME);
	}
	get type() {
		return this._documentSnapshot.get(rhit.FB_KEY_TYPE);
	}
	get state() {
		return this._documentSnapshot.get(rhit.FB_KEY_STATE);
	}
	get dateVisited() {
		return this._documentSnapshot.get(rhit.FB_KEY_DATE_VISITED);
	}
	get author() {
		return this._documentSnapshot.get(rhit.FB_KEY_AUTHOR);
	}
}


rhit.User = class {
	constructor(uid, name, locationsVisited, friendIds) {
		this.uid = uid;
		this.username = name;
		this.locationsVisited = locationsVisited;
		this.friendIds = friendIds;
	}
}

rhit.FbUsersManager = class {
	// TODO: FbUsersManager

	constructor(uid) {
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_USER);
		this._unsubscribe = null;
	}

	// Add a new document with a generated id.
	add(uid, username, locationsVisited, friendIds) {
		this._ref.add({
				[rhit.FB_KEY_UID]: uid,
				[rhit.FB_KEY_USERNAME]: username,
				[rhit.FB_KEY_LOCATIONS_VISITED]: locationsVisited,
				[rhit.FB_KEY_FRIEND_IDS]: friendIds,
			})
			.then((docRef) => {
				console.log("Document written with ID: ", docRef.id);
			})
			.catch((error) => {
				console.error("Error adding document: ", error);
			});
	};

	beginListening(changeListener) {
		// let query = this._ref.orderBy(rhit.FB_KEY_DATE_VISITED, "desc");
		// if (this._uid) {
		// 	query = query.where(rhit.FB_KEY_AUTHOR, "==", this._uid);
		// }
		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			// console.log("Location update!");
			this._documentSnapshots = querySnapshot.docs;
			changeListener();
		});
	}

	stopListening() {
		this._unsubscribe();
	}

	get length() {
		return this._documentSnapshots.length;
	}

	getUserAtIndex(index) {
		const docSnapshot = this._documentSnapshots[index];
		const mq = new rhit.User(docSnapshot.id,
			docSnapshot.get(rhit.FB_KEY_UID),
			docSnapshot.get(rhit.FB_KEY_USERNAME),
			docSnapshot.get(rhit.FB_KEY_LOCATIONS_VISITED),
			docSnapshot.get(rhit.FB_KEY_FRIEND_IDS),
		);
		return mq;
	}
}

rhit.FbSingleUserManager = class {
	constructor(userId) {
		this._documentSnapshot = {};
		this._unsubscribe = null;
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_USER).doc(userId);
	}
	beginListening(changeListener) {

		this._unsubscribe = this._ref.onSnapshot((doc) => {
			if (doc.exists) {
				console.log("Document data:", doc.data());
				this._documentSnapshot = doc;
				changeListener();
			} else {
				console.log("No such document!");
			}
		});
	}

	stopListening() {
		this._unsubscribe();
	}
	update(name, locationsVisited, friendIds) {
		this._ref.update({
				[rhit.FB_KEY_USERNAME]: name,
				[rhit.FB_KEY_LOCATIONS_VISITED]: locationsVisited,
				[rhit.FB_KEY_FRIEND_IDS]: friendIds,

			})
			.then(() => {
				console.log("Document successfully updated");
			})
			.catch((error) => {
				console.error("Error adding document: ", error);
			});
	}

	delete() {
		return this._ref.delete();
	}

	get username() {
		return this._documentSnapshot.get(rhit.FB_KEY_USERNAME);
	}

	get locationsVisited() {
		return this._documentSnapshot.get(rhit.FB_KEY_LOCATIONS_VISITED);
	}

	get friendIds() {
		return this._documentSnapshot.get(rhit.FB_KEY_FRIEND_IDS);
	}

	get numFriends() {
		return this._documentSnapshot.get(rhit.FB_KEY_FRIEND_IDS).length;
	}
	get numVisited() {
		return this._documentSnapshot.get(rhit.FB_KEY_LOCATIONS_VISITED).length;
	}
}


// https://www.w3schools.com/howto/howto_js_sidenav.asp
/* Set the width of the side navigation to 250px */
function openNav() {
	document.getElementById("menuSidenav").style.width = "250px";
}

/* Set the width of the side navigation to 0 */
function closeNav() {
	document.getElementById("menuSidenav").style.width = "0";
}


/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");

	rhit.initializePage();
};


rhit.startFirebaseUI = function () {
	var uiConfig = {
		signInSuccessUrl: 'home.html',

		//Attempt to add users to collection
		// //https://stackoverflow.com/questions/54138770/firestore-how-to-add-user-document-to-collection-at-sign-in-with-firebaseui
		// callbacks: {
		// 	signInSuccessWithAuthResult: function(authResult, redirectUrl) {
		// 		const userUid       = authResult.user.uid;
		// 		const email         = authResult.user.email;
		// 		const displayName   = authResult.user.displayName;
		// 		const photoURL      = authResult.user.photoURL;
		// 		const lastLoginAt   = authResult.user.lastLoginAt;
		// 		const createdAt     = authResult.user.createdAt;
		// 		setUser(userUid, email, displayName, photoURL, lastLoginAt, createdAt);
		// 		return false;
		// 	},
		// },

		signInOptions: [
			firebase.auth.GoogleAuthProvider.PROVIDER_ID,
			firebase.auth.EmailAuthProvider.PROVIDER_ID,
			firebase.auth.PhoneAuthProvider.PROVIDER_ID,
			firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
		],
	};
	const ui = new firebaseui.auth.AuthUI(firebase.auth());
	ui.start('#firebaseui-auth-container', uiConfig);

	//Attempt to add users to collection
	// function setUser(userUid, email, displayName, photoURL, lastLoginAt, createdAt) {
	// 	const user = {
	// 		useruid         : userUid,
	// 		useremail       : email,
	// 		displayname : displayName,
	// 		photourl        : photoURL,
	// 		lastlogin       : lastLoginAt,
	// 		created         : createdAt,
	// 		locationsVisited: [],
	// 		friendIds: []
	// 	}
	// 	rhit.FB_COLLECTION_USER.doc(userUid).set(user);
	// }
}

rhit.initializePage = () => {
	const urlParams = new URLSearchParams(window.location.search);
	if (document.querySelector("#checklistPage")) {
		console.log("You are on the checklist page.");
		const uid = urlParams.get("uid");
		rhit.fbLocationsManager = new rhit.FbLocationsManager(uid);
		rhit.fbUsersManager = new rhit.FbUsersManager(uid);
		new rhit.ChecklistController();
	}
	if (document.querySelector("#catalogPage")) {
		console.log("You are on the checklist page.");
		const uid = urlParams.get("uid");
		rhit.fbLocationsManager = new rhit.FbLocationsManager(uid);
		rhit.fbUsersManager = new rhit.FbUsersManager(uid);
		new rhit.CatalogListController();
	}
	if (document.querySelector("#detailPage")) {
		console.log("You are on the detail page.");
		const locationId = urlParams.get("id");
		if (!locationId) {
			window.location.href = "/";
		}
		rhit.fbSingleLocationManager = new rhit.FbSingleLocationManager(locationId);
		new rhit.DetailPageController();
	}
	if (document.querySelector("#loginPage")) {
		console.log("You are on the login page.");
		new rhit.LoginPageController();
	}
};

rhit.DetailPageController = class {
	constructor() {

		document.querySelector("#submitEditLocation").addEventListener("click", (event) => {
			// console.log("You clicked submit");
			const name = document.querySelector("#inputName").value;
			const state = document.querySelector("#stateSelect").value;
			const type = document.querySelector("#typeSelect").value;
			const date = document.querySelector("#datePicker").value;
			const note = document.querySelector("#inputNotes").value;

			rhit.fbSingleLocationManager.update(name, type, state, date, note, true);
		});

		$("#editLocationDialog").on("show.bs.modal", (event) => {
			//Pre animation
			// console.log("dialog about to show up");
			document.querySelector("#inputName").value = rhit.fbSingleLocationManager.name;
			document.querySelector("#stateSelect").value = rhit.fbSingleLocationManager.state;
			document.querySelector("#typeSelect").value = rhit.fbSingleLocationManager.type;
			document.querySelector("#datePicker").value = rhit.fbSingleLocationManager.date;
			document.querySelector("#inputNotes").value = rhit.fbSingleLocationManager.notes;
		});

		$("#editLocationDialog").on("shown.bs.modal", (event) => {
			//Post animation
			// console.log("dialog is now visible");
			document.querySelector("#inputQuote").focus();
		});

		document.querySelector("#submitDeleteLocation").addEventListener("click", (event) => {
			rhit.fbSingleLocationManager.delete().then(function () {
				console.log("Document successfully deleted");
				window.location.href = "/catalog.html";
			}).catch(function (error) {
				console.log("Error adding document: ", error);
			});
		});

		rhit.fbSingleLocationManager.beginListening(this.updateView.bind(this));
	}
	updateView() {
		document.querySelector("#detailName").innerHTML = rhit.fbSingleLocationManager.name;
		document.querySelector("#detailState").innerHTML = rhit.fbSingleLocationManager.state;
		document.querySelector("#detailType").innerHTML = rhit.fbSingleLocationManager.type;
		document.querySelector("#detailDate").innerHTML = rhit.fbSingleLocationManager.date;
		document.querySelector("#detailNote").innerHTML = rhit.fbSingleLocationManager.notes;

		if (rhit.fbSingleUserManager.locationsVisited().includes(rhit.fbSingleLocationManager)) {
			document.querySelector("#menuEdit").style.display = "flex";
			document.querySelector("#menuDelete").style.display = "flex";
		}
	}
}

rhit.FbSingleLocationManager = class {
	constructor(locId) {
		this._documentSnapshot = {};
		this._unsubscribe = null;
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_LOCATION).doc(locId);
		//   console.log(`listening to ${this._ref.path}`);
	}
	beginListening(changeListener) {

		this._unsubscribe = this._ref.onSnapshot((doc) => {
			if (doc.exists) {
				console.log("Document data:", doc.data());
				this._documentSnapshot = doc;
				changeListener();
			} else {
				// doc.data() will be undefined in this case
				console.log("No such document!");
				//window.location.href = "/";
			}
		});
	}

	stopListening() {
		this._unsubscribe();
	}
	update(name, type, state, dateVisited, note, custom, visited) {
		this._ref.update({
				[rhit.FB_KEY_NAME]: name,
				[rhit.FB_KEY_TYPE]: type,
				[rhit.FB_KEY_STATE]: state,
				[rhit.FB_KEY_DATE_VISITED]: dateVisited,
				[rhit.FB_KEY_NOTE]: note,
				[rhit.FB_KEY_VISITED]: visited,
			})
			.then(() => {
				console.log("Document successfully updated");
			})
			.catch((error) => {
				console.error("Error adding document: ", error);
			});
	}

	delete() {
		return this._ref.delete();
	}

	get name() {
		return this._documentSnapshot.get(rhit.FB_KEY_NAME);
	}

	get state() {
		return this._documentSnapshot.get(rhit.FB_KEY_STATE);
	}

	get type() {
		return this._documentSnapshot.get(rhit.FB_KEY_TYPE);
	}

	get dateVisited() {
		return this._documentSnapshot.get(rhit.FB_KEY_DATE_VISITED);
	}

	get note() {
		return this._documentSnapshot.get(rhit.FB_KEY_NOTE);
	}

	get custom() {
		return this._documentSnapshot.get(rhit.FB_KEY_VISITED);
	}

	get visited() {
		return this._documentSnapshot.get(rhit.FB_KEY_VISITED);
	}

}


rhit.LoginPageController = class {
	constructor() {

		firebase.auth().onAuthStateChanged((user) => {
			if (user) {
				const displayName = user.displayName;
				const email = user.email;
				const photoURL = user.photoURL;
				const phoneNumber = user.phoneNumber;
				const isAnonymous = user.isAnonymous;
				const uid = user.uid;
				console.log("User is signed in ", uid);
				console.log('displayName :>> ', displayName);
				console.log('email :>> ', email);
				console.log('photoURL :>> ', photoURL);
				console.log('phoneNumber :>> ', phoneNumber);
				console.log('isAnonymous :>> ', isAnonymous);
				console.log('uid :>> ', uid);


				//Add user to user collection if not already included
				console.log("Check if user already exists.");
				if (!rhit.fbUsersManager.whereEqualTo("uid", uid)) {
					console.log("User has been added.");
					rhit.fbUsersManager.add(uid, [], []);
				} else {
					console.log("User already exists");
				}

			} else {
				console.log("There is no user signed in!");
			}
		});

		document.querySelector("#signOutButton").onclick = (event) => {
			console.log(`Sign out`);
			firebase.auth().signOut().then(function () {
				console.log("You are now signed out.");
			}).catch(function (error) {
				console.log("Sign out error.");
			});
			location.href = 'index.html'
		};
		rhit.startFirebaseUI();
	}
}


rhit.main();