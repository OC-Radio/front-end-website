(function(){
  
  startPlayer();
})();

function startPlayer(){
  var serverName, trackTitle, description;
  //radioTitle();

  var stream = {
		title: 'OCR-LIVE',
		mp3: "audio/Funky-Element.mp3"
	},
	ready = false;
	$("#player").jPlayer({
		ready: function (event) {
			ready = true;
      console.log('ready');
			$(this).jPlayer("setMedia", stream);
		},
		pause: function() {
			$(this).jPlayer("clearMedia");
		},
		error: function(event) {
			if(ready && event.jPlayer.error.type === $.jPlayer.error.URL_NOT_SET) {
				// Setup the media stream again and play it.
				$(this).jPlayer("setMedia", stream).jPlayer("play");
			}
		},
		swfPath: "../../dist/jplayer",
		supplied: "mp3",
		preload: "metadata",
		wmode: "window",
		useStateClassSkin: true,
		autoBlur: false,
		keyEnabled: true,
    cssSelector: {
            play: "#player-play",
            pause: "#player-pause",
            mute: "#player-mute",
            unmute: "#player-unmute"
    }
	});

  //update meta every 15 seconds
  //setInterval(function () {radioTitle();}, 5000);
}

function radioTitle(){
    var url = 'http://127.0.0.1:8000/json.xsl';
    var mountpoint = '/live';

    $.ajax({
          type: 'GET',
          url: url,
          async: true,
          jsonpCallback: 'parseMusic',
          contentType: "application/json",
          dataType: 'jsonp',
          success: function (json) {
            trackTitle = json[mountpoint].title;
            serverName = json[mountpoint].server_name;
            description = json[mountpoint].description;

            $('#server-title').text(serverName);
            $('#track-title').text(trackTitle);
            $('#listeners').text(json[mountpoint].listener);
            $('#description').text(description);
        },
          error: function (e) { console.log(e.message);
        }
    });
}
