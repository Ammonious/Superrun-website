



var validStudent = false;
var teacherName;
var grade;
var studentId;
var teacherId;
var schoolId;
var connectId;

window.onload = function () {


    // INIT FIREBASE
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

    

    // STUDENT PAGE ELEMENTS
    const templateContainer = document.getElementById('template-container');
    const messageCard = document.getElementById('message-card');
    const message = document.getElementById('message');
    const studentName = document.getElementById('student-name');
    const studentImage = document.getElementById('student-image');
    const schoolName = document.getElementById('school-name');
    const goalAmount = document.getElementById('goal-amount');
    const goalContainer = document.getElementById('goal-container');


    // INFO ELEMENTS
    const voucherInput = document.getElementById('voucher-code');

    const addressInput = document.getElementById('address');
    const stateSelect = document.getElementById('state');
    const cityInput = document.getElementById('city');
    const zipInput = document.getElementById('zip');
    const emailInput = document.getElementById('email');


    // CARD ELEMENTS
    const nameInput = document.getElementById('name');
    const cardnumber = document.getElementById('cardnumber');
    const expirationdate = document.getElementById('expirationdate');
    const securitycode = document.getElementById('securitycode');

    initCard(nameInput,expirationdate,cardnumber,securitycode);

    // PAYMENT AMOUNT
    const flatAmount = document.getElementById('flat-amount');
    const amount = document.getElementById('amount');
    const pledgeBtn = document.getElementById('pledge-btn');

    // IDEMPOTENCY KEY
    var idempotency_key = makeid(12);

    // PARSE QUERY
    var urlObject = parseQuery(window.location.search);
    console.log('URL - ' + JSON.stringify(urlObject));
    var voucherCode = urlObject.voucher;
    console.log('voucher code - ' + voucherCode);

    if (voucherCode != null) {
        voucherInput.value = voucherCode;
        getStudentTemplate(db,voucherCode);
        getStudentInformation(db, voucherCode);
        console.log('Voucher Field - ' + voucherInput);
    }

    voucherInput.oninput = function () {
 
        console.log('input value - ' + voucherInput.value);
        if (voucherInput.value.length >= 5) {
            getStudentTemplate(db,voucherInput.value);
            getStudentInformation(db,voucherInput.value);
           
        }


    };


    amount.oninput = function () {

        var pledgeAmount = (amount.value * 20);  
        var stripeAmount =  parseInt((pledgeAmount * 100) + 200);
        pledgeBtn.textContent = 'Pledge $' + currency(stripeAmount / 100);
        flatAmount.value = '0.00';

    };

    flatAmount.oninput = function () {

        var stripeAmount = parseInt((flatAmount.value * 100) + 200);   
        console.log(stripeAmount);
        pledgeBtn.textContent = 'Pledge $' + currency(stripeAmount / 100) ;
        amount.value = '0.00'; 

    };

    $("#pledge-btn").on("click", function() {
        $(this).attr("disabled", "disabled");
        console.log('Pledge Btn Clicked');
        var isFlatAmount = flatAmount.value > 0 ? true : false;
        var pledgeAmount;
        if (isFlatAmount) {
            pledgeAmount =  parseInt((flatAmount.value * 100) + 200);
        } else {
            var calc = (amount.value * 20);
            pledgeAmount = parseInt((calc * 100) + 200);
        }

        if (nameInput.value.length < 1) {
            $("#pledge-btn").removeAttr("disabled")
            showErrorDialog('Looks like you are missing the name. Please enter the required information and try again.');
        } else if (emailInput.value.length < 1) {
            $("#pledge-btn").removeAttr("disabled")
            showErrorDialog('Looks like you are missing the email. Please enter the required information and try again.');
        } else if (addressInput.value.length < 1) {
            $("#pledge-btn").removeAttr("disabled")
            showErrorDialog('Looks like you are missing the address. Please enter the required information and try again.');
        } else if (cityInput.value.length < 1) {
            $("#pledge-btn").removeAttr("disabled")
            showErrorDialog('Looks like you are missing the city. Please enter the required information and try again.');
        } else if (document.getElementById("state").options[document.getElementById("state").selectedIndex].value.length < 1) {
            $("#pledge-btn").removeAttr("disabled")
            showErrorDialog('Looks like you are missing the state. Please enter the required information and try again.');
        } else if (validStudent == false) {
            $("#pledge-btn").removeAttr("disabled")
            showErrorDialog('Looks like you are missing the student voucher. Please enter the required information and try again.');
        } else if (pledgeAmount < 1500) {
            $("#pledge-btn").removeAttr("disabled")
            showErrorDialog('Looks like you are below the minimum pledge amount. Enter an amount of $20.00 or more and try again.');
        } else {

         //   showLoader();

            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();
            var date = yyyy + '-' + mm + '-' + dd;

            // Submit Payment Info
            var expirationDate = expirationdate.value;
            var array = expirationDate.split("/");
            var month = array[0];
            var year = "20" + array[1];
            // getting entered amount and multiplying by the number of laps.

            stripeAmount = stripeAmount + 200;
            var donor = {
                'name': nameInput.value,
                'email': emailInput.value,
                'address': addressInput.value,
                'city': cityInput.value,
                'state': document.getElementById("state").options[document.getElementById("state").selectedIndex].value,
                'zip': zipInput.value,
                'cardNumber': cardnumber.value,
                'cvc': securitycode.value,
                'expMonth': month,
                'expYear': year,
                'pledgePerLap': amount.value,
                'isFlatPledge': isFlatAmount,
                'schoolId': schoolId,
                'connectId': connectId,
                'teacherId': teacherId,
                'teacherName': teacherName,
                'grade': grade,
                'studentId': studentId,
                'studentName': studentName,
                'amount': pledgeAmount,
                'idempotency_key': idempotency_key,
                'date': date,
            }

            axios.post('https://us-central1-funrun-dd997.cloudfunctions.net/createCustomer', donor)
                .then(function (res) {


                    $("#pledge-btn").removeAttr("disabled")
                    console.log(res.data);
                    var response = res.data;
                    var error = response.error;
                    if (error) {
                        hideLoader();
                        idempotency_key = makeid(12);
                        document.getElementById('modal_content').innerHTML = response.errorMessage;
                        var modal = $('.modal');
                        modal.fadeIn();
                    } else {
                        window.open("confirmation.html?voucher=" + studentId, "_self");
                    }

                }).catch(function (err) {
                    console.log(err);
                    showErrorDialog(err.message);
                    $("#pledge-btn").removeAttr("disabled")
                });

        }
    });
    
     
};

