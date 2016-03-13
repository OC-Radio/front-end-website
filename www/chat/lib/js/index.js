var $username, chatRef, fireChat, currentUser, messageListRef, messageField, messageContainer, userlist;

$(function(){

  $username = $('#login-message');

  $('#logoutBTN').hide();
  $('#firechat-wrapper').hide();

  chatRef = new Firebase('https://oc-radio.firebaseio.com/chat');
  messageListRef = new Firebase('https://oc-radio.firebaseio.com/messages');
  userlist = new Firebase('https://oc-radio.firebaseio.com/userlist');

  messageField = $('#messageInput');
  messageContainer = $('#messages');

  chatRef.onAuth(function(authData) {
    if (authData) {
      $('#login-wrapper').hide(500);
      $('.messages-container').show(500);
      $('#logoutBTN').show();
      $('#loginBTN').hide();
      $('.input-container').show(500);
      $('header').show(500);
      $(messageField).attr('placeholder', "send a message").val("").focus().blur();
      messageContainer.empty();
      $username.empty();
      $username.append(authData.password.email.split('@')[0]);
      getMessages(authData);

      chatRef.child("users").child(authData.uid).set({
         provider: authData.provider,
         name: getName(authData)
       });
    } else {
      $('.messages-container').hide(500);
      $('.input-container').hide(500);
      $('#login-wrapper').show(500);
      $('#logoutBTN').hide();
      $('header').hide();
      messageContainer.empty();
      $username.empty();
      $username.append("OC Radio | Player");
    }
  });


  $('textarea#messageInput').characterCounter();
  $('.ticker').ticker();

});

function getMessages(authData){

  messageField.keypress(function (e) {
    if (e.keyCode == 13) {
      //FIELD VALUES
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

      if(hours == 0 && minutes == 0){
        timeOfDay = "midnight";
      }

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
      messageField.val('');
    }
  });

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
  var user = $('#email').val();
  var pass = $('#password').val();
  chatRef.createUser({
    email    : user,
    password : pass
  }, function(error, userData) {
    if (error) {
      $username.empty();
      $username.append("User " + user + " already exists");
    } else {
      $username.empty();
      $username.append("Successfully created user account");
      login();
    }
  });
}

function login (){
  var user = $('#email').val();
  var pass = $('#password').val();
  chatRef.authWithPassword({
    email    : user,
    password : pass
  }, function(error, authData) {
    if (error) {
      $username.empty();
      $username.append("Login failed | ", error);
    } else {
      var userID = authData.uid;
      var userName = authData.password.email.split('@')[0];
    }
  });
}

function logout(){
  var r = confirm("Are you sure?");
  if (r == true) {
    chatRef.unauth();
  } else {
    return;
  }
}

function resetPass(){
  alert("Cannot rest");
}

function saveData(){
  var usersRef = chatRef.child("users");
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
