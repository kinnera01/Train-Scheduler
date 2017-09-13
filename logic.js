
$(document).ready(function () {
  var config = {
    apiKey: "AIzaSyAi1_4Silr5JiJIVS-3jHxi0mhgiFsjW4s",
    authDomain: "train-5392e.firebaseapp.com",
    databaseURL: "https://train-5392e.firebaseio.com",
    projectId: "train-5392e",
    storageBucket: "train-5392e.appspot.com",
    messagingSenderId: "844829732468"
  };
  firebase.initializeApp(config);
  setInterval(function(){
    $('.current-time').html(moment().format('hh:mm:ss A'))
  }, 1000);

  $(".row").hide();
  // Auth using a popup.
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
    $(this).removeClass("signIn")
   .addClass("signOut")
  .text('Sign Out Of Google');
  })
  $(document).on("click", ".signOut", function () {
       firebase.auth().signOut().then(function () {
        $(".row").hide();
        console.log('Signout Succesfull');
      }, function (error) {
        console.log('Signout Failed');
      });
    $(this).removeClass('signOut')
      .addClass('signIn')
      .text('Google SignIn');
  })

  // Create a variable to reference the database.
  function login() {
    var db = firebase.database();
    var name = "";
    var destination = "";
    var frequency = "";
    var start_time = "";
    var nextArrival = "";
    var minutesAway = "";
    var editTrainKey = '';
    var fbTime = moment();
    var newTime;

    $("#submit").on("click", function (event) {
      event.preventDefault();
      // Grabbed values from text boxes
      name = $("#name").val().trim();
      destination = $("#destination").val().trim();
      // Convert to Unix
      start_time = moment($("#time").val().trim(), "HH:mm").subtract(1, "years").format("X");
      frequency = $("#minutes").val().trim();
     if ( name  != '' && destination != '' && start_time != '' && frequency != '') {
       // Clear form data
      $("#name").val("");
      $("#destination").val("");
      $("#time").val("");
      $("#minutes").val("");
      $('#frequency').val('');
      $('#trainKey').val('');
      fbTime = moment().format('X');
      // Code for handling the push
      if (editTrainKey == ''){ 
        dataRef.ref().child('trains').push({
          trainName: trainName,
          trainDestination: trainDestination,
          trainTime: trainTime,
          trainFreq: trainFreq,
          currentTime: fbTime,
        })
      } else if (editTrainKey != '') {
        dataRef.ref('trains/' + editTrainKey).update({
          trainName: trainName,
          trainDestination: trainDestination,
          trainTime: trainTime,
          trainFreq: trainFreq,
          currentTime: fbTime,
        })
        editTrainKey = '';
      }
      $('.help-block').removeClass('bg-danger');
    } else {
      $('.help-block').addClass('bg-danger');
    }
  });
  function timeUpdater() {
    dataRef.ref().child('trains').once('value', function(snapshot){
      snapshot.forEach(function(childSnapshot){
        fbTime = moment().format('X');
        dataRef.ref('trains/' + childSnapshot.key).update({
        currentTime: fbTime,
        })
      })    
    });
  };
  setInterval(timeUpdater, 5000);
      db.ref().push({
        name: name,
        destination: destination,
        start_time: start_time,
        frequency: frequency,
        //   nextArrival: nextArrival,
        //   minutesAway: minutesAway,
        dateAdded: firebase.database.ServerValue.TIMESTAMP

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
        "<td>" + tf + "</td>" + "<td>" + nextTrainArrival + "</td>" + "<td>" + minutes + "</td>"+"</tr>"+"</td><td><button class='edit btn' data-train=" + trainClass + "><i class='glyphicon glyphicon-pencil'></i></button><button class='delete btn' data-train=" + trainClass + "><i class='glyphicon glyphicon-remove'></i></button></td>");
      // Handle the errors

    }), function (errorObject) {
      console.log("Errors handled: " + errorObject.code);
    }
    $(document).on('click','.delete', function(){
      var trainKey = $(this).attr('data-train');
      dataRef.ref("trains/" + trainKey).remove();
      $('.'+ trainKey).remove();
    });
  }
    $(document).on('click','.edit', function(){
      editTrainKey = $(this).attr('data-train');
      dataRef.ref("trains/" + editTrainKey).once('value').then(function(childSnapshot) {
        $('#trainName').val(childSnapshot.val().trainName);
        $('#trainDestination').val(childSnapshot.val().trainDestination);
        $('#firstTrain').val(moment.unix(childSnapshot.val().trainTime).format('HH:mm'));
        $('#trainFrequency').val(childSnapshot.val().trainFreq);
        $('#trainKey').val(childSnapshot.key);

      })
  })
});
