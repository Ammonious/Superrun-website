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
	
	
	
	
	
	
	
	
document.getElementById("pledgeBtn").onclick = function () {
	
		 var name = document.getElementById('name');
		 var email = document.getElementById('email');
		 var phone = document.getElementById('phone'); 
		 var schoolName = document.getElementById("schoolSelection").options[document.getElementById("schoolSelection").selectedIndex].value;
		 
		 var x = document.getElementById("schoolSelection").selectedIndex;
		 var school = document.getElementsByTagName("option")[x].value;
		 var school = JSON.parse(json);
		
	var student = {
				name :  name,
				email : email,
				phone : phone,
				schoolName : schoolName,
		}
		
		
	axios.post('https://us-central1-funrun-dd997.cloudfunctions.net/registerStudent', student).then(function (res) { 
					 // Navigate to Registered Screen.
					 
				  
	}).catch(function (err) {
		console.log(err);
				   
	});


}



			

};
