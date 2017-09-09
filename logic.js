
$(document).ready(function () {
  // $("#data").hide();
  // $("#id").hide(); 
  var config = {
    apiKey: "AIzaSyC3Vx2OaRdmaYRmLahrPgapg4NmHeTJ8qk",
    authDomain: "myproject-kin.firebaseapp.com",
    databaseURL: "https://myproject-kin.firebaseio.com",
    projectId: "myproject-kin",
    storageBucket: "myproject-kin.appspot.com",
    messagingSenderId: "325168750428"
  };
  firebase.initializeApp(config);
  $(".row").hide();
  var provider = new firebase.auth.GoogleAuthProvider();
  // function googleSignin() {
  $(document).on("click", ".signIn", function () {
    firebase.auth()
      .signInWithPopup(provider).then(function (result) {
        var token = result.credential.accessToken;
        var user = result.user;
        // console.log(token)
        // console.log(user)
        $(".row").show();
        login();
      }).catch(function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(error.code)
        console.log(error.message)
      });
    $(this).removeClass("signIn");
    $(this).addclass("signOut");
    $(this).text('Sign Out Of Google');

  })
  $(document).on("click", ".signOut", function () {
    firebase.auth().signOut()
      .then(function () {
        console.log('Signout Succesfull')
      }, function (error) {
        console.log('Signout Failed')
      });
    $(this).removeClass('signOut')
      .addClass('signIn')
      .text('Sign In With Google To See Schedule');
  })

  // Create a variable to reference the database.
  function login() {
    var db = firebase.database();
    // -----------------------------
    var name = "";
    var destination = "";
    var frequency = "";
    var start_time = "";
    var nextArrival = "";
    var minutesAway = "";
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
      var tn = sv.name; //train name
      var td = sv.destination;//train destination
      var tf = sv.frequency;//train freq
      var tt = sv.start_time;//train start time
      var diffTime = moment().diff(moment.unix(start_time), "minutes");
      console.log(diffTime);
      var timeRemainder = moment().diff(moment.unix(tt), "minutes") % tf;
      console.log(timeRemainder);
      var minutes = tf - timeRemainder;
      console.log(minutes);
      var nextTrainArrival = moment().add(minutes, "m").format("hh:mm A");
      // Test for correct times and info
      console.log("min" + minutes);
      console.log("nxttrainarr" + nextTrainArrival);
      console.log("now" + moment().format("hh:mm A"));
      console.log("next train" + nextTrainArrival);
      console.log(moment().format("X"));

      // Append train info to table on page
      $("#traindetails").append("<tr>" + "<td>" + tn + "</td>" + "<td>" + td + "</td>" +
        "<td>" + tf + "</td>" + "<td>" + nextTrainArrival + "</td>" + "<td>" + minutes + "</td>" + "</tr>");
      // Handle the errors

    }), function (errorObject) {
      console.log("Errors handled: " + errorObject.code);
    }
  }
});