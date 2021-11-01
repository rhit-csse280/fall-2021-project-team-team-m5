var rhit = rhit || {};

rhit.FB_COLLECTION_LOCATION = "Locations";
rhit.FB_KEY_NAME = "name";
rhit.FB_KEY_TYPE = "type";
rhit.FB_KEY_STATE = "state";
rhit.FB_KEY_CUSTOM = "custom";
rhit.FB_KEY_DATE_VISITED = "dateVisited";
rhit.FB_KEY_NOTE = "note";
rhit.FB_KEY_AUTHOR = "author";

rhit.fbLocationsManager = null;
rhit.fbSingleLocationManager = null;
rhit.fbAuthManager = null;

// From: https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

rhit.CheckListController = class {
	constructor() {

		document.querySelector("#customTag").addEventListener("click", (event) => {
			window.location.href =`/checklist.html?uid=${uid}`;
		});

		//Start listening
		rhit.fbLocationsManager.beginListening(this.updateCheckList.bind(this));
	}

	updateCheckList(){

		//make a new quoteListContainer
		const newList = htmlToElement('<div id="locationContainer"></div>');

		//Fill qlc with quote cards using a loop
		for(let i=0; i<rhit.fbLocationsManager.length; i++){
			const mq = rhit.fbLocationsManager.getLocationAtIndex(i);
			const newCard = this._createCard(mq);

			newCard.onclick = (event)=>{
				window.location.href = `/location.html?id=${mq.id}`;
			};
			newList.appendChild(newCard);
		}

	}

	_createCard(clLocation){
	  return htmlToElement(`<div class="form-check">
	  <input class="form-check-input" type="checkbox" value="" id=${clLocation.id}>
	  <label class="form-check-label" for=${clLocation.id}>
		${clLocation.name}
	  </label>
	</div>`)
	}
}

rhit.VisitedListController = class {
	constructor() {

		document.querySelector("#submitAddPlace").addEventListener("click", (event) => {
			const name = document.querySelector("#inputName").value;
			const state = document.querySelector("#stateSelect").value;
			const type = document.querySelector("#typeSelect").value;
			const dateVisited = document.querySelector("#inputDate").value;
			const notes = document.querySelector("#inputNotes").value;
			// const custom = true;
			// const visited = true; 
			rhit.fbLocationsManager.add(name, state, type, dateVisited, notes);
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
		console.log("Updating catalog!");

		// TODO: updateList
	}
}

rhit.Location = class {
	constructor(id, name, state, type, dateVisited, notes, author) {
		this.id = id;
		this.name = name;
		this.state = state;
		this.type = type;
		this.dateVisited = dateVisited;
		this.notes = notes;
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
	add(name, state, type, dateVisited, note) {
		this._ref.add({
			[rhit.FB_KEY_NAME]: name,
			[rhit.FB_KEY_TYPE]: type,
			[rhit.FB_KEY_STATE]: state,
			[rhit.FB_KEY_DATE_VISITED]: dateVisited,
			[rhit.FB_KEY_NOTE]: note,
			[rhit.FB_KEY_AUTHOR]: uid,
		})
		.then((docRef) => {
			console.log("Document written with ID: ", docRef.id);
		})
		.catch((error) => {
			console.error("Error adding document: ", error);
		});
	};

	beginListening() {
	}

	stopListening() {
		this._unsubscribe();
	}

	getLocationAtIndex(index) {
		const docSnapshot =this._documentSnapshots[index];
		const mq = new rhit.Location(docSnapshot.id,
			docSnapshot.get(rhit.FB_KEY_NAME),
			docSnapshot.get(rhit.FB_KEY_STATE),
			docSnapshot.get(rhit.FB_KEY_TYPE),
			docSnapshot.get(rhit.FB_KEY_DATE_VISITED),
			docSnapshot.get(rhit.FB_KEY_NOTE),
			docSnapshot.get(rhit.FB_KEY_AUTHOR),
		);
		return mq;
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


rhit.startFirebaseUI = function(){
	var uiConfig = {
		signInSuccessUrl: 'home.html',
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

rhit.initializePage = () => {
	const urlParams = new URLSearchParams(window.location.search);
	if (document.querySelector("#checklistPage")) {
		console.log("You are on the checklist page.");
		const uid = urlParams.get("uid");
		rhit.fbLocationsManager = new rhit.FbLocationsManager(uid);
		new rhit.ChecklistPageController();
	}
	// if (document.querySelector("#detailPage")) {
	// 	console.log("You are on the detail page.");
	// 	const movieQuoteId = urlParams.get("id");
	// 	if (!movieQuoteId) {
	// 		window.location.href = "/";
	// 	}
	// 	rhit.fbSingleQuoteManager = new rhit.FbSingleQuoteManager(movieQuoteId);
	// 	new rhit.DetailPageController();
	// }
	if (document.querySelector("#mainPage")) {
		console.log("You are on the login page.");
		new rhit.LoginPageController();
	}
};

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
				this._documentSnapshot=doc;
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

	get name(){ return this._documentSnapshot.get(rhit.FB_KEY_NAME); }
	get type(){ return this._documentSnapshot.get(rhit.FB_KEY_TYPE); }
	get state(){ return this._documentSnapshot.get(rhit.FB_KEY_STATE); }
	get dateVisited(){ return this._documentSnapshot.get(rhit.FB_KEY_DATE_VISITED); }
	get author(){ return this._documentSnapshot.get(rhit.FB_KEY_AUTHOR); }
}

rhit.LoginPageController = class {
	constructor() {

		firebase.auth().onAuthStateChanged((user) => {
			if(user){
				const displayName=user.displayName;
				const email=user.email;
				const photoURL=user.photoURL;
				const phoneNumber = user.phoneNumber;
				const isAnonymous =user.isAnonymous ;
				const uid=user.uid;
				console.log("User is signed in ", uid);
				console.log('displayName :>> ', displayName);
				console.log('email :>> ', email);
				console.log('photoURL :>> ', photoURL);
				console.log('phoneNumber :>> ', phoneNumber);
				console.log('isAnonymous :>> ', isAnonymous);
				console.log('uid :>> ', uid);
			} else{
				console.log("There is no user signed in!");
			}
		});
	
		document.querySelector("#signOutButton").onclick = (event) => {
			console.log(`Sign out`);
			firebase.auth().signOut().then(function (){
				console.log("You are now signed out.");
			}).catch(function (error){
				console.log("Sign out error.");
			});
			location.href='index.html'
		};
		rhit.startFirebaseUI();
	}
}



rhit.main();
