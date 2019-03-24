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
	
	
	
	var schoolOptions = document.getElementById('schoolSelection');
	var schoolRef = db.collection("Schools");
	schoolRef.get().then(function(querySnapshot) {
		querySnapshot.forEach(function(doc) {
			console.log("Document data:", doc.data());
			var data = doc.data();
			var schoolName = data.School;
			var myJSON = JSON.stringify(data);
			console.log("School Name: ", schoolName);
			console.log(myJSON);
			var option = document.createElement("option");
			option.text = schoolName;
			option.value = myJSON;
			schoolOptions.options.add(option);
		//	var schoolName = doc.data().
		});
		 
	})
	
var teacherOptions = document.getElementById('teacherSelection');
schoolOptions.onchange = function(){
	console.log("On Select school called");
	var x = document.getElementById("schoolSelection").selectedIndex;
	var school = document.getElementsByTagName("option")[x].value;
	var obj = JSON.parse(school); 
	
	var schoolId = obj.documentId;
	var ref = db.collection("Users");
	console.log('school id ' + schoolId);
	var query = ref.where("schoolId", "==",schoolId).where("title","==","Teacher");
	
	query.get().then(function(querySnapshot) {
		querySnapshot.forEach(function(doc) { 
			var data = doc.data();
			var teacherName = data.name;
			
			console.log("Teacher Name: ", teacherName);
			var option = document.createElement("option");
			option.text = teacherName;
			option.value = JSON.stringify(data);
			teacherOptions.options.add(option);
		//	var schoolName = doc.data().
		});
	})
}
var teacherJSON;
teacherOptions.onchange = function() {
	
	teacherJSON = document.getElementById("teacherSelection").options[document.getElementById("teacherSelection").selectedIndex].value;
	
}
	
document.getElementById("submit").onclick = function () {
	
		 var name = document.getElementById('name').value;
		 var email = document.getElementById('email').value;
		 var phone = document.getElementById('phone').value; 
		 var schoolName = document.getElementById("schoolSelection").options[document.getElementById("schoolSelection").selectedIndex].text;
		 var teacher = JSON.parse(teacherJSON);
		 var json = document.getElementById("schoolSelection").options[document.getElementById("schoolSelection").selectedIndex].value;
		 var school = JSON.parse(json);
		 
	var student = {
				'name' :  name,
				'email' : email,
				'phone' : phone,
				'schoolName' : schoolName,
				'schoolId' : school.documentId,
				'school' : school,
				'teacher' : teacher,
				'teacherId' : teacher.uid,
		}
		
		
	axios.post('https://us-central1-funrun-dd997.cloudfunctions.net/registerStudent', student).then(function (res) { 
		// Navigate to Registered Screen.
		console.log('Registration Successful');
		window.open("referral.html", "_self");
				  
	}).catch(function (err) {
		console.log(err);
				   
	});


}
			

};
