window.onload = function () {


const baseUrl = "https://us-central1-funrun-dd997.cloudfunctions.net/";
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


document.getElementById('submit').onclick = function () {
	
	showLoader();
	var json = {
				'name' : document.getElementById('name-input').value,
				'email' : document.getElementById('email-input').value,
				'school' : document.getElementById('school-input').value,
				'message' : document.getElementById('message-input').value,
				};
	axios.post('https://us-central1-funrun-dd997.cloudfunctions.net/sendContact', json)
	.then(function (res) {
		  	
		hideLoader();
		document.getElementById('modal_content').innerHTML = 'Thank you for inquiring. We will contact you soon! <br></br>';
		var modal = $('.modal');
		modal.fadeIn();
				 
	}).catch(function (err) {
	    console.log(err);
	});
	
}

var modal = $('.modal');
$('.close-modal').click(function() {
	modal.fadeOut();
	window.open("index.html", "_self");
});

// END WINDOW LOAD
};


function showLoader() {
	$('.loader').css('opacity', 1);
	setTimeout(function(){$('.loader').show();},0);
}

function hideLoader() {
	
	$('.loader').css('opacity', 0);
	setTimeout(function(){$('.loader').hide();},0);
}