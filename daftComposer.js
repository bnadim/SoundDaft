(function() {

  var DaftComposer = function () {
    this.sounds = {};

    this.recording = false;
    this.recordTime = null;
    this.reqSeq = [];
    this.playbackTimeout = null;
    this.playbackTime = null;
    this.playingBack = false;
  };

  DaftComposer.prototype.load = function (sounds, progressCb) {
    var self = this;
    this.stopAll();
    this.sounds = {};
    var loaded = 0;

    for (var name in sounds) {
      if (sounds.hasOwnProperty(name)) {
        (function (name) {
          var volume = sounds[name].volume ? sounds[name].volume : 1.0;
          self.sounds[name] = {sound: new Howl({urls: sounds[name].urls, loop: true, volume: volume}), playing: false};
          self.sounds[name].sound.on('load', function () {
            loaded++;
            progressCb && progressCb(name, loaded);
          });
        })(name);
      }
    }
  };

  DaftComposer.prototype.stopAll = function () {
    for (var name in this.sounds) {
      if (this.sounds.hasOwnProperty(name)) {
        this.sounds[name].sound.stop();
        this.sounds[name].playing = false;
      }
    }
  };

  DaftComposer.prototype.record = function () {
    if (this.recording) return;

    if (this.playingBack) this.stopPlayback();
    this.stopAll();
    this.reqSeq = [];
    this.recording = true;
    this.recordTime = Date.now();
  };

  DaftComposer.prototype.stopRecord = function () {
    if (!this.recording) return;

    this.stopAll();
    this.recording = false;

    this.reqSeq.push({time: Date.now() - this.recordTime, type: 'end'});
  };

  DaftComposer.prototype.toggleRecord = function () {
    if (this.recording) {
      this.stopRecord();
    } else {
      this.record();
    }
  };

  DaftComposer.prototype.getRecord = function () {
    return this.reqSeq;
  };

  DaftComposer.prototype._play = function (soundName) {
    var sound = this.sounds[soundName];

    if (!sound) return;
    if (sound.playing) return;

    sound.playing = true;
    sound.sound.play();

    if (this.recording) {
      this.reqSeq.push({time: Date.now() - this.recordTime, type: 'play', sound: soundName});
    }
  };

  DaftComposer.prototype.play = function (soundName) {
    if (this.playingBack) return;

    this._play(soundName);
  };

  DaftComposer.prototype._stop = function (soundName) {
    var sound = this.sounds[soundName];

    if (!sound) return;
    if (!sound.playing) return;

    sound.playing = false;
    sound.sound.stop();

    if (this.recording) {
      this.reqSeq.push({time: Date.now() - this.recordTime, type: 'stop', sound: soundName});
    }
  };

  DaftComposer.prototype.stop = function (soundName) {
    if (this.playingBack) return;

    this._stop(soundName);
  };

  DaftComposer.prototype.togglePlay = function (soundName) {
    var sound = this.sounds[soundName];

    if (!sound) return;

    if (sound.playing) {
      this.stop(soundName);
    } else {
      this.play(soundName);
    }
  };

  DaftComposer.prototype.playback = function (sequence) {
    if (this.playingBack) return;
    this.playingBack = true;

    this.stopAll();
    if (this.recording) this.stopRecord();

    this.playbackTime = Date.now();
    if (sequence.length <= 0) return this.stopPlayback();

    this._playbackStep(sequence, -1);
  };

  DaftComposer.prototype.stopPlayback = function () {
    if (!this.playingBack) return;

    if (this.playbackTimeout) clearTimeout(this.playbackTimeout);

    this.stopAll();
    this.playingBack = false;
  };

  DaftComposer.prototype.togglePlayback = function (sequence) {
    if (this.playingBack) {
      this.stopPlayback();
    } else {
      this.playback(sequence);
    }
  };

  DaftComposer.prototype._playbackStep = function (sequence, i) {
    var self = this;
    if (i+1 < sequence.length) {
      this.playbackTimeout = setTimeout(function () {
        self._playbackStep(sequence, i+1);
      }, this.playbackTime + sequence[i+1].time - Date.now())
    }
    if (i >= 0) {
      this._doStep(sequence[i]);
    }
  };

  DaftComposer.prototype._doStep = function (step) {
    if (step.type === 'end') {
      this.stopPlayback();

    } else if (step.type === 'play') {
      this._play(step.sound);

    } else if(step.type === 'stop') {
      this._stop(step.sound);
    }
  };


  /**
   * Add support for AMD (Asynchronous Module Definition) libraries such as require.js.
   */
  if (typeof define === 'function' && define.amd) {
    define(function() {
      return {
        DaftComposer: DaftComposer
      };
    });
  }

  /**
   * Add support for CommonJS libraries such as browserify.
   */
  if (typeof exports !== 'undefined') {
    exports.DaftComposer = DaftComposer;
  }

  // define globally in case AMD is not available or available but not used

  if (typeof window !== 'undefined') {
    window.DaftComposer = DaftComposer;
  }

})();
