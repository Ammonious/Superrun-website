var teacherName;
var grade;
var studentId;
var teacherId;
var schoolId;
var studentName;

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

	var sent = false;
	var emailArray = new Array();


	const emailOne = document.getElementById('email-one');
	const emailTwo = document.getElementById('email-two');
	const emailThree = document.getElementById('email-three');
	const emailFour = document.getElementById('email-four');
	const emailFive = document.getElementById('email-five');

	const emailSix = document.getElementById('email-six');
	const emailSeven = document.getElementById('email-seven');
	const emailEight = document.getElementById('email-eight');
	const emailNine = document.getElementById('email-nine');
	const emailTen = document.getElementById('email-ten');

	// PARSE QUERY
	var urlObject = parseQuery(window.location.search);
	console.log('URL - ' + JSON.stringify(urlObject));
	var voucherCode = urlObject.voucher;
	console.log('voucher code - ' + voucherCode);

	if (voucherCode != null) {
		getStudentInfo(db, voucherCode);
		document.getElementById('facebook-share').setAttribute("data-href", 'https://www.yoursuperrun.com/pledge.html?voucher=' + voucherCode);
	} else {
		window.open("404.html", "_self");
	}




	document.getElementById('send-btn').onclick = function () {

		if (sent == false) {
			showLoader();


			if (emailOne.value.length > 0) {
				emailArray.push(emailOne.value);
			}
			if (emailTwo.value.length > 0) {
				emailArray.push(emailTwo.value);
			}
			if (emailThree.value.length > 0) {
				emailArray.push(emailThree.value);
			}
			if (emailFour.value.length > 0) {
				emailArray.push(emailFour.value);
			}

			if (emailFive.value.length > 0) {
				emailArray.push(emailFive.value);
			}
			if (emailSix.value.length > 0) {
				emailArray.push(emailSix.value);
			}
			if (emailSeven.value.length > 0) {
				emailArray.push(emailSeven.value);
			}
			if (emailEight.value.length > 0) {
				emailArray.push(emailEight.value);
			}
			if (emailNine.value.length > 0) {
				emailArray.push(emailNine.value);
			}
			if (emailTen.value.length > 0) {
				emailArray.push(emailTen.value);
			}
			var json = {
				'emails': emailArray,
				'studentName': studentName,
				'studentId': voucherCode,

			};

			axios.post('https://us-central1-funrun-dd997.cloudfunctions.net/sendReferrals', json).then(function (res) {
				// Navigate to Registered Screen. 
				sent = true;
				hideLoader();
			}).catch(function (err) {
				console.log(err);
				hideLoader();

			});
		}
	}



	var modal = $('.modal');
	$('.close-modal').click(function () {
		modal.fadeOut();
	});

	// FINISH WINDOW LOAD
};


function showLoader() {
	$('.loader').css('opacity', 1);
	setTimeout(function () {
		$('.loader').show();
	}, 0);
}

function hideLoader() {

	$('.loader').css('opacity', 0);
	setTimeout(function () {
		$('.loader').hide();
	}, 0);
}

function parseQuery(queryString) {
	var query = {};
	var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
	for (var i = 0; i < pairs.length; i++) {
		var pair = pairs[i].split('=');
		query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
	}
	return query;
}

function getStudentInfo(db, voucher) {


	db.collection("Students").get().then(function (querySnapshot) {
		querySnapshot.forEach(function (doc) {
			var school = doc.data();
			if (school[voucher]) {
				var student = school[voucher];
				var studentString = JSON.stringify(student);
				console.log('Student - ' + studentString);
				if (student != null) {
					studentId = student.studentId;
					if (voucher.trim() === studentId.trim()) {


						studentName = student.name;
						teacherName = student.teacherName;
						grade = student.grade;
						studentId = student.studentId;
						teacherId = student.teacherId;
						schoolId = student.schoolId;
						console.log("Student's Name " + studentName);

					}
				}
			}




		});
	})
}