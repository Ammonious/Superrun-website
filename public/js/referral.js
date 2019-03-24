window.onload = function () {
	
	
	firebase.initializeApp({
	            apiKey: "AIzaSyAGIN8ephB61ongcfgq5Ph715zDRsJ3UEI",
	            authDomain: "funrun-dd997.firebaseapp.com",
	            databaseURL: "https://funrun-dd997.firebaseio.com/",
	            projectId: "funrun-dd997",
	            storageBucket: "gs://funrun-dd997.appspot.com"
	        });
	
	        // Immutable vars
	var db = firebase.firestore();
	// Disable deprecated features
	db.settings({
	  timestampsInSnapshots: true
	});





};