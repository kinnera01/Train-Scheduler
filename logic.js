/* global moment firebase */

// Initialize Firebase
// Make sure to match the configuration to the script version number in the HTML
// (Ex. 3.0 != 3.7.0)    
// console.log("HI");  
var provider = new firebase.auth.GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
firebase.auth().signInWithPopup(provider).then(function(result) {
  // This gives you a Google Access Token. You can use it to access the Google API.
  var token = result.credential.accessToken;
  // The signed-in user info.
  var user = result.user;
  // ...
}).catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // The email of the user's account used.
  var email = error.email;
  // The firebase.auth.AuthCredential type that was used.
  var credential = error.credential;
  // ...
});  
var config = {
    apiKey: "AIzaSyC3Vx2OaRdmaYRmLahrPgapg4NmHeTJ8qk",
    authDomain: "myproject-kin.firebaseapp.com",
    databaseURL: "https://myproject-kin.firebaseio.com",
    projectId: "myproject-kin",
    storageBucket: "myproject-kin.appspot.com",
    messagingSenderId: "325168750428"
  };
  firebase.initializeApp(config);
  
  // Create a variable to reference the database.
  var db = firebase.database();
  
  // -----------------------------
  var name = "";
  var destination = "";
  var frequency = "";
  var start_time = "";
  var nextArrival = "";
  var  minutesAway = "";
  $("#submit").on("click", function (event) {
      event.preventDefault(); 
      // Grabbed values from text boxes
      name = $("#name").val().trim();
      destination = $("#destination").val().trim();
      start_time = moment($("#time").val().trim(), "HH:mm").subtract(1, "years").format("X");
      frequency = $("#minutes").val().trim();
    //   nextArrival = "";
    //   minutesAway = "";

      $("#name").val("");
      $("#destination").val("");
      $("#time").val("");
      $("#minutes").val("");
            // Code for handling the push
      db.ref().push({
      name: name,
      destination: destination,
      start_time: start_time,
      frequency: frequency,
    //   nextArrival: nextArrival,
    //   minutesAway: minutesAway,
      dateAdded: firebase.database.ServerValue.TIMESTAMP

      });
      });

 
  // Firebase watcher + initial loader + order/limit HINT: .on("child_added"
  db.ref().orderByChild("dateAdded").on("child_added", function (snapshot) {
      // storing the snapshot.val() in a variable for convenience
      var sv = snapshot.val(); //snapshot value
      var  tn=sv.name; //train name
      var  td=sv.destination;//train destination
      var  tf=sv.frequency;//train freq
      var  tt=sv.start_time;//train start time
      var diffTime = moment().diff(moment.unix(start_time), "minutes");
      console.log(diffTime);
      var timeRemainder = moment().diff(moment.unix(tt), "minutes") % tf ;
      console.log(timeRemainder);
      var minutes = tf - timeRemainder;
      console.log(minutes);
      var nextTrainArrival = moment().add(minutes, "m").format("hh:mm A"); 
      // Test for correct times and info
		console.log("min"+ minutes);
		console.log("nxttrainarr"+nextTrainArrival);
		console.log("now"+moment().format("hh:mm A"));
		console.log("next train"+nextTrainArrival);
		console.log(moment().format("X"));
      
     // Append train info to table on page
      $("#traindetails").append("<tr>" + "<td>" + tn + "</td>" + "<td>" +td + "</td>" +
          "<td>" + tf + "</td>" + "<td>" + nextTrainArrival + "</td>" +  "<td>" + minutes + "</td>" + "</tr>");
      // Handle the errors

  }, function (errorObject) {
      console.log("Errors handled: " + errorObject.code);
  });
  