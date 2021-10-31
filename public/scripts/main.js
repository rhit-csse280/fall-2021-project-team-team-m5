var rhit = rhit || {};

rhit.FB_COLLECTION_MOVIEQUOTE = "Locations";
rhit.FB_KEY_NAME = "name";
rhit.FB_KEY_TYPE = "type";
rhit.FB_KEY_STATE = "state";
rhit.FB_KEY_CUSTOM = "custom";
rhit.FB_KEY_DATE_VISITED = "dateVisited";
rhit.FB_KEY_NOTE = "note";
rhit.FB_KEY_AUTHOR = "author";

/** globals */
rhit.variableName = "";

/** function and class syntax examples */
rhit.functionName = function () {
	/** function body */
};

rhit.ClassName = class {
	constructor() {

	}

	methodName() {

	}
}

// From: https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
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
	constructor(id, name, state, type, dateVisited, notes) {
		this.id = id;
		this.name = name;
		this.state = state;
		this.type = type;
		this.dateVisited = dateVisited;
		this.notes = notes;
	}
}

rhit.fbLocationsManager = class {
	// TODO: fbLocationsManager

	constructor(uid) {

	}

	add() {};

	beginListening() {}

	stopListening() {}

	getLocationAtIndex() {}


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

rhit.main();
