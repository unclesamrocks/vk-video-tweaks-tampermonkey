// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      2026-08-23
// @description  try to take over the world!
// @author       You
// @match        https://vkvideo.ru/video-*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=vkvideo.ru
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // Your code here...
  function gainAudio(video, gainValue) {
    let audioContext;
    let gainNode;
    let source;

    function applyDoubleVolume() {
      if (!video) {
        console.error("No video element found on the page.");
        return;
      }

      // Initialize the AudioContext if not already created
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }

      if (!gainNode) {
        // Create a gain node and set its gain value to 2 (double volume)
        gainNode = audioContext.createGain();
        gainNode.gain.value = gainValue;
      }

      // Disconnect any existing connections to avoid errors
      if (source) {
        source.disconnect();
      }

      // Connect the video element to the gain node and the gain node to the destination
      source = audioContext.createMediaElementSource(video);
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

      console.log("Volume doubled using Web Audio API.");
    }

    applyDoubleVolume();
  }
})();