function makeid(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


function toggleDialog() {
    var x = document.getElementById("dialog");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

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


function showErrorDialog(message) {
     // Display error message to the user in a modal
// $('#modal_content').html(message);
 // $('#modal').modal('show');
    console.log('hi im a dumb dialog');
    var modal = document.getElementById('modal');
    modal.open();
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

function getSchoolInformation(db,schoolId){
    db.collection('Registration').doc(schoolId).get().then(function(doc){
        if(doc.exists){
            connectId = doc.accountId;
        }
    }).catch(function(error){

    });
}

function getStudentTemplate(db,voucherCode){
    db.collection("DynamicPages").doc(voucherCode).get().then(function(doc) {
        if (doc.exists) {
            console.log("Document data:", doc.data());
            var page = doc.data();
            var hasGoalBar = page.goalbar;
            if(hasGoalBar){
                document.getElementById('goal-amount').innerHTML = '$' + currency(page.goalAmount);
                document.getElementById('goal-title').textContent = "Goal Amount";
            } else {
                document.getElementById('goal-amount').innerHTML = '';
                document.getElementById('goal-title').textContent = '';
            }
            if(page.image != null){
                document.getElementById('student-image').src = page.image;
                document.getElementById('student-image').style.display = 'inline';
                document.getElementById('logo').style.display = 'none';
            } else {
                document.getElementById('student-image').style.display = 'none';
                document.getElementById('logo').style.display = 'inline';
            }
            if(page.message != null && page.message.length > 0){
                document.getElementById('message').textContent = page.message;
                document.getElementById('message-card').style.display = 'inline-block';
                document.getElementById('school-name').textContent = page.schoolName;
                document.getElementById('student-name').textContent = page.studentName;
            }
            studentName = page.studentName;
            studentId = page.studentId;
            schoolId = page.schoolId;
            getSchoolInformation(db,schoolId);
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}

function getStudentInformation(db,voucherCode) {
    if (voucherCode.length >= 5) {
        var studentVoucher = voucherCode.toUpperCase().trim();
        if (studentVoucher.length >= 5) {

            console.log(studentVoucher); 

            db.collection("Students").get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    var schoolStudents = doc.data();
                    if(schoolStudents[voucherCode.trim()]){
                        var student = schoolStudents[voucherCode.trim()]; 
                        var studentString = JSON.stringify(student);
                        console.log('Student - ' + studentString);
                        if (student != null) {
                            studentId = student.studentId;
                            if (studentVoucher === studentId.toUpperCase().trim()) {
    
                                 
                                document.getElementById('student-name').textContent = student.name;
                                document.getElementById('school-name').innerHTML = student.schoolName;
                                document.getElementById("voucher-code").style.border="4px solid #00B0FF";
                                document.getElementById('voucher-code').style.fontWeight="bold";
                                document.getElementById('voucher-code').style.fontSize="24px";
                                document.getElementById('voucher-code').style.color="black";
                                document.getElementById('voucher-code').value = studentId.toUpperCase();
                                teacherName = student.teacherName;
                                grade = student.grade;
                                studentId = student.studentId;
                                teacherId = student.teacherId;
                                schoolId = student.schoolId; 
                                validStudent = true; 
                                
    
                            }
                        }
                    }
                   

                   



                });
            })
        } else {
            studentName.innerHTML = "Student's Name - N/A";
        }
    }
}


function initCard(name,expirationdate,cardnumber,securitycode){

    const ccsingle = document.getElementById('ccsingle');

     //Mask the Credit Card Number Input
     var cardnumber_mask = new IMask(cardnumber, {
        mask: [{
                mask: '0000 000000 00000',
                regex: '^3[47]\\d{0,13}',
                cardtype: 'american express'
            },
            {
                mask: '0000 0000 0000 0000',
                regex: '^(?:6011|65\\d{0,2}|64[4-9]\\d?)\\d{0,12}',
                cardtype: 'discover'
            },
            {
                mask: '0000 000000 0000',
                regex: '^3(?:0([0-5]|9)|[689]\\d?)\\d{0,11}',
                cardtype: 'diners'
            },
            {
                mask: '0000 0000 0000 0000',
                regex: '^(5[1-5]\\d{0,2}|22[2-9]\\d{0,1}|2[3-7]\\d{0,2})\\d{0,12}',
                cardtype: 'mastercard'
            },
            // {
            //     mask: '0000-0000-0000-0000',
            //     regex: '^(5019|4175|4571)\\d{0,12}',
            //     cardtype: 'dankort'
            // },
            // {
            //     mask: '0000-0000-0000-0000',
            //     regex: '^63[7-9]\\d{0,13}',
            //     cardtype: 'instapayment'
            // },
            {
                mask: '0000 000000 00000',
                regex: '^(?:2131|1800)\\d{0,11}',
                cardtype: 'jcb15'
            },
            {
                mask: '0000 0000 0000 0000',
                regex: '^(?:35\\d{0,2})\\d{0,12}',
                cardtype: 'jcb'
            },
            {
                mask: '0000 0000 0000 0000',
                regex: '^(?:5[0678]\\d{0,2}|6304|67\\d{0,2})\\d{0,12}',
                cardtype: 'maestro'
            },
            // {
            //     mask: '0000-0000-0000-0000',
            //     regex: '^220[0-4]\\d{0,12}',
            //     cardtype: 'mir'
            // },
            {
                mask: '0000 0000 0000 0000',
                regex: '^4\\d{0,15}',
                cardtype: 'visa'
            },
            {
                mask: '0000 0000 0000 0000',
                regex: '^62\\d{0,14}',
                cardtype: 'unionpay'
            },
            {
                mask: '0000 0000 0000 0000',
                cardtype: 'Unknown'
            }
        ],
        dispatch: function (appended, dynamicMasked) {
            var number = (dynamicMasked.value + appended).replace(/\D/g, '');

            for (var i = 0; i < dynamicMasked.compiledMasks.length; i++) {
                let re = new RegExp(dynamicMasked.compiledMasks[i].regex);
                if (number.match(re) != null) {
                    return dynamicMasked.compiledMasks[i];
                }
            }
        }
    });

    //Mask the Expiration Date
    var expirationdate_mask = new IMask(expirationdate, {
        mask: 'MM{/}YY',
        groups: {
            YY: new IMask.MaskedPattern.Group.Range([0, 99]),
            MM: new IMask.MaskedPattern.Group.Range([1, 12]),
        }
    });

    //Mask the security code
    var securitycode_mask = new IMask(securitycode, {
        mask: '0000',
    });

     
    let amex_single = `<svg version="1.1" id="Layer_1" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="750" height="471" viewBox="0 0 750 471" enable-background="new 0 0 752 471" xml:space="preserve"><title>Slice 1</title><desc>Created with Sketch.</desc><g><g><path fill="#2557D6" d="M554.594,130.608l-14.521,35.039h29.121L554.594,130.608z M387.03,152.321c2.738-1.422,4.349-4.515,4.349-8.356c0-3.764-1.693-6.49-4.431-7.771c-2.492-1.42-6.328-1.584-10.006-1.584h-25.978v19.523h25.63C380.7,154.134,384.131,154.074,387.03,152.321z M54.142,130.608l-14.357,35.039h28.8L54.142,130.608z M722.565,355.08h-40.742v-18.852h40.578c4.023,0,6.84-0.525,8.537-2.177c1.471-1.358,2.494-3.336,2.494-5.733c0-2.562-1.023-4.596-2.578-5.813c-1.529-1.342-3.76-1.953-7.434-1.953c-19.81-0.67-44.523,0.609-44.523-27.211c0-12.75,8.131-26.172,30.27-26.172h42.025v-17.492h-39.045c-11.783,0-20.344,2.81-26.406,7.181v-7.181h-57.752c-9.233,0-20.074,2.279-25.201,7.181v-7.181H499.655v7.181c-8.207-5.898-22.057-7.181-28.447-7.181H403.18v7.181c-6.492-6.262-20.935-7.181-29.734-7.181h-76.134l-17.42,18.775l-16.318-18.775H149.847v122.675h111.586l17.95-19.076l16.91,19.076l68.78,0.059v-28.859h6.764c9.125,0.145,19.889-0.223,29.387-4.311v33.107h56.731v-31.976h2.736c3.492,0,3.838,0.146,3.838,3.621v28.348h172.344c10.941,0,22.38-2.786,28.712-7.853v7.853h54.668c11.375,0,22.485-1.588,30.938-5.653v-22.853C746.069,351.297,736.079,355.08,722.565,355.08z M372.734,326.113h-26.325v29.488h-41.006L279.425,326.5l-26.997,29.102h-83.569v-87.914h84.855l25.955,28.818l26.835-28.818h67.414c16.743,0,35.555,4.617,35.555,28.963C409.473,321.072,391.176,326.113,372.734,326.113z M499.323,322.127c2.98,4.291,3.41,8.297,3.496,16.047v17.428h-21.182v-10.998c0-5.289,0.512-13.121-3.41-17.209c-3.08-3.149-7.781-3.901-15.48-3.901h-22.545v32.108h-21.198v-87.914h48.706c10.685,0,18.462,0.472,25.386,4.148c6.658,4.006,10.848,9.494,10.848,19.523c-0.002,14.031-9.399,21.19-14.953,23.389C493.684,316.473,497.522,319.566,499.323,322.127z M586.473,285.869h-49.404v15.982h48.197v17.938h-48.197v17.492l49.404,0.078v18.242h-70.414v-87.914h70.414V285.869z M640.686,355.6h-41.09v-18.852h40.926c4.002,0,6.84-0.527,8.619-2.178c1.449-1.359,2.492-3.336,2.492-5.73c0-2.564-1.129-4.598-2.574-5.818c-1.615-1.34-3.842-1.948-7.514-1.948c-19.73-0.673-44.439,0.606-44.439-27.212c0-12.752,8.047-26.174,30.164-26.174h42.297v18.709h-38.703c-3.836,0-6.33,0.146-8.451,1.592c-2.313,1.423-3.17,3.535-3.17,6.322c0,3.316,1.963,5.574,4.615,6.549c2.228,0.771,4.617,0.996,8.211,0.996l11.359,0.308c11.449,0.274,19.313,2.25,24.092,7.069c4.105,4.232,6.311,9.578,6.311,18.625C673.829,346.771,661.963,355.6,640.686,355.6z M751.192,343.838L751.192,343.838L751.192,343.838L751.192,343.838z M477.061,287.287c-2.549-1.508-6.311-1.588-10.066-1.588h-25.979v19.744h25.631c4.104,0,7.594-0.144,10.414-1.812c2.734-1.646,4.371-4.678,4.371-8.438C481.432,291.434,479.795,288.711,477.061,287.287z M712.784,285.697c-3.838,0-6.389,0.145-8.537,1.588c-2.227,1.426-3.081,3.537-3.081,6.326c0,3.315,1.879,5.572,4.612,6.549c2.228,0.771,4.615,0.996,8.129,0.996l11.437,0.303c11.537,0.285,19.242,2.262,23.938,7.08c0.855,0.668,1.369,1.42,1.957,2.174v-25.014h-38.453L712.784,285.697L712.784,285.697z M373.47,285.697h-27.509v22.391h27.265c8.105,0,13.146-4.006,13.149-11.611C386.372,288.789,381.086,285.697,373.47,285.697z M189.872,285.697v15.984h46.315v17.938h-46.315v17.49h51.87l24.1-25.791l-23.076-25.621H189.872L189.872,285.697z M325.321,347.176v-70.482l-32.391,34.673L325.321,347.176z M191.649,206.025v15.148h176.263l-0.082-32.046h3.411c2.39,0.083,3.084,0.302,3.084,4.229v27.818h91.164v-7.461c7.353,3.924,18.789,7.461,33.838,7.461h38.353l8.209-19.522h18.197l8.026,19.522h73.906V202.63l11.189,18.543h59.227V98.59h-58.611v14.477l-8.207-14.477h-60.143v14.477l-7.537-14.477h-81.24c-13.6,0-25.551,1.89-35.207,7.158V98.59h-56.063v7.158c-6.146-5.43-14.519-7.158-23.826-7.158H180.784l-13.742,31.662L152.928,98.59H88.417v14.477L81.329,98.59H26.312L0.763,156.874v46.621l37.779-87.894h31.346l35.88,83.217v-83.217h34.435l27.61,59.625l25.365-59.625h35.126v87.894h-21.625l-0.079-68.837l-30.593,68.837h-18.524l-30.671-68.898v68.898H83.899l-8.106-19.605H31.865l-8.19,19.605H0.762v17.682h36.049l8.128-19.523h18.198l8.106,19.523h70.925V206.25l6.33,14.989h36.819L191.649,206.025z M469.401,125.849c6.818-7.015,17.5-10.25,32.039-10.25h20.424v18.833h-19.996c-7.696,0-12.047,1.14-16.233,5.208c-3.599,3.7-6.066,10.696-6.066,19.908c0,9.417,1.881,16.206,5.801,20.641c3.248,3.478,9.152,4.533,14.705,4.533h9.478l29.733-69.12h31.611l35.719,83.134v-83.133h32.123l37.086,61.213v-61.213h21.611v87.891h-29.898l-39.989-65.968v65.968h-42.968l-8.209-19.605h-43.827l-7.966,19.605h-24.688c-10.254,0-23.238-2.258-30.59-9.722c-7.416-7.462-11.271-17.571-11.271-33.553C458.026,147.182,460.329,135.266,469.401,125.849z M426.006,115.6h21.526v87.894h-21.526V115.6z M328.951,115.6h48.525c10.779,0,18.727,0.285,25.547,4.21c6.674,3.926,10.676,9.658,10.676,19.46c0,14.015-9.393,21.254-14.864,23.429c4.614,1.75,8.559,4.841,10.438,7.401c2.979,4.372,3.492,8.277,3.492,16.126v17.267h-21.279l-0.08-11.084c0-5.29,0.508-12.896-3.33-17.122c-3.082-3.09-7.782-3.763-15.379-3.763H350.05v31.97h-21.098L328.951,115.6L328.951,115.6z M243.902,115.6h70.479v18.303h-49.379v15.843h48.193v18.017h-48.193v17.553h49.379v18.177h-70.479V115.6L243.902,115.6z"/></g></g></svg>`;
    let visa_single = `<svg version="1.1" id="Layer_1" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="750px" height="471px" viewBox="0 0 750 471" enable-background="new 0 0 750 471" xml:space="preserve"><title>Slice 1</title><desc>Created with Sketch.</desc><g id="visa" sketch:type="MSLayerGroup"><path id="Shape" sketch:type="MSShapeGroup" fill="#0E4595" d="M278.198,334.228l33.36-195.763h53.358l-33.384,195.763H278.198L278.198,334.228z"/><path id="path13" sketch:type="MSShapeGroup" fill="#0E4595" d="M524.307,142.687c-10.57-3.966-27.135-8.222-47.822-8.222c-52.725,0-89.863,26.551-90.18,64.604c-0.297,28.129,26.514,43.821,46.754,53.185c20.77,9.597,27.752,15.716,27.652,24.283c-0.133,13.123-16.586,19.116-31.924,19.116c-21.355,0-32.701-2.967-50.225-10.274l-6.877-3.112l-7.488,43.823c12.463,5.466,35.508,10.199,59.438,10.445c56.09,0,92.502-26.248,92.916-66.884c0.199-22.27-14.016-39.216-44.801-53.188c-18.65-9.056-30.072-15.099-29.951-24.269c0-8.137,9.668-16.838,30.559-16.838c17.447-0.271,30.088,3.534,39.936,7.5l4.781,2.259L524.307,142.687"/><path id="Path" sketch:type="MSShapeGroup" fill="#0E4595" d="M661.615,138.464h-41.23c-12.773,0-22.332,3.486-27.941,16.234l-79.244,179.402h56.031c0,0,9.16-24.121,11.232-29.418c6.123,0,60.555,0.084,68.336,0.084c1.596,6.854,6.492,29.334,6.492,29.334h49.512L661.615,138.464L661.615,138.464z M596.198,264.872c4.414-11.279,21.26-54.724,21.26-54.724c-0.314,0.521,4.381-11.334,7.074-18.684l3.607,16.878c0,0,10.217,46.729,12.352,56.527h-44.293V264.872L596.198,264.872z"/><path id="path16" sketch:type="MSShapeGroup" fill="#0E4595" d="M232.903,138.464L180.664,271.96l-5.565-27.129c-9.726-31.274-40.025-65.157-73.898-82.12l47.767,171.204l56.455-0.064l84.004-195.386L232.903,138.464"/><path id="path18" sketch:type="MSShapeGroup" fill="#F2AE14" d="M131.92,138.464H45.879l-0.682,4.073c66.939,16.204,111.232,55.363,129.618,102.415l-18.709-89.96C152.877,142.596,143.509,138.896,131.92,138.464"/></g></svg>`;
    let diners_single = `<svg version="1.1" id="Layer_1" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="750" height="471" viewBox="0 0 750 471" enable-background="new 0 0 750 471" xml:space="preserve"><title>diners</title><desc>Created with Sketch.</desc><g id="diners" sketch:type="MSLayerGroup"><path id="Shape-path" sketch:type="MSShapeGroup" fill="#0079BE" d="M584.934,236.947c0-99.416-82.98-168.133-173.896-168.1h-78.241c-92.003-0.033-167.73,68.705-167.73,168.1c0,90.931,75.729,165.641,167.73,165.203h78.241C501.951,402.587,584.934,327.857,584.934,236.947L584.934,236.947z"/><path id="Shape-path_1_" sketch:type="MSShapeGroup" fill="#FFFFFF" d="M333.281,82.932c-84.069,0.026-152.193,68.308-152.215,152.58c0.021,84.258,68.145,152.532,152.215,152.559c84.088-0.026,152.229-68.301,152.239-152.559C485.508,151.238,417.369,82.958,333.281,82.932L333.281,82.932z"/><path id="Path" sketch:type="MSShapeGroup" fill="#0079BE" d="M237.066,235.098c0.08-41.18,25.747-76.296,61.94-90.25v180.479C262.813,311.381,237.145,276.283,237.066,235.098z M368.066,325.373V144.848c36.208,13.921,61.915,49.057,61.981,90.256C429.981,276.316,404.274,311.426,368.066,325.373z"/></g></svg>`;
    let discover_single = `<svg version="1.1" id="Layer_1" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="780px" height="501px" viewBox="0 0 780 501" enable-background="new 0 0 780 501" xml:space="preserve"><title>discover</title><desc>Created with Sketch.</desc><g id="Page-1" sketch:type="MSPage"><g id="discover" sketch:type="MSLayerGroup"><path fill="#F47216" d="M409.412,197.758c30.938,0,56.02,23.58,56.02,52.709v0.033c0,29.129-25.082,52.742-56.02,52.742c-30.941,0-56.022-23.613-56.022-52.742v-0.033C353.39,221.338,378.471,197.758,409.412,197.758L409.412,197.758z"/><path d="M321.433,198.438c8.836,0,16.247,1.785,25.269,6.09v22.752c-8.544-7.863-15.955-11.154-25.757-11.154c-19.265,0-34.413,15.015-34.413,34.051c0,20.074,14.681,34.195,35.368,34.195c9.313,0,16.586-3.12,24.802-10.856v22.764c-9.343,4.141-16.912,5.775-25.757,5.775c-31.277,0-55.581-22.597-55.581-51.737C265.363,221.49,290.314,198.438,321.433,198.438L321.433,198.438z"/><path d="M224.32,199.064c11.546,0,22.109,3.721,30.942,10.994l-10.748,13.248c-5.351-5.646-10.411-8.027-16.563-8.027c-8.854,0-15.301,4.745-15.301,10.988c0,5.354,3.618,8.188,15.944,12.482c23.364,8.043,30.289,15.176,30.289,30.926c0,19.193-14.976,32.554-36.319,32.554c-15.631,0-26.993-5.795-36.457-18.871l13.268-12.031c4.73,8.609,12.622,13.223,22.42,13.223c9.163,0,15.947-5.951,15.947-13.984c0-4.164-2.056-7.733-6.158-10.258c-2.066-1.195-6.158-2.977-14.199-5.646c-19.292-6.538-25.91-13.527-25.91-27.186C191.474,211.25,205.688,199.064,224.32,199.064L224.32,199.064z"/><polygon points="459.043,200.793 481.479,200.793 509.563,267.385 538.01,200.793 560.276,200.793 514.783,302.479 503.729,302.479 "/><polygon points="157.83,200.945 178.371,200.945 178.371,300.088 157.83,300.088 "/><polygon points="569.563,200.945 627.815,200.945 627.815,217.744 590.09,217.744 590.09,239.75 626.426,239.75 626.426,256.541 590.09,256.541 590.09,283.303 627.815,283.303 627.815,300.088 569.563,300.088 "/><path d="M685.156,258.322c15.471-2.965,23.984-12.926,23.984-28.105c0-18.562-13.576-29.271-37.266-29.271H641.42v99.143h20.516V260.26h2.68l28.43,39.828h25.26L685.156,258.322z M667.938,246.586h-6.002v-30.025h6.326c12.791,0,19.744,5.049,19.744,14.697C688.008,241.224,681.055,246.586,667.938,246.586z"/><path d="M91.845,200.945H61.696v99.143h29.992c15.946,0,27.465-3.543,37.573-11.445c12.014-9.36,19.117-23.467,19.117-38.057C148.379,221.327,125.157,200.945,91.845,200.945z M115.842,275.424c-6.454,5.484-14.837,7.879-28.108,7.879H82.22v-65.559h5.513c13.271,0,21.323,2.238,28.108,8.018c7.104,5.956,11.377,15.183,11.377,24.682C127.219,259.957,122.945,269.468,115.842,275.424z"/></g></g></svg>`;
    let jcb_single = `<svg version="1.1" id="Layer_1" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="750px" height="471px" viewBox="0 0 750 471" enable-background="new 0 0 750 471" xml:space="preserve"><title>Slice 1</title><desc>Created with Sketch.</desc><g><path id="path3494" sketch:type="MSShapeGroup" fill="#FFFFFF" d="M617.242,346.766c0,41.615-33.729,75.36-75.357,75.36H132.759V124.245c0-41.626,33.73-75.371,75.364-75.371h409.12V346.766L617.242,346.766L617.242,346.766z"/><linearGradient id="path3496_1_" gradientUnits="userSpaceOnUse" x1="824.7424" y1="333.7813" x2="825.7424" y2="333.7813" gradientTransform="matrix(132.8743 0 0 -323.0226 -109129.5313 108054.6016)"><stop offset="0" style="stop-color:#007B40"/><stop offset="1" style="stop-color:#55B330"/></linearGradient><path id="path3496" sketch:type="MSShapeGroup" fill="url(#path3496_1_)" d="M483.86,242.045c11.686,0.254,23.439-0.516,35.078,0.4c11.787,2.199,14.627,20.043,4.156,25.887c-7.145,3.85-15.633,1.434-23.379,2.113H483.86V242.045L483.86,242.045z M525.694,209.9c2.596,9.164-6.238,17.392-15.064,16.13h-26.77c0.188-8.642-0.367-18.022,0.273-26.209c10.723,0.302,21.547-0.616,32.209,0.48C520.922,201.452,524.756,205.218,525.694,209.9L525.694,209.9z M590.119,73.997c0.498,17.501,0.072,35.927,0.215,53.783c-0.033,72.596,0.07,145.195-0.057,217.789c-0.469,27.207-24.582,50.847-51.6,51.39c-27.045,0.11-54.094,0.017-81.143,0.047v-109.75c29.471-0.153,58.957,0.308,88.416-0.231c13.666-0.858,28.635-9.875,29.271-24.914c1.609-15.103-12.631-25.551-26.152-27.201c-5.197-0.135-5.045-1.515,0-2.117c12.895-2.787,23.021-16.133,19.227-29.499c-3.234-14.058-18.771-19.499-31.695-19.472c-26.352-0.179-52.709-0.025-79.063-0.077c0.17-20.489-0.355-41,0.283-61.474c2.088-26.716,26.807-48.748,53.447-48.27C537.555,73.998,563.838,73.998,590.119,73.997L590.119,73.997z"/><linearGradient id="path3498_1_" gradientUnits="userSpaceOnUse" x1="824.7551" y1="333.7822" x2="825.7484" y2="333.7822" gradientTransform="matrix(133.4307 0 0 -323.0203 -109887.6875 108053.8203)"><stop offset="0" style="stop-color:#1D2970"/><stop offset="1" style="stop-color:#006DBA"/></linearGradient><path id="path3498" sketch:type="MSShapeGroup" fill="url(#path3498_1_)" d="M159.742,125.041c0.673-27.164,24.888-50.611,51.872-51.008c26.945-0.083,53.894-0.012,80.839-0.036c-0.074,90.885,0.146,181.776-0.111,272.657c-1.038,26.834-24.989,49.834-51.679,50.309c-26.996,0.098-53.995,0.014-80.992,0.041V283.551c26.223,6.195,53.722,8.832,80.474,4.723c15.991-2.574,33.487-10.426,38.901-27.016c3.984-14.191,1.741-29.126,2.334-43.691v-33.825h-46.297c-0.208,22.371,0.426,44.781-0.335,67.125c-1.248,13.734-14.849,22.46-27.802,21.994c-16.064,0.17-47.897-11.641-47.897-11.641C158.969,219.305,159.515,166.814,159.742,125.041L159.742,125.041z"/><linearGradient id="path3500_1_" gradientUnits="userSpaceOnUse" x1="824.7424" y1="333.7813" x2="825.741" y2="333.7813" gradientTransform="matrix(132.9583 0 0 -323.0276 -109347.9219 108056.2656)"><stop offset="0" style="stop-color:#6E2B2F"/><stop offset="1" style="stop-color:#E30138"/></linearGradient><path id="path3500" sketch:type="MSShapeGroup" fill="url(#path3500_1_)" d="M309.721,197.39c-2.437,0.517-0.491-8.301-1.114-11.646c0.166-21.15-0.346-42.323,0.284-63.458c2.082-26.829,26.991-48.916,53.738-48.288h78.767c-0.074,90.885,0.145,181.775-0.111,272.657c-1.039,26.834-24.992,49.833-51.682,50.309c-26.998,0.101-53.998,0.015-80.997,0.042V272.707c18.44,15.129,43.5,17.484,66.472,17.525c17.318-0.006,34.535-2.676,51.353-6.67V260.79c-18.953,9.446-41.234,15.446-62.244,10.019c-14.656-3.649-25.294-17.813-25.057-32.937c-1.698-15.729,7.522-32.335,22.979-37.011c19.192-6.008,40.108-1.413,58.096,6.398c3.855,2.018,7.766,4.521,6.225-1.921v-17.899c-30.086-7.158-62.104-9.792-92.33-2.005C325.352,187.902,316.828,191.645,309.721,197.39L309.721,197.39z"/></g></svg>`;
    let maestro_single = `<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" width="482.6" height="374.31" viewBox="0 0 482.6 374.31"> <title>maestro</title> <g> <path d="M278.8,421.77V397c0-9.35-6-15.64-15.55-15.72-5-.08-10.26,1.49-13.9,7-2.73-4.38-7-7-13.07-7a13.08,13.08,0,0,0-11.58,5.87v-4.88h-8.61v39.55h8.69V399.85c0-6.87,3.81-10.51,9.68-10.51,5.71,0,8.61,3.72,8.61,10.42v22h8.69V399.85c0-6.87,4-10.51,9.68-10.51,5.87,0,8.69,3.72,8.69,10.42v22ZM327.28,402V382.23h-8.61V387c-2.73-3.56-6.87-5.79-12.49-5.79-11.09,0-19.77,8.69-19.77,20.77s8.69,20.77,19.77,20.77c5.63,0,9.76-2.23,12.49-5.79v4.8h8.61Zm-32,0c0-6.95,4.55-12.66,12-12.66,7.12,0,11.91,5.46,11.91,12.66s-4.8,12.66-11.91,12.66C299.81,414.66,295.26,408.95,295.26,402ZM511.4,381.19a22.29,22.29,0,0,1,8.49,1.59,20.71,20.71,0,0,1,6.75,4.38,20,20,0,0,1,4.46,6.59,22,22,0,0,1,0,16.52,20,20,0,0,1-4.46,6.59,20.69,20.69,0,0,1-6.75,4.38,23.43,23.43,0,0,1-17,0,20.47,20.47,0,0,1-6.73-4.38,20.21,20.21,0,0,1-4.44-6.59,22,22,0,0,1,0-16.52,20.23,20.23,0,0,1,4.44-6.59,20.48,20.48,0,0,1,6.73-4.38A22.29,22.29,0,0,1,511.4,381.19Zm0,8.14a12.84,12.84,0,0,0-4.91.93,11.62,11.62,0,0,0-3.92,2.6,12.13,12.13,0,0,0-2.6,4,14.39,14.39,0,0,0,0,10.28,12.11,12.11,0,0,0,2.6,4,11.62,11.62,0,0,0,3.92,2.6,13.46,13.46,0,0,0,9.83,0,11.86,11.86,0,0,0,3.94-2.6,12,12,0,0,0,2.62-4,14.39,14.39,0,0,0,0-10.28,12,12,0,0,0-2.62-4,11.86,11.86,0,0,0-3.94-2.6A12.84,12.84,0,0,0,511.4,389.32ZM374.1,402c-.08-12.33-7.69-20.77-18.78-20.77-11.58,0-19.69,8.44-19.69,20.77,0,12.58,8.44,20.77,20.27,20.77,6,0,11.42-1.49,16.22-5.54l-4.22-6.37A18.84,18.84,0,0,1,356.4,415c-5.54,0-10.59-2.56-11.83-9.68h29.37C374,404.23,374.1,403.16,374.1,402Zm-29.45-3.47c.91-5.71,4.38-9.6,10.51-9.6,5.54,0,9.1,3.47,10,9.6Zm65.69-6.2A25.49,25.49,0,0,0,398,388.93c-4.72,0-7.53,1.74-7.53,4.63,0,2.65,3,3.39,6.7,3.89l4.05.58c8.61,1.24,13.82,4.88,13.82,11.83,0,7.53-6.62,12.91-18,12.91-6.45,0-12.41-1.66-17.13-5.13l4.05-6.7a21.07,21.07,0,0,0,13.16,4.14c5.87,0,9-1.74,9-4.8,0-2.23-2.23-3.47-6.95-4.14l-4.05-.58c-8.85-1.24-13.65-5.21-13.65-11.67,0-7.86,6.45-12.66,16.46-12.66,6.29,0,12,1.41,16.13,4.14Zm41.35-2.23H437.62V408c0,4,1.41,6.62,5.71,6.62a15.89,15.89,0,0,0,7.61-2.23l2.48,7.36a20.22,20.22,0,0,1-10.76,3.06c-10.18,0-13.73-5.46-13.73-14.65v-18h-8v-7.86h8v-12h8.69v12h14.06Zm29.78-8.85a18.38,18.38,0,0,1,6.12,1.08l-2.65,8.11a14,14,0,0,0-5.38-1c-5.63,0-8.44,3.64-8.44,10.18v22.17h-8.6V382.23H471V387a11.66,11.66,0,0,1,10.42-5.79Z" transform="translate(-132.9 -48.5)"/> <g id="_Group_" data-name="&lt;Group&gt;"> <rect x="176.05" y="31.89" width="130.5" height="234.51" fill="#7673c0"/> <path id="_Path_" data-name="&lt;Path&gt;" d="M317.24,197.64a148.88,148.88,0,0,1,57-117.26,149.14,149.14,0,1,0,0,234.51A148.88,148.88,0,0,1,317.24,197.64Z" transform="translate(-132.9 -48.5)" fill="#eb001b"/> <path d="M615.5,197.64A149.14,149.14,0,0,1,374.2,314.9a149.16,149.16,0,0,0,0-234.51A149.14,149.14,0,0,1,615.5,197.64Z" transform="translate(-132.9 -48.5)" fill="#00a1df"/> </g> </g></svg>`;
    let mastercard_single = `<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" width="482.51" height="374" viewBox="0 0 482.51 374"> <title>mastercard</title> <g> <path d="M220.13,421.67V396.82c0-9.53-5.8-15.74-15.32-15.74-5,0-10.35,1.66-14.08,7-2.9-4.56-7-7-13.25-7a14.07,14.07,0,0,0-12,5.8v-5h-7.87v39.76h7.87V398.89c0-7,4.14-10.35,9.94-10.35s9.11,3.73,9.11,10.35v22.78h7.87V398.89c0-7,4.14-10.35,9.94-10.35s9.11,3.73,9.11,10.35v22.78Zm129.22-39.35h-14.5v-12H327v12h-8.28v7H327V408c0,9.11,3.31,14.5,13.25,14.5A23.17,23.17,0,0,0,351,419.6l-2.49-7a13.63,13.63,0,0,1-7.46,2.07c-4.14,0-6.21-2.49-6.21-6.63V389h14.5v-6.63Zm73.72-1.24a12.39,12.39,0,0,0-10.77,5.8v-5h-7.87v39.76h7.87V399.31c0-6.63,3.31-10.77,8.7-10.77a24.24,24.24,0,0,1,5.38.83l2.49-7.46a28,28,0,0,0-5.8-.83Zm-111.41,4.14c-4.14-2.9-9.94-4.14-16.15-4.14-9.94,0-16.15,4.56-16.15,12.43,0,6.63,4.56,10.35,13.25,11.6l4.14.41c4.56.83,7.46,2.49,7.46,4.56,0,2.9-3.31,5-9.53,5a21.84,21.84,0,0,1-13.25-4.14l-4.14,6.21c5.8,4.14,12.84,5,17,5,11.6,0,17.81-5.38,17.81-12.84,0-7-5-10.35-13.67-11.6l-4.14-.41c-3.73-.41-7-1.66-7-4.14,0-2.9,3.31-5,7.87-5,5,0,9.94,2.07,12.43,3.31Zm120.11,16.57c0,12,7.87,20.71,20.71,20.71,5.8,0,9.94-1.24,14.08-4.56l-4.14-6.21a16.74,16.74,0,0,1-10.35,3.73c-7,0-12.43-5.38-12.43-13.25S445,389,452.07,389a16.74,16.74,0,0,1,10.35,3.73l4.14-6.21c-4.14-3.31-8.28-4.56-14.08-4.56-12.43-.83-20.71,7.87-20.71,19.88h0Zm-55.5-20.71c-11.6,0-19.47,8.28-19.47,20.71s8.28,20.71,20.29,20.71a25.33,25.33,0,0,0,16.15-5.38l-4.14-5.8a19.79,19.79,0,0,1-11.6,4.14c-5.38,0-11.18-3.31-12-10.35h29.41v-3.31c0-12.43-7.46-20.71-18.64-20.71h0Zm-.41,7.46c5.8,0,9.94,3.73,10.35,9.94H364.68c1.24-5.8,5-9.94,11.18-9.94ZM268.59,401.79V381.91h-7.87v5c-2.9-3.73-7-5.8-12.84-5.8-11.18,0-19.47,8.7-19.47,20.71s8.28,20.71,19.47,20.71c5.8,0,9.94-2.07,12.84-5.8v5h7.87V401.79Zm-31.89,0c0-7.46,4.56-13.25,12.43-13.25,7.46,0,12,5.8,12,13.25,0,7.87-5,13.25-12,13.25-7.87.41-12.43-5.8-12.43-13.25Zm306.08-20.71a12.39,12.39,0,0,0-10.77,5.8v-5h-7.87v39.76H532V399.31c0-6.63,3.31-10.77,8.7-10.77a24.24,24.24,0,0,1,5.38.83l2.49-7.46a28,28,0,0,0-5.8-.83Zm-30.65,20.71V381.91h-7.87v5c-2.9-3.73-7-5.8-12.84-5.8-11.18,0-19.47,8.7-19.47,20.71s8.28,20.71,19.47,20.71c5.8,0,9.94-2.07,12.84-5.8v5h7.87V401.79Zm-31.89,0c0-7.46,4.56-13.25,12.43-13.25,7.46,0,12,5.8,12,13.25,0,7.87-5,13.25-12,13.25-7.87.41-12.43-5.8-12.43-13.25Zm111.83,0V366.17h-7.87v20.71c-2.9-3.73-7-5.8-12.84-5.8-11.18,0-19.47,8.7-19.47,20.71s8.28,20.71,19.47,20.71c5.8,0,9.94-2.07,12.84-5.8v5h7.87V401.79Zm-31.89,0c0-7.46,4.56-13.25,12.43-13.25,7.46,0,12,5.8,12,13.25,0,7.87-5,13.25-12,13.25C564.73,415.46,560.17,409.25,560.17,401.79Z" transform="translate(-132.74 -48.5)"/> <g> <rect x="169.81" y="31.89" width="143.72" height="234.42" fill="#ff5f00"/> <path d="M317.05,197.6A149.5,149.5,0,0,1,373.79,80.39a149.1,149.1,0,1,0,0,234.42A149.5,149.5,0,0,1,317.05,197.6Z" transform="translate(-132.74 -48.5)" fill="#eb001b"/> <path d="M615.26,197.6a148.95,148.95,0,0,1-241,117.21,149.43,149.43,0,0,0,0-234.42,148.95,148.95,0,0,1,241,117.21Z" transform="translate(-132.74 -48.5)" fill="#f79e1b"/> </g> </g></svg>`;
    let unionpay_single = `<svg xmlns="http://www.w3.org/2000/svg" width="750" height="471" viewBox="0 0 750 471"> <g fill="none" fill-rule="evenodd"> <rect width="750" height="471" rx="40"/> <path fill="#D10429" d="M201.809581,55 L344.203266,55 C364.072152,55 376.490206,71.4063861 371.833436,91.4702467 L305.500331,378.94775 C300.843561,399.011611 280.871191,415.417997 261.002305,415.417997 L118.60862,415.417997 C98.7397339,415.417997 86.32168,399.011611 90.9784502,378.94775 L157.311555,91.4702467 C161.968325,71.3018868 181.837211,55 201.706097,55 L201.809581,55 Z"/> <path fill="#022E64" d="M331.750074,55 L495.564902,55 C515.433788,55 506.430699,71.4063861 501.773929,91.4702467 L435.440824,378.94775 C430.784054,399.011611 432.232827,415.417997 412.363941,415.417997 L248.549113,415.417997 C228.576743,415.417997 216.262173,399.011611 221.022427,378.94775 L287.355531,91.4702467 C292.012302,71.3018868 311.881188,55 331.853558,55 L331.750074,55 Z"/> <path fill="#076F74" d="M489.814981,55 L632.208666,55 C652.077552,55 664.495606,71.4063861 659.838836,91.4702467 L593.505731,378.94775 C588.848961,399.011611 568.876591,415.417997 549.007705,415.417997 L406.61402,415.417997 C386.64165,415.417997 374.32708,399.011611 378.98385,378.94775 L445.316955,91.4702467 C449.973725,71.3018868 469.842611,55 489.711498,55 L489.814981,55 Z"/> <path fill="#FEFEFE" d="M465.904754,326.014514 L479.357645,326.014514 L483.186545,312.952104 L469.837137,312.952104 L465.904754,326.014514 L465.904754,326.014514 Z M476.667067,290.066763 L476.667067,290.066763 L472.010297,305.532656 C472.010297,305.532656 477.081002,302.920174 479.875064,302.08418 C482.669126,301.457184 486.808478,300.934688 486.808478,300.934688 L490.016475,290.171263 L476.563583,290.171263 L476.667067,290.066763 Z M483.393513,267.912917 L483.393513,267.912917 L478.94371,282.751814 C478.94371,282.751814 483.910932,280.45283 486.704994,279.721335 C489.499056,278.98984 493.638407,278.780842 493.638407,278.780842 L496.846405,268.017417 L483.496997,268.017417 L483.393513,267.912917 Z M513.093359,267.912917 L513.093359,267.912917 L495.708083,325.910015 L500.364853,325.910015 L496.742921,337.927431 L492.086151,337.927431 L490.947829,341.584906 L474.390424,341.584906 L475.528745,337.927431 L442,337.927431 L445.311481,326.850508 L448.726446,326.850508 L466.318689,267.912917 L469.837137,256 L486.704994,256 L484.94577,261.956459 C484.94577,261.956459 489.395572,258.716981 493.741891,257.567489 C497.984726,256.417997 522.406899,256 522.406899,256 L518.784967,267.808418 L512.989875,267.808418 L513.093359,267.912917 Z"/> <path fill="#FEFEFE" d="M520 256L538.006178 256 538.213146 262.792453C538.109662 263.941945 539.041016 264.464441 541.214175 264.464441L544.836108 264.464441 541.524627 275.645864 531.797151 275.645864C523.414965 276.272859 520.206968 272.615385 520.413935 268.539913L520.103484 256.104499 520 256zM522.216235 309.20029L505.037927 309.20029 507.935473 299.272859 527.597391 299.272859 530.391454 290.181422 511.039986 290.181422 514.351467 279 568.163034 279 564.851553 290.181422 546.741891 290.181422 543.947829 299.272859 562.057491 299.272859 559.056461 309.20029 539.498026 309.20029 535.979578 313.380261 543.947829 313.380261 545.914021 325.920174C546.120989 327.174165 546.120989 328.01016 546.534924 328.532656 546.948859 328.950653 549.328986 329.159652 550.674275 329.159652L553.054402 329.159652 549.328986 341.386067 543.223443 341.386067C542.292089 341.386067 540.843316 341.281567 538.877124 341.281567 537.014416 341.072569 535.77261 340.027576 534.530805 339.400581 533.392483 338.878084 531.736743 337.519594 531.322808 335.11611L529.4601 322.576197 520.560494 334.907112C517.766432 338.773585 513.937532 341.804064 507.418054 341.804064L495 341.804064 498.311481 330.936139 503.071735 330.936139C504.417024 330.936139 505.65883 330.413643 506.590184 329.891147 507.521538 329.473149 508.349408 329.055152 509.177278 327.696662L522.216235 309.20029 522.216235 309.20029zM334.31354 282L379.742921 282 376.43144 292.972424 358.321778 292.972424 355.527716 302.272859 374.154797 302.272859 370.739832 313.558781 352.216235 313.558781 347.662948 328.711176C347.145529 330.383164 352.112751 330.592163 353.871975 330.592163L363.185516 329.338171 359.4601 341.878084 338.556375 341.878084C336.900635 341.878084 335.65883 341.669086 333.796122 341.251089 332.036897 340.833091 331.209027 339.997097 330.48464 338.847605 329.760254 337.593614 328.518449 336.65312 329.346319 333.936139L335.348378 313.872279 325 313.872279 328.414965 302.377358 338.763343 302.377358 341.557405 293.076923 331.209027 293.076923 334.520508 282.104499 334.31354 282zM365.700875 262.165457L384.327956 262.165457 380.912991 273.555878 355.455981 273.555878 352.661919 275.959361C351.420113 277.108853 351.109662 276.690856 349.557405 277.526851 348.108632 278.258345 345.107603 279.721335 341.175219 279.721335L333 279.721335 336.311481 268.748911 338.795092 268.748911C340.864767 268.748911 342.31354 268.539913 343.037927 268.121916 343.865797 267.599419 344.797151 266.449927 345.728505 264.56894L350.385275 256 368.908872 256 365.700875 262.269956 365.700875 262.165457zM400.808726 280.975327C400.808726 280.975327 405.879431 276.272859 414.572069 274.809869 416.538261 274.391872 428.956314 274.600871 428.956314 274.600871L430.819023 268.330914 404.637626 268.330914 400.808726 281.079826 400.808726 280.975327zM425.437866 285.782293L425.437866 285.782293 399.463436 285.782293 397.91118 291.111756 420.470644 291.111756C423.161223 290.798258 423.678642 291.216255 423.885609 291.007257L425.54135 285.782293 425.437866 285.782293zM391.702153 256.104499L391.702153 256.104499 407.535171 256.104499 405.258528 264.150943C405.258528 264.150943 410.22575 260.075472 413.744198 258.612482 417.262647 257.358491 425.127414 256.104499 425.127414 256.104499L450.791393 256 441.995271 285.468795C440.546498 290.484761 438.787274 293.724238 437.752436 295.291727 436.821082 296.754717 435.68276 298.113208 433.406117 299.367199 431.232958 300.516691 429.266766 301.248186 427.404058 301.352685 425.748317 301.457184 423.057739 301.561684 419.53929 301.561684L394.806666 301.561684 387.873253 324.865022C387.25235 327.164006 386.941899 328.313498 387.355834 328.940493 387.666285 329.46299 388.597639 330.089985 389.735961 330.089985L400.601758 329.044993 396.876342 341.793904 384.665256 341.793904C380.732872 341.793904 377.93881 341.689405 375.972618 341.584906 374.10991 341.375907 372.143718 341.584906 370.798429 340.539913 369.660107 339.49492 367.900883 338.13643 368.004367 336.777939 368.10785 335.523948 368.625269 333.433962 369.45314 330.507983L391.702153 256.104499 391.702153 256.104499z"/> <path fill="#FEFEFE" d="M437.840227 303L436.391454 310.105951C435.770551 312.300435 435.253132 313.972424 433.597391 315.435414 431.838167 316.898403 429.871975 318.465893 425.111721 318.465893L416.3156 318.88389 416.212116 326.825835C416.108632 329.020319 416.729535 328.811321 417.039986 329.229318 417.453921 329.647315 417.764373 329.751814 418.178308 329.960813L420.97237 329.751814 429.354556 329.333817 425.836108 341.037736 416.212116 341.037736C409.48567 341.037736 404.414965 340.828737 402.862708 339.574746 401.206968 338.529753 401 337.275762 401 334.976778L401.620903 303.835994 417.039986 303.835994 416.833019 310.21045 420.558435 310.21045C421.80024 310.21045 422.731594 310.105951 423.249013 309.792453 423.766432 309.478955 424.076883 308.956459 424.283851 308.224964L425.836108 303.208999 437.94371 303.208999 437.840227 303zM218.470396 147C217.952978 149.507983 208.018534 195.592163 208.018534 195.592163 205.845375 204.892598 204.293118 211.580552 199.118929 215.865022 196.117899 218.373004 192.599451 219.522496 188.563583 219.522496 182.044105 219.522496 178.318689 216.283019 177.697786 210.117562L177.594302 208.027576C177.594302 208.027576 179.560494 195.592163 179.560494 195.487663 179.560494 195.487663 189.908872 153.478955 191.771581 147.940493 191.875064 147.626996 191.875064 147.417997 191.875064 147.313498 171.695727 147.522496 168.073794 147.313498 167.866827 147 167.763343 147.417997 167.245924 150.030479 167.245924 150.030479L156.690578 197.36865 155.759224 201.339623 154 214.506531C154 218.373004 154.724386 221.612482 156.276643 224.224964 161.140381 232.793904 174.903724 234.047896 182.665008 234.047896 192.702935 234.047896 202.119959 231.853411 208.43247 227.986938 219.505234 221.403483 222.40278 211.058055 224.886391 201.966618L226.128196 197.264151C226.128196 197.264151 236.787026 153.687954 238.649734 148.044993 238.753218 147.731495 238.753218 147.522496 238.856702 147.417997 224.162004 147.522496 219.919169 147.417997 218.470396 147.104499L218.470396 147zM277.499056 233.622642C270.358675 233.518142 267.771581 233.518142 259.389394 233.936139L259.078943 233.309144C259.803329 230.069666 260.6312 226.934688 261.252102 223.69521L262.28694 219.306241C263.839197 212.513788 265.28797 204.467344 265.494937 202.063861 265.701905 200.600871 266.11584 196.943396 261.976489 196.943396 260.217264 196.943396 258.45804 197.77939 256.595332 198.615385 255.560494 202.272859 253.594302 212.513788 252.559465 217.111756 250.489789 226.934688 250.386305 228.08418 249.454951 232.891147L248.834048 233.518142C241.4867 233.413643 238.899605 233.413643 230.413935 233.83164L230 233.100145C231.448773 227.248186 232.794062 221.396226 234.139351 215.544267 237.6578 199.764877 238.589154 193.703919 239.520508 185.657475L240.244894 185.239478C248.523597 184.089985 250.489789 183.776488 259.492878 182L260.217264 182.835994 258.871975 187.851959C260.424232 186.911466 261.873005 185.970972 263.425262 185.239478 267.668097 183.149492 272.324867 182.522496 274.911962 182.522496 278.844345 182.522496 283.190664 183.671988 284.949888 188.269956 286.605629 192.345428 285.570791 197.361393 283.294148 207.288824L282.155826 212.30479C279.879183 223.381713 279.465248 225.367199 278.223443 232.891147L277.395572 233.518142 277.499056 233.622642zM306.558435 233.650218C302.212116 233.650218 299.418054 233.545718 296.727476 233.650218 294.036897 233.650218 291.449803 233.859216 287.413935 233.963716L287.206968 233.650218 287 233.232221C288.138322 229.05225 288.655741 227.58926 289.276643 226.12627 289.794062 224.66328 290.311481 223.20029 291.346319 218.91582 292.588124 213.377358 293.415995 209.510885 293.933413 206.062409 294.554316 202.822932 294.864767 200.001451 295.278703 196.761974L295.589154 196.552975 295.899605 196.239478C300.245924 195.612482 302.936502 195.194485 305.730565 194.776488 308.524627 194.358491 311.422173 193.835994 315.871975 193L316.078943 193.417997 316.182427 193.835994C315.354556 197.28447 314.526686 200.732946 313.698816 204.181422 312.870946 207.629898 312.043075 211.078374 311.318689 214.526851 309.766432 221.8418 309.042046 224.558781 308.731594 226.544267 308.317659 228.425254 308.214175 229.365747 307.593273 233.127721L307.179338 233.441219 306.765402 233.754717 306.558435 233.650218zM352.499319 207.975327C352.188868 209.856313 350.533127 216.857765 348.359968 219.783745 346.807711 221.978229 345.048487 223.33672 342.978811 223.33672 342.357909 223.33672 338.83946 223.33672 338.735976 218.007257 338.735976 215.394775 339.253395 212.677794 339.874298 209.751814 341.737006 201.287373 344.013649 194.285922 349.705257 194.285922 354.15506 194.285922 354.465511 199.510885 352.499319 207.975327L352.499319 207.975327zM371.229884 208.811321L371.229884 208.811321C373.713495 197.734398 371.747303 192.509434 369.367176 189.374456 365.64176 184.567489 359.018798 183 352.188868 183 348.049517 183 338.322041 183.417997 330.664241 190.523948 325.179601 195.644412 322.592506 202.645864 321.143733 209.333817 319.591476 216.12627 317.832252 228.352685 329.008501 232.950653 332.423466 234.413643 337.390687 234.83164 340.598684 234.83164 348.773903 234.83164 357.156089 232.532656 363.4686 225.844702 368.332338 220.41074 370.505497 212.259797 371.333368 208.811321L371.229884 208.811321zM545.661919 234.891147C536.969281 234.786647 534.48567 234.786647 526.517419 235.204644L526 234.577649C528.173159 226.322206 530.346319 217.962264 532.312511 209.602322 534.796122 198.734398 535.417024 194.13643 536.244894 187.761974L536.865797 187.239478C545.454951 185.985486 547.835078 185.671988 556.838167 184L557.045135 184.731495C555.389394 191.628447 553.837137 198.4209 552.181397 205.213353 548.869916 219.529753 547.731594 226.844702 546.489789 234.36865L545.661919 234.995646 545.661919 234.891147z"/> <path fill="#FEFEFE" d="M533.159909 209.373777C532.745974 211.150265 531.090233 218.256216 528.917074 221.182195 527.468301 223.272181 523.949852 224.630672 521.983661 224.630672 521.362758 224.630672 517.947793 224.630672 517.740826 219.405708 517.740826 216.793226 518.258244 214.076245 518.879147 211.150265 520.741855 202.894822 523.018498 195.893371 528.710106 195.893371 533.159909 195.893371 535.126101 201.013836 533.159909 209.478277L533.159909 209.373777zM550.234733 210.209772L550.234733 210.209772C552.718344 199.132849 542.576933 209.269278 541.024677 205.611804 538.541066 199.864344 540.093322 188.369423 530.158879 184.50295 526.329979 182.935461 517.32689 184.920947 509.66909 192.026898 504.287934 197.042863 501.597355 204.044315 500.148582 210.732268 498.596326 217.420222 496.837101 229.751136 507.909866 234.035606 511.428315 235.603095 514.636312 236.021092 517.844309 235.812094 529.020558 235.185098 537.506228 218.151717 543.818739 211.463763 548.682476 206.1343 549.510347 213.449249 550.234733 210.209772L550.234733 210.209772zM420.292089 233.622642C413.151708 233.518142 410.668097 233.518142 402.28591 233.936139L401.975459 233.309144C402.699846 230.069666 403.527716 226.934688 404.252102 223.69521L405.183456 219.306241C406.735713 212.513788 408.28797 204.467344 408.391454 202.063861 408.598421 200.600871 409.012356 196.943396 404.976489 196.943396 403.217264 196.943396 401.354556 197.77939 399.595332 198.615385 398.663978 202.272859 396.594302 212.513788 395.559465 217.111756 393.593273 226.934688 393.386305 228.08418 392.454951 232.891147L391.834048 233.518142C384.4867 233.413643 381.899605 233.413643 373.413935 233.83164L373 233.100145C374.448773 227.248186 375.794062 221.396226 377.139351 215.544267 380.6578 199.764877 381.48567 193.703919 382.520508 185.657475L383.141411 185.239478C391.420113 184.089985 393.489789 183.776488 402.389394 182L403.113781 182.835994 401.871975 187.851959C403.320748 186.911466 404.873005 185.970972 406.321778 185.239478 410.564613 183.149492 415.221383 182.522496 417.808478 182.522496 421.740862 182.522496 425.983697 183.671988 427.846405 188.269956 429.502145 192.345428 428.363824 197.361393 426.08718 207.288824L424.948859 212.30479C422.568732 223.381713 422.25828 225.367199 421.016475 232.891147L420.188605 233.518142 420.292089 233.622642zM482.293118 147.104499L476.291059 147.208999C460.768492 147.417997 454.559465 147.313498 452.075854 147 451.868886 148.149492 451.454951 150.134978 451.454951 150.134978 451.454951 150.134978 445.866827 176.050798 445.866827 176.155298 445.866827 176.155298 432.620903 231.330914 432 233.943396 445.556375 233.734398 451.041016 233.734398 453.421143 234.047896 453.938562 231.435414 457.043075 216.07402 457.146559 216.07402 457.146559 216.07402 459.837137 204.788099 459.940621 204.370102 459.940621 204.370102 460.768492 203.22061 461.596362 202.698113L462.838167 202.698113C474.531835 202.698113 487.674275 202.698113 498.022653 195.069666 505.05955 189.844702 509.819804 182.007257 511.992964 172.602322 512.510383 170.303338 512.924318 167.586357 512.924318 164.764877 512.924318 161.107402 512.199931 157.554427 510.130256 154.732946 504.852583 147.313498 494.400721 147.208999 482.293118 147.104499L482.293118 147.104499zM490.054402 174.169811L490.054402 174.169811C488.812597 179.917271 485.08718 184.828737 480.326926 187.127721 476.394543 189.113208 471.634289 189.322206 466.667067 189.322206L463.45907 189.322206 463.666037 188.068215C463.666037 188.068215 469.564613 162.152395 469.564613 162.256894L469.771581 160.898403 469.875064 159.853411 472.255191 160.062409C472.255191 160.062409 484.466278 161.107402 484.673245 161.107402 489.433499 162.988389 491.503175 167.795356 490.054402 174.169811L490.054402 174.169811zM617.261369 182.835994L616.536983 182C607.740862 183.776488 606.085121 184.089985 598.013386 185.239478L597.392483 185.866473C597.392483 185.970972 597.288999 186.075472 597.288999 186.28447L597.288999 186.179971C591.28694 200.287373 591.390424 197.256894 586.526686 208.333817 586.526686 207.811321 586.526686 207.497823 586.423202 206.975327L585.181397 182.940493 584.45701 182.104499C575.14347 183.880987 574.936502 184.194485 566.450832 185.343977L565.82993 185.970972C565.726446 186.28447 565.726446 186.597968 565.726446 186.911466L565.82993 187.015965C566.864767 192.554427 566.6578 191.300435 567.692638 199.973875 568.210057 204.258345 568.830959 208.542816 569.348378 212.722787 570.176248 219.828737 570.693667 223.277213 571.728505 234.040639 565.933413 243.654572 564.588124 247.312046 559 255.776488L559.310451 256.612482C567.692638 256.298984 569.555346 256.298984 575.764373 256.298984L577.109662 254.731495C581.766432 244.595065 617.364853 182.940493 617.364853 182.940493L617.261369 182.835994zM314.543608 189.75837C319.303862 186.414394 319.924765 181.816425 315.888897 179.412942 311.85303 177.009459 304.712649 177.740954 299.952395 181.084931 295.192141 184.324408 294.674722 188.922376 298.71059 191.430359 302.642973 193.729343 309.783354 193.102347 314.543608 189.75837L314.543608 189.75837z"/> <path fill="#FEFEFE" d="M575.734683,256.104499 L568.80127,268.121916 C566.628111,272.197388 562.488759,275.332366 556.072765,275.332366 L545,275.123367 L548.207997,264.255443 L550.381157,264.255443 C551.519478,264.255443 552.347349,264.150943 552.968251,263.837446 C553.589154,263.628447 553.899605,263.21045 554.417024,262.583454 L558.556375,256 L575.838167,256 L575.734683,256.104499 Z"/> </g></svg>`;

    //define the color swap function
    const swapColor = function (basecolor) {
        document.querySelectorAll('.lightcolor')
            .forEach(function (input) {
                input.setAttribute('class', '');
                input.setAttribute('class', 'lightcolor ' + basecolor);
            });
        document.querySelectorAll('.darkcolor')
            .forEach(function (input) {
                input.setAttribute('class', '');
                input.setAttribute('class', 'darkcolor ' + basecolor + 'dark');
            });
    };

    //pop in the appropriate card icon when detected
    cardnumber_mask.on("accept", function () {
        console.log(cardnumber_mask.masked.currentMask.cardtype);
        switch (cardnumber_mask.masked.currentMask.cardtype) {
            case 'american express': 
                ccsingle.innerHTML = amex_single;
                swapColor('green');
                break;
            case 'visa': 
                ccsingle.innerHTML = visa_single;
                swapColor('lime');
                break;
            case 'diners': 
                ccsingle.innerHTML = diners_single;
                swapColor('orange');
                break;
            case 'discover': 
                ccsingle.innerHTML = discover_single;
                swapColor('purple');
                break;
            case ('jcb' || 'jcb15'): 
                ccsingle.innerHTML = jcb_single;
                swapColor('red');
                break;
            case 'maestro': 
                ccsingle.innerHTML = maestro_single;
                swapColor('yellow');
                break;
            case 'mastercard': 
                ccsingle.innerHTML = mastercard_single;
                swapColor('lightblue');

                break;
            case 'unionpay': 
                ccsingle.innerHTML = unionpay_single;
                swapColor('cyan');
                break;
            default: 
                ccsingle.innerHTML = '';
                swapColor('grey');
                break;
        }

    });
 


    // CREDIT CARD IMAGE JS
    document.querySelector('.preload').classList.remove('preload');
    document.querySelector('.creditcard').addEventListener('click', function () {
        if (this.classList.contains('flipped')) {
            this.classList.remove('flipped');
        } else {
            this.classList.add('flipped');
        }
    })

    //On Input Change Events
    name.addEventListener('input', function () {
        if (name.value.length == 0) {
            document.getElementById('svgname').innerHTML = 'John Doe';
            document.getElementById('svgnameback').innerHTML = 'John Doe';
        } else {
            document.getElementById('svgname').innerHTML = this.value;
            document.getElementById('svgnameback').innerHTML = this.value;
        }
    });

    cardnumber_mask.on('accept', function () {
        if (cardnumber_mask.value.length == 0) {
            document.getElementById('svgnumber').innerHTML = '0123 4567 8910 1112';
        } else {
            document.getElementById('svgnumber').innerHTML = cardnumber_mask.value;
        }
    });

    expirationdate_mask.on('accept', function () {
        if (expirationdate_mask.value.length == 0) {
            document.getElementById('svgexpire').innerHTML = '01/23';
        } else {
            document.getElementById('svgexpire').innerHTML = expirationdate_mask.value;
        }
    });

    securitycode_mask.on('accept', function () {
        if (securitycode_mask.value.length == 0) {
            document.getElementById('svgsecurity').innerHTML = '985';
        } else {
            document.getElementById('svgsecurity').innerHTML = securitycode_mask.value;
        }
    });

    //On Focus Events
    name.addEventListener('focus', function () {
        document.querySelector('.creditcard').classList.remove('flipped');
    });

    cardnumber.addEventListener('focus', function () {
        document.querySelector('.creditcard').classList.remove('flipped');
    });

    expirationdate.addEventListener('focus', function () {
        document.querySelector('.creditcard').classList.remove('flipped');
    });

    securitycode.addEventListener('focus', function () {
        document.querySelector('.creditcard').classList.add('flipped');
    });

}