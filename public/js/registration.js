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
			var data = doc.data();
			var schoolName = data.School;
			var myJSON = JSON.stringify(data);
			var option = document.createElement("option");
			option.text = schoolName;
			option.value = myJSON;
			schoolOptions.options.add(option);
		//	var schoolName = doc.data().
		});
		 
	})
	
var teacherOptions = document.getElementById('teacherSelection');
schoolOptions.onchange = function(){
	var x = document.getElementById("schoolSelection").selectedIndex;
	var school = document.getElementsByTagName("option")[x].value;
	var obj = JSON.parse(school); 
	
	var schoolId = obj.documentId;
	var ref = db.collection("Users");
	var query = ref.where("schoolId", "==",schoolId).where("title","==","Teacher");
	
	query.get().then(function(querySnapshot) {
		querySnapshot.forEach(function(doc) { 
			var data = doc.data();
			var teacherName = data.name;
			
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
	
	if(document.getElementById('first-name').value.length < 1){
		 showModal('Looks like you are missing the first name. Please enter the required information and try again.');	
	} else if(document.getElementById('last-name').value.length < 1){
		 showModal('Looks like you are missing the last name. Please enter the required information and try again.');	
	} else if(document.getElementById('email').value.length < 1) {
		 showModal('Looks like you are missing the email address. Please enter the required information and try again.');	
	} else if(document.getElementById("schoolSelection").options[document.getElementById("schoolSelection").selectedIndex].value == null){
		 showModal('Looks like you are missing the school. Please enter the required information and try again.');	
	} else if(teacherJSON == null){
		 showModal('Looks like you are missing the teacher. Please enter the required information and try again.');
	} else {
		 
		 var today = new Date();
		 	var dd = String(today.getDate()).padStart(2, '0');
		 	var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
		 	var yyyy = today.getFullYear();
		 	var date = yyyy + '-' + mm + '-' + dd;
		 	
		 showLoader();
		 var name = document.getElementById('first-name').value + ' ' + document.getElementById('last-name').value;
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
				'teacherId' : teacher.uid,
		 		'teacherName' : teacher.name,
		 		'grade' : teacher.grade,
				'date' : date,
			}
			
		
		axios.post('https://us-central1-funrun-dd997.cloudfunctions.net/registerStudent', student).then(function (res) { 
			// Navigate to Registered Screen. 
			var response = res.data;
			var studentId = response.studentId;
			window.open("referral.html?" + studentId, "_self");
		}).catch(function (err) {
			console.log(err);
			hideLoader();
		
		});
	}

}
		
	
var modal = $('.modal');
$('.close-modal').click(function() {
	modal.fadeOut();
});	

};


function showLoader() {
	$('.loader').css('opacity', 1);
	setTimeout(function(){$('.loader').show();},0);
}

function hideLoader() {
	
	$('.loader').css('opacity', 0);
	setTimeout(function(){$('.loader').hide();},0);
}


function showModal(message) {
	document.getElementById('modal_content').innerHTML = message;
	var modal = $('.modal');
	modal.fadeIn();

}

