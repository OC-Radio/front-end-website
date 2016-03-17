(function(){

  startPlayer();
})();

function startPlayer(){
  var serverName, trackTitle, description;
  //radioTitle();

  var stream = {
		title: 'OCR-LIVE',
		mp3: "http://104.197.150.17:3000/playlist"
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
  radioTitle();
  setInterval(function () {radioTitle();}, 25000);
}

function radioTitle(){
    var url = 'http://104.197.150.17:3001/status-json.xsl';

    var mountpoint = '/playlist';

    $.getJSON(url, {
      mountpoint: '/playlist'
    }).done(function (data) {
      var title = data['icestats']['source'][0]['title'];
      var name = title.split('|')[0];
      var artist = title.split('|')[1];
      $('.myWrapper #track-title').text(name);
      $('.myWrapper #track-artist').text(artist);
      $('.myWrapperSmall #track-title').text(name);
      $('.myWrapperSmall #track-artist').text(artist);
    });
}
