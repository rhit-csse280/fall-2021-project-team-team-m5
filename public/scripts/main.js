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
