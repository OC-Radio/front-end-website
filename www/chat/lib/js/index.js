var $loginMSG, $profile, $profile2, chatRef, fireChat, currentUser, messageListRef, messageField, messageContainer, userlist;

$(function(){

  $loginMSG = $('#login-message');
  $profile = $('#profile');
  $profile2 = $('#profile2');

  $('#logoutBTN').hide();
  $('#firechat-wrapper').hide();

  chatRef = new Firebase('https://oc-radio.firebaseio.com');
  messageListRef = new Firebase('https://oc-radio.firebaseio.com/messages');
  userlist = new Firebase('https://oc-radio.firebaseio.com/users');

  messageField = $('#messageInput');
  messageContainer = $('#messages');

  chatRef.onAuth(function(authData) {
    if (authData) {
      authDataCallback(authData, true);
    } else {
      authDataCallback(authData, false);
    }
  });
  $('.ticker').ticker();
  changeCheckStatus();
});

function changeCheckStatus(){
  // NEED TO SAVE THIS VALUE INTO FIREBASE USER ACCOUNTS -- FINISHED
  $("#enterSender").change(function(){
    var c = this.checked ? true : false;
    sendMessageWithEnter(c);
  });
}
// FOR SEND WITH ENTER OPTION
function sendMessageWithEnter(b){
  switch(b){
    case true:
      console.log(true);
      messageField.keypress(function(e){
        if ( e.which == 13 ) {
          e.preventDefault();
          postNewMessage();
        }
      });
      break;

    case false:
    console.log(false);
      break;
  }
}

//SEND NEW MESSAGE TO FIREBASE SERVER
function postNewMessage(){
    messageField.val().replace(/\n/g, "");
    var authData = chatRef.getAuth();
    var username = authData.password.email.split('@')[0];
    var message = messageField.val();

    var time = new Date();
    var hours = time.getHours();
    var minutes = time.getMinutes();

    /*
      FOR TWELVE HOUR FORMAT
      if(hours > 12){
        hours-=12;
      }else if(hours == 0){
        hours = 12;
      }
    */

    if(minutes < 10){
      minutes = "0" + minutes;
    }

    var timeOfDay = hours + ":" + minutes + " ";
    timestamp = timeOfDay + " ";

    //SAVE DATA TO FIREBASE AND EMPTY FIELD
    messageListRef.push({
        'userid': username,
        'text': message,
        'date': timestamp
      });
    messageField.val("");

}

// GET FIREBASE MESSAGE LIST ON LOGIN
function getMessages(authData){
  messageListRef.limitToLast(100).on("child_added", function(snapshot, previousKey) {
    var currentkey = snapshot.key();
    var data = snapshot.val();
    var username, message, messageRow, nameElement, messageElement;
    username = data.date + "" + data.userid;
    message = data.text;
    messageRow = $("<li class='row'>");
    nameElement = $("<small class='blue-grey-text'></small>");
    messageElement = $("<p class=''></p>")
    messageElement.text(message);
    nameElement.text(username);
    messageRow.append(messageElement).prepend(nameElement);
    messageContainer.append(messageRow);
    $(messageContainer).scrollTop($(messageContainer)[0].scrollHeight);
  });

}

function register(){
  var email = $('#email').val();
  var pass = $('#password').val();

  var mailName = email.split('@')[0];

  var myUser = {
    email: email,
    password: pass
  }

  chatRef.createUser(myUser, function (error, user) {
    var newProfileObj = {};
    if (error) {
      $loginMSG.empty();
      $loginMSG.append("User " + user + " already exists");
    } else {
        newProfileObj[user.uid] = {
          email: email,
          name: mailName,
          // Would be useful to make a default propteies object and append that to users
          // that don't have options. For example, if I add the ability to go offline, all current users
          // should get that option without creating a new account.
          // DEAFULT OPTIONS -> USERLIST OPTIONS -> if(USERLIST_OPTIONS are less than DEFAULT_OPTIONS) -> ADD
          // DEFAULT OPTIONS
          options: {
            sendWithEnter: true,
            hideTicker: false,
            autoPlay: true,
            private: true
          }
        };
        userlist.push(newProfileObj);
        $loginMSG.empty();
        $loginMSG.append("User successfully created");
      }
    });
}

function login (){
  var user = $('#email').val();
  var pass = $('#password').val();
  chatRef.authWithPassword({
    email    : user,
    password : pass
  }, authHandler);
}

function logout(){

  var r = confirm('Are you sure you want logout?');
  if (r == true) {
    chatRef.unauth();
    location.reload();
  } else {
    return;
  }
}

function resetPass(){
  alert("Cannot rest");
}

function saveData(authData){
}

function showForm(){
  $('#login-wrapper').show(500);
  $('#loginBTN-container').hide();
}

// find a suitable name based on the meta info given by each provider
function getName(authData) {
  switch(authData.provider) {
     case 'password':
       return authData.password.email.replace(/@.*/, '');
     case 'twitter':
       return authData.twitter.displayName;
     case 'facebook':
       return authData.facebook.displayName;
  }
}

function clearMessages(){
    var day =new Date().getDay();
    var hours =new Date().getHours();

    if (day === 0 && hours >12 && hours < 13)  // day is a 0 index base
                                               // sunday between 12:00 and 13:00

                                               //What you want to do goes here
  messageListRef.remove();
}

// Create a callback which logs the current auth state
function authDataCallback(authData, loggedin) {
  if(loggedin){

    $('#login-wrapper').hide(500);
    $('.messages-container').show(500);
    $('#logoutBTN').show();
    $('#loginBTN').hide();
    $('.input-container').show(500);
    $('header').show(500);

    messageContainer.empty();

    $profile.empty();
    $profile.append(getName(authData));

    $profile2.empty();
    $profile2.append(getName(authData));
    getMessages(authData);
  }else{
    $('.messages-container').hide(500);
    $('.input-container').hide(500);
    $('#login-wrapper').show(500);
    $('#logoutBTN').hide();
    $('header').hide();
    messageContainer.empty();
    $loginMSG.empty();
    $loginMSG.append("OC Radio | Player");
  }

}

// Create a callback to handle the result of the authentication
function authHandler(error, authData) {
  if (error) {
    $loginMSG.empty();
    $loginMSG.append(error);
  } else {
    var userID = authData.uid;
    var user = userlist.child(userID);

    var userName = user.child('name');
    var userOptions = user.child('options');
    var path = userOptions.toString();


    // Attach an asynchronous callback to read the data at our posts reference
    userlist.on("value", function(snapshot) {
      var data = snapshot.val()
      for(key in data){
        var userKey = data[key];
        for(nkey in userKey){
          if(userID == nkey){
            $("#enterSender").prop('checked', data[key][nkey].options.sendWithEnter);
            var check = data[key][nkey].options.sendWithEnter;
            sendMessageWithEnter(check);
          }
        }
      }

    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });

    //$('#enterSender').prop('checked', authData.options.sendWithEnter);
  }
}
