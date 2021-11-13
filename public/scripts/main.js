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

rhit.FB_COLLECTION_USERS = "users";
rhit.FB_KEY_DISPLAY_NAME = "displayName";
rhit.FB_KEY_EMAIL = "email";
rhit.FB_KEY_PHOTO_URL = "photoURL";
rhit.FB_KEY_PHONE_NUMBER = "phoneNumber";
rhit.FB_KEY_LOCATIONS_VISITED = "locationsVisited";
rhit.fbAuthManager = null;
rhit.fbUserManager = null;

let statesArray = ["Alabama",
	"Alaska",
	"Arizona",
	"Arkansas",
	"California",
	"Colorado",
	"Connecticut",
	"District of Columbia",
	"Delaware",
	"Florida",
	"Georgia",
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
	"North Dakota",
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
	"Vermont",
	"Washington",
	"Wisconsin",
	"West Virginia",
	"Wyoming"
];

let typesArray = ["National Park", "Art Museum", "Theater", "Amusement Park", "Historical Site", "Zoo"]

rhit.MapController = class {
	constructor() {
		this._collectionRef = firebase.firestore().collection(rhit.FB_COLLECTION_USERS);

		for (let i = 0; i < statesArray.length; i++) {
			this.updateState(statesArray[i],
				0,
				0,
				0,
				0,
				0,
				0);
		}

		// Map code modified from: https://leafletjs.com/examples/choropleth/
		var mapboxAccessToken = "pk.eyJ1Ijoia3V6bmljbWQiLCJhIjoiY2t2dmx5cWZ5NWxieDJ3bnVla2JkbnF4cSJ9.qlqp_DTAzUDWonUGTdf-5A";
		var map = L.map('map').setView([37.8, -96], 4);

		L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + mapboxAccessToken, {
			id: 'mapbox/light-v9',
			attribution: 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
			tileSize: 512,
			zoomOffset: -1
		}).addTo(map);

		L.geoJson(statesData).addTo(map);

		function getColor(d) {
			return d == 1 ? '#000000' :
				d > 0.9 ? '#012940' :
				d > 0.8 ? '#023858' :
				d > 0.7 ? '#045a8d' :
				d > 0.6 ? '#0570b0' :
				d > 0.5 ? '#3690c0' :
				d > 0.4 ? '#74a9cf' :
				d > 0.3 ? '#a6bddb' :
				d > 0.2 ? '#d0d1e6' :
				d > 0.1 ? '#ece7f2' :
				d > 0 ? '#fff7fb' :
				'#ffffff';
		}

		function style(feature) {
			// const userReference = firebase.firestore().collection(rhit.FB_COLLECTION_USERS).doc(rhit.fbAuthManager.uid);
			// const dataRef = userReference.collection("states").doc(feature).get(type);
			const urlParams = new URLSearchParams(window.location.search);
			const type = urlParams.get("type");
			let color;

			switch (type) {
				case "NationalPark":
					color = getColor(feature.properties.nPark);
				case "ArtMuseum":
					color = getColor(feature.properties.aMuseum);
				case "AmusementPark":
					color = getColor(feature.properties.aPark);
				case "Theater":
					color = getColor(feature.properties.theater);
				case "Zoo":
					color = getColor(feature.properties.zoo);
				default:
					color = getColor(feature.properties.allType);
			}

			return {
				fillColor: color,
				weight: 2,
				opacity: 1,
				color: 'white',
				dashArray: '3',
				fillOpacity: 0.5
			};
		}

		L.geoJson(statesData, {
			style: style
		}).addTo(map);

		function highlightFeature(e) {
			var layer = e.target;

			layer.setStyle({
				weight: 5,
				color: '#666',
				dashArray: '',
				fillOpacity: 0.7
			});

			if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
				layer.bringToFront();
			}

			info.update(layer.feature.properties);
		}

		function resetHighlight(e) {
			geojson.resetStyle(e.target);
			info.update();
		}

		var geojson;

		function zoomToFeature(e) {
			map.fitBounds(e.target.getBounds());
		}

		function onEachFeature(feature, layer) {
			layer.on({
				mouseover: highlightFeature,
				mouseout: resetHighlight,
				click: zoomToFeature
			});
		}

		geojson = L.geoJson(statesData, {
			style: style,
			onEachFeature: onEachFeature
		}).addTo(map);

		var info = L.control();

		info.onAdd = function (map) {
			this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
			this.update();
			return this._div;
		};

		// method that we will use to update the control based on feature properties passed
		info.update = function (props) {
			this._div.innerHTML = '<h4>US Locations Visited</h4>' + (props ?
				'<b>' + props.name + '</b><br />' + this.getData(props) + '% of ' + this.getType() + ' visited' :
				'Hover over a state');
		};

		info.getData = function (props) {
			const urlParams = new URLSearchParams(window.location.search);
			const type = urlParams.get("type");
			let data;

			switch (type) {
				case "NationalPark":
					return (props.nPark) * 100;
				case "ArtMuseum":
					return (props.aMuseum) * 100;
				case "AmusementPark":
					return (props.aPark) * 100;
				case "Theater":
					return (props.theater) * 100;
				case "Zoo":
					return (props.zoo) * 100;
				default:
					return (props.allType) * 100;
			}
		}


		info.getType = function () {
			const urlParams = new URLSearchParams(window.location.search);
			const type = urlParams.get("type");

			switch (type) {
				case "NationalPark":
					return "National Parks";
				case "ArtMuseum":
					return "Art Museums";
				case "AmusementPark":
					return "Amusement Parks";
				case "Theater":
					return "Theaters";
				case "Zoo":
					return "Zoos"
				default:
					return "all locations";
			}
		}

		info.addTo(map);

		var legend = L.control({
			position: 'bottomright'
		});

		legend.onAdd = function (map) {

			var div = L.DomUtil.create('div', 'info legend'),
				grades = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
				labels = ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"];

			// loop through our density intervals and generate a label with a colored square for each interval
			for (var i = 0; i < grades.length; i++) {
				div.innerHTML +=
					'<i style="background:' + getColor(grades[i]) + '"></i> ' +
					labels[i] + (labels[i + 1] ? '&ndash;' + labels[i + 1] + '<br>' : "");
			}

			return div;
		};

		legend.addTo(map);
	}

	updateState(state, allType, nationalpark, artmuseum, amusementpark, theater, zoo) {
		const stateRef = this._collectionRef.doc(rhit.fbAuthManager.uid).collection("states").doc(state);

		stateRef.set({
			"allType": allType,
			"nationalpark": nationalpark,
			"artmuseum": artmuseum,
			"amusementpark": amusementpark,
			"theater": theater,
			"zoo": zoo,
		});

		for (let i = 0; i < statesData.features.length; i++) {
			for (let j = 0; j < statesData.length; j++) {
				if (statesData.features[i].properties.name === stateTotals[j].name) {
					statesData.features[i].properties.allType = allType / stateTotals[j].allType;
					statesData.features[i].properties.nPark = nationalpark / stateTotals[j].nPark;
					statesData.features[i].properties.aMuseum = artmuseum / stateTotals[j].aMuseum;
					statesData.features[i].properties.aPark = amusementpark / stateTotals[j].aPark;
					statesData.features[i].properties.theater = theater / stateTotals[j].theater;
					statesData.features[i].properties.zoo = zoo / stateTotals[j].zoo;
				}
			}
		}
	}
}


