var daftComposer = new DaftComposer();
var sounds = {
  background: {urls: ['sounds/background.mp3'], volume: 0.5},
  sound1: {urls: ['sounds/sound1.mp3']},
  sound2: {urls: ['sounds/sound2.mp3']},
  sound3: {urls: ['sounds/sound3.mp3']},
  sound4: {urls: ['sounds/sound4.mp3']},
  sound5: {urls: ['sounds/sound5.mp3']},
  sound6: {urls: ['sounds/sound6.mp3']},
  sound7: {urls: ['sounds/sound7.mp3']},
  sound8: {urls: ['sounds/sound8.mp3']}
};

daftComposer.load(sounds, function (name, loaded) {
  console.log('Loaded ' + loaded + '/9 : ' + name);
});

function playSound(soundName) {
  console.log('toggle sound ' + soundName);
  daftComposer.togglePlay(soundName);
}

function record() {
  console.log('toggle record');
  daftComposer.toggleRecord();
}

function replay() {
  console.log('toggle replay with sequence : ', daftComposer.getRecord());
  daftComposer.togglePlayback(daftComposer.getRecord());
}
