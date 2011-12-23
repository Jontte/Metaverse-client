Sounds = {
	musicElement: document.createElement('audio'),
	playlist: null, // currently playing playlist, is automatically looped
	playlistStep: 0, // current song playing in playlist
	playFx: function (opts){
		var audioElement = document.createElement('audio');
		audioElement.setAttribute('src', 'audio/' + opts.file);
		if (opts.loop){
			audioElement.addEventListener('ended', function(){
				audioElement.currentTime = 0;
				audioElement.play();
			});
		}
		audioElement.addEventListener('canplaythrough', function(){
			audioElement.play();
		});
	},
	playMusic: function (opts){
		if (opts.playlistStep != undefined){
			Sounds.playlistStep = opts.playlistStep;
		} else {
			Sounds.playlistStep = 0;
			Sounds.playlist = opts.file;
		}
		Sounds.musicElement.pause();
		if (Sounds.playlist.constructor.toString().indexOf("Array") != -1){ // If a playlist was provided
			if (Sounds.playlistStep == (Sounds.playlist.length - 1)){
				Sounds.playlistStep = 0;
			}
			Sounds.musicElement.setAttribute('src', 'audio/' + Sounds.playlist[Sounds.playlistStep]);
			Sounds.musicElement.addEventListener('ended', function(){
				Sounds.playlistStep = Sounds.playlistStep + 1;
				Sounds.playMusic({playlistStep: Sounds.playlistStep});
			});
		} else {
			Sounds.musicElement.setAttribute('src', 'audio/' + opts.file);
			if (opts.loop){ // Loop the music
				Sounds.musicElement.addEventListener('ended', function(){
					Sounds.musicElement.currentTime = 0;
					Sounds.musicElement.play();
				});
			}		
		}
		Sounds.musicElement.addEventListener('canplaythrough', function(){
			Sounds.musicElement.currentTime = 0;
			Sounds.musicElement.play();
		});
	}
}