// From: https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

rhit.ChecklistController = class {
	constructor() {
		document.querySelector("#showNationalParks").addEventListener("click", (event) => {
			window.location.href = `/list.html?type=NationalPark`;
		});

		document.querySelector("#showArtMuseums").addEventListener("click", (event) => {
			window.location.href = `/list.html?type=ArtMuseum`;
		});

		document.querySelector("#showAmusementParks").addEventListener("click", (event) => {
			window.location.href = `/list.html?type=AmusementPark`;
		});

		document.querySelector("#showTheaters").addEventListener("click", (event) => {
			window.location.href = `/list.html?type=Theater`;
		});

		document.querySelector("#showZoos").addEventListener("click", (event) => {
			window.location.href = `/list.html?type=Zoo`;
		});

		document.querySelector("#customTab").addEventListener("click", (event) => {
			window.location.href = `/checklist.html?uid=${uid}`;
		});

		//Start listening
		rhit.fbLocationsManager.beginListening(this.updateCheckList.bind(this));
	}

	updateCheckList() {

		// Update Progress Bar
		// https://www.w3schools.com/howto/howto_js_progressbar.asp
		var bar = document.getElementById("barChecklist");
		var userProg = 100; //number of locations of the selected type the user has in their visitedLocations array
		var totalLocations = 10; //number of locations of the selected type in the location collection
		var width = userProg / totalLocations;
		bar.style.width = width + "%";
		bar.innerHTML = width + "%";


		//make a new accordion
		const testlist = htmlToElement('<div class="accordion" id="accordionExample"></div>');

		//Fill accordion with state cards using a loop
		for (let i = 0; i < statesArray.length; i++) {
			const newAccordion = this._createAccordion(statesArray[i], i);
			testlist.appendChild(newAccordion);
		}

		const oldList = document.querySelector("#accordionExample");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		oldList.parentElement.appendChild(testlist);

		//make a new locationContainers with a loop
		let newLists = [];
		for (let i = 0; i < statesArray.length; i++) {
			newLists[i] = htmlToElement(`<div id="locationContainer${i}"></div>`);
		}

		const urlParams = new URLSearchParams(window.location.search);
		let type = urlParams.get("type");

		switch (type) {
			case "NationalPark":
				break;
			case "ArtMuseum":
				break;
			case "AmusementPark":
				break;
			case "Theater":
				break;
			case "Zoo":
				break;
			default:
				type = "allType";
		}

		console.log(type);

		//Fill locationContainer with location checks using a loop
		for (let i = 0; i < statesArray.length; i++) {
			for (let j = 0; j < rhit.fbLocationsManager.length; j++) {
				const loc = rhit.fbLocationsManager.getLocationAtIndex(j);
				console.log("HERE", loc.custom);
				if (loc.state == statesArray[i] && !loc.custom) {
					console.log(loc.name);
					if (type == "allType") {
						const newCheck = this._createCheck(loc);
						newLists[i].appendChild(newCheck);
					} else {
						if (loc.type == type) {
							const newCheck = this._createCheck(loc);
							newLists[i].appendChild(newCheck);
						}
					}
				}
			}
		}

		const oldLists = [];
		for (let i = 0; i < statesArray.length; i++) {
			oldLists[i] = document.querySelector(`#locationContainer${i}`);
			oldLists[i].removeAttribute("id");
			oldLists[i].hidden = true;
			oldLists[i].parentElement.appendChild(newLists[i]);
		}

		// for (let i = 0; i < rhit.fbLocationsManager.type(type).length; i++) {
		// 	const mq = rhit.fbLocationsManager.getLocationAtIndex(i);
		// 	const newCard = this._createCard(mq);

		// 	newCard.onclick = (event) => {
		// 		window.location.href = `/location.html?id=${mq.id}`;
		// 	};
		// 	newList.appendChild(newCard);
		// }

	}

	_createAccordion(state, id) {
		return htmlToElement(`
		<div class="card">
			<div class="card-header" id="${state}Accordion">
				<h2 class="mb-0">
					<button class="btn btn-link btn-block text-left show" type="button" data-toggle="collapse" data-target="#collapse${id}" aria-expanded="true" aria-controls="collapse${id}">
						${state}
					</button>
				</h2>
			</div>
			<div id="collapse${id}" class="collapse" aria-labelledby="${state}Accordion" data-parent="#accordionExample">
				<div class="card-body" id="locationContainer${id}">
				</div>            
			</div>
      	</div>
		`);
	}

	_createCheck(clLocation) {
		return htmlToElement(`
			<div class="form-check">
				<label class="form-check-label" for=${clLocation.id}>
					<input class="form-check-input" type="checkbox" value="" id="${clLocation.id}">${clLocation.name}
				</label>
			</div>
		`)
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
			const author = rhit.fbAuthManager.uid;
			rhit.fbLocationsManager.add(name, state, type, dateVisited, notes, custom, visited, author);
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

		// Fills from location collection
		for (let i = 0; i < rhit.fbLocationsManager.length; i++) {
			const loc = rhit.fbLocationsManager.getLocationAtIndex(i);
			const newCard = this._createCard(loc);

		//Fills from user's visited locations
		// console.log(rhit.fbUserManager.locationsVisited.length);
		// for (let i = 0; i < rhit.fbUserManager.locationsVisited.length; i++) {
		// 	const loc = rhit.fbUserManager.getLocationAtIndex(i);
		// 	console.log(loc.id);
		// 	const newCard = this._createCard(loc);

			//Press on location card to go to location detail page
			newCard.onclick = (event) => {
				console.log(loc.id);
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
	constructor(uid) {
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_LOCATION);
		this._unsubscribe = null;
	}

	// Add a new document with a generated id.
	add(name, state, type, dateVisited, note, custom, visited, author) {
		this._ref.add({
				[rhit.FB_KEY_NAME]: name,
				[rhit.FB_KEY_TYPE]: type,
				[rhit.FB_KEY_STATE]: state,
				[rhit.FB_KEY_DATE_VISITED]: dateVisited,
				[rhit.FB_KEY_NOTE]: note,
				[rhit.FB_KEY_CUSTOM]: custom,
				[rhit.FB_KEY_VISITED]: visited,
				[rhit.FB_KEY_AUTHOR]: author,
			})
			.then((docRef) => {
				console.log("Document written with ID: ", docRef.id);
				if (custom) {
					rhit.fbAuthManager.locationsVisited.add(docRef.id);
				}
			})
			.catch((error) => {
				console.error("Error adding document: ", error);
			});
	};

	beginListening(changeListener) {
		let query = this._ref.orderBy(rhit.FB_KEY_DATE_VISITED, "desc");
		console.log("uid: ", rhit.fbAuthManager.uid);
		if (rhit.fbAuthManager && document.querySelector("#catalogPage")) {
			query = query.where(rhit.FB_KEY_AUTHOR, "==", rhit.fbAuthManager.uid);
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
		const loc = new rhit.Location(docSnapshot.id,
			docSnapshot.get(rhit.FB_KEY_NAME),
			docSnapshot.get(rhit.FB_KEY_STATE),
			docSnapshot.get(rhit.FB_KEY_TYPE),
			docSnapshot.get(rhit.FB_KEY_DATE_VISITED),
			docSnapshot.get(rhit.FB_KEY_NOTE),
			docSnapshot.get(rhit.FB_KEY_CUSTOM),
			docSnapshot.get(rhit.FB_KEY_VISITED),
			docSnapshot.get(rhit.FB_KEY_AUTHOR),
		);
		return loc;
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

// https://www.w3schools.com/howto/howto_js_sidenav.asp
/* Set the width of the side navigation to 250px */
function openNav() {
	document.getElementById("menuSidenav").style.width = "250px";
}

/* Set the width of the side navigation to 0 */
function closeNav() {
	document.getElementById("menuSidenav").style.width = "0";
}

rhit.FbAuthManager = class {
	constructor() {
		this._user = null;
		this._displayName = "";
	}

	beginListening(changeListener) {
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
			} else {
				console.log("There is no user signed in!");
			}

			this._user = user;
			console.log(this._user);
			changeListener();
		});
	}

	signOut() {
		firebase.auth().signOut().then(function () {
			console.log("You are now signed out.");
		}).catch(function (error) {
			console.log("Sign out error.");
		});
	}

	get isSignedIn() {
		return !!this._user;
	}
	get uid() {
		return this._user.uid;
	}

	get displayName() {
		return this._user.displayName;
	}

	get email() {
		return this._user.email;
	}

	get photoURL() {
		return this._user.photoURL;
	}

	get phoneNumber() {
		return this._user.phoneNumber;
	}

	get locationsVisited() {
		return this._user.locationsVisited;
	}

	startFirebaseUI = function () {
		var uiConfig = {
			signInSuccessUrl: '/',

			signInOptions: [
				firebase.auth.GoogleAuthProvider.PROVIDER_ID,
				firebase.auth.EmailAuthProvider.PROVIDER_ID,
				firebase.auth.PhoneAuthProvider.PROVIDER_ID,
				firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
			],
		};
		const ui = new firebaseui.auth.AuthUI(firebase.auth());
		ui.start('#firebaseui-auth-container', uiConfig);
	}
}

rhit.FbUserManager = class {
	constructor() {
		this._collectionRef = firebase.firestore().collection(rhit.FB_COLLECTION_USERS);
		this._document = null;
		this._unsubscribe = null;
	}

	addNewUserMaybe(uid, displayName, email, photoURL, phoneNumber, locationsVisited) {
		// Check if the User is in Firebase already
		const userRef = this._collectionRef.doc(uid);
		return userRef.get().then((doc) => {
			if (doc.exists) {
				console.log("User already exists:", doc.data());
				// Do nothing there is already a User!
				return false;
			} else {
				// doc.data() will be undefined in this case
				console.log("Creating this user!");
				return userRef.set({
						[rhit.FB_KEY_DISPLAY_NAME]: rhit.fbAuthManager.displayName,
						[rhit.FB_KEY_EMAIL]: rhit.fbAuthManager.email,
						[rhit.FB_KEY_PHOTO_URL]: rhit.fbAuthManager.photoURL,
						[rhit.FB_KEY_PHONE_NUMBER]: rhit.fbAuthManager.phoneNumber,
						[rhit.FB_KEY_LOCATIONS_VISITED]: locationsVisited,
					})
					.then(() => {
						console.log("Document successfully written!");
						return true;
					})
					.catch((error) => {
						console.error("Error writing document: ", error);
					});
			}
		}).catch(function (error) {
			console.log("Error getting document:", error);
		});
	}

	beginListening(uid, changeListener) {
		const userRef = this._collectionRef.doc(uid);
		this._unsubscribe = userRef.onSnapshot((doc) => {
			if (doc.exists) {
				console.log("Document data:", doc.data());
				this._document = doc;
				changeListener();
			} else {
				console.log("No User! That's bad!");
			}
		});
	}

	stopListening() {
		this._unsubscribe();
	}

	get isListening() {
		return !!this._unsubscribe;
	}

	updateName(displayName) {
		const userRef = this._collectionRef.doc(rhit.fbAuthManager.uid);
		return userRef.update({
				[rhit.FB_KEY_DISPLAY_NAME]: displayName,
			})
			.then(() => {
				console.log("Document sucessfully updated!");
			})
			.catch((error) => {
				console.log("Error updating document: ", error);
			});
	}
	updatePhotoURL(photoURL) {
		const userRef = this._collectoinRef.doc(rhit.fbAuthManager.uid);
		userRef.update({
				[rhit.FB_KEY_PHOTO_URL]: photoURL,
			})
			.then(() => {
				console.log("Document sucessfully updated!");
			})
			.catch((error) => {
				console.log("Error updating document: ", error);
			});
	}

	getLocationAtIndex(index) {
		const locationID = this._document.locationsVisited[index]; //Get location id from user visitedLocations array

		//Get location from location collection using location id
		const locref = rhit.FB_COLLECTION_LOCATION.where(firebase.firestore.FieldPath.documentId(), '==', locationID).get();

		const mq = new rhit.Location(locref.id,
			locref.get(rhit.FB_KEY_NAME),
			locref.get(rhit.FB_KEY_STATE),
			locref.get(rhit.FB_KEY_TYPE),
			locref.get(rhit.FB_KEY_DATE_VISITED),
			locref.get(rhit.FB_KEY_NOTE),
			locref.get(rhit.FB_KEY_CUSTOM),
			locref.get(rhit.FB_KEY_VISITED),
			locref.get(rhit.FB_KEY_AUTHOR),
		);
		return mq;
	}
	get displayName() {
		return this._document.get(rhit.FB_KEY_DISPLAY_NAME);
	}
	get photoURL() {
		return this._document.get(rhit.FB_KEY_PHOTO_URL);
	}

	// get locationsVisited() {
	// 	this._collectionRef.get(rhit.)
	// }
}

rhit.createUserObjectIfNeeded = function () {
	return new Promise((resolve, reject) => {
		// Check if a User might be new
		if (!rhit.fbAuthManager.isSignedIn) {
			console.log("No user. So no User check needed");
			resolve(false);
			return;
		}
		if (!document.querySelector("#loginPage")) {
			console.log("Not on login page. So no User check needed");
			resolve(false);
			return;
		}
		// Call addNewUserMaybe
		console.log("Checking user");
		const locationsVisited = [];
		rhit.fbUserManager.addNewUserMaybe(
			rhit.fbAuthManager.uid,
			rhit.fbAuthManager.displayName,
			rhit.fbAuthManager.email,
			rhit.fbAuthManager.photoURL,
			rhit.fbAuthManager.phoneNumber,
			locationsVisited,
		).then((isUserNew) => {
			resolve(isUserNew);
		});
	});
}

rhit.checkForRedirects = () => {
	if (document.querySelector("#loginPage") && rhit.fbAuthManager.isSignedIn) {
		window.location.href = "/home.html";
	}
	if (!document.querySelector("#loginPage") && !rhit.fbAuthManager.isSignedIn) {
		window.location.href = "/";
	}
};

rhit.initializePage = () => {
	const urlParams = new URLSearchParams(window.location.search);
	if (document.querySelector("#mainPage")) {
		console.log("You are on the main page.");
		const uid = urlParams.get("uid");
		new rhit.MapController();
	}
	if (document.querySelector("#checklistPage")) {
		console.log("You are on the checklist page.");
		const uid = urlParams.get("uid");
		const type = urlParams.get("type");
		rhit.fbLocationsManager = new rhit.FbLocationsManager(uid);
		new rhit.ChecklistController();
		new rhit.MapController();
	}
	if (document.querySelector("#catalogPage")) {
		console.log("You are on the catalog page.");
		const uid = urlParams.get("uid");
		rhit.fbLocationsManager = new rhit.FbLocationsManager(uid);
		new rhit.CatalogListController();
	}
	if (document.querySelector("#detailPage")) {
		console.log("You are on the detail page.");
		const locationId = urlParams.get("id");
		if (!locationId) {
			window.location.href = "/catalog.html";
		}
		rhit.fbSingleLocationManager = new rhit.FbSingleLocationManager(locationId);
		new rhit.DetailPageController();
	}
	if (document.querySelector("#loginPage")) {
		console.log("You are on the login page.");
		new rhit.LoginPageController();
	}
	if (document.querySelector("#settingsPage")) {
		console.log("You are on the settings page.");
		new rhit.SettingsPageController();
	}
	if (document.querySelector("#profileSetupPage")) {
		console.log("You are on the profile setup page.");
		new rhit.ProfileSetupPageController();
	}
};

rhit.DetailPageController = class {
	constructor() {

		document.querySelector("#submitEditLocation").addEventListener("click", (event) => {
			const name = document.querySelector("#inputName").value;
			const state = document.querySelector("#stateSelect").value;
			const type = document.querySelector("#typeSelect").value;
			const date = document.querySelector("#datePicker").value;
			const note = document.querySelector("#inputNotes").value;

			rhit.fbSingleLocationManager.update(name, type, state, date, note, true);
		});

		$("#editLocationDialog").on("show.bs.modal", (event) => {
			//Pre animation
			document.querySelector("#inputName").value = rhit.fbSingleLocationManager.name;
			document.querySelector("#stateSelect").value = rhit.fbSingleLocationManager.state;
			document.querySelector("#typeSelect").value = rhit.fbSingleLocationManager.type;
			document.querySelector("#datePicker").value = rhit.fbSingleLocationManager.date;
			document.querySelector("#inputNotes").value = rhit.fbSingleLocationManager.notes;
		});

		$("#editLocationDialog").on("shown.bs.modal", (event) => {
			//Post animation
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

		if (rhit.fbUserManager.locationsVisited().includes(rhit.fbSingleLocationManager)) {
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
		document.querySelector("#signOutButton").onclick = (event) => {
			console.log(`Sign out`);
			rhit.fbAuthManager.signOut();
			location.href = 'index.html'
		};
		rhit.fbAuthManager.startFirebaseUI();
	}
}

rhit.SettingsPageController = class {
	constructor() {
		console.log("Created Settings page controller");

		document.querySelector("#signOutButton").onclick = (event) => {
			console.log(`Sign out`);
			rhit.fbAuthManager.signOut();
			location.href = 'index.html'
		};
	}
}

rhit.ProfileSetupPageController = class {
	constructor() {
		console.log("Created Profile Setup page controller");

		// Handle the two buttons.

		document.querySelector("#submitProfile").onclick = (event) => {
			const name = document.querySelector("#inputName").value;
			rhit.fbUserManager.updateName(name).then(() => {
				window.location.href = "/home.html";
			});
		};

		document.querySelector("#submitPhoto").onclick = (event) => {
			console.log("You pressed Upload photo");
			document.querySelector("#inputFile").click();
		};

		document.querySelector("#inputFile").addEventListener("change", (event) => {
			console.log("You selected a file");
			const file = event.target.files[0];
			console.log(`Received file named ${file.name}`);
			const storageRef = firebase.storage().ref().child(rhit.fbAuthManager.uid);
			storageRef.put(file).then((uploadSnapshot) => {
				console.log("Upload is complete!", uploadSnapshot);
				return storageRef.getDownloadURL();
			}).then((downloadURL) => {
				console.log("File available at", downloadURL);
				rhit.fbUserManager.updatePhotoURL(downloadURL);
			});
			console.log("Uploading", file.name);
		});

		// Start listening for users
		rhit.fbUserManager.beginListening(rhit.fbAuthManager.uid, this.updateView.bind(this));
	}
	updateView() {
		if (rhit.fbUserManager.name) {
			document.querySelector("#inputName").value = rhit.fbUserManager.displayName;
		}
		if (rhit.fbUserManager.photoUrl) {
			document.querySelector("#profilePhoto").src = rhit.fbUserManager.photoURL;
		}
	}
}

/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");
	rhit.fbAuthManager = new rhit.FbAuthManager();
	rhit.fbUserManager = new rhit.FbUserManager();
	rhit.fbAuthManager.beginListening(() => {
		console.log("isSignedIn = ", rhit.fbAuthManager.isSignedIn);
		rhit.createUserObjectIfNeeded().then((isUserNew) => {
			console.log('isUserNew :>> ', isUserNew);
			if (isUserNew) {
				window.location.href = "/profileSetup.html";
				return;
			}
			rhit.checkForRedirects();
			rhit.initializePage();
		});
	});
};

rhit.main();