// ==UserScript==
// @name         VK Video Tweaks
// @namespace    http://tampermonkey.net/
// @version      2026-10-21
// @description  Audio gain and UI tweaks for VK Video
// @author       You
// @match        https://vkvideo.ru/video-*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=vkvideo.ru
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  // ========== Audio Gain Function (keep as-is) ==========
  /**
   * Route the video's audio through a Web Audio gain node.
   *
   * @param {HTMLVideoElement} video - video element whose audio should be boosted
   * @param {number} gainValue - gain multiplier (0-10)
   * @returns {void}
   */
  function gainAudio(video, gainValue) {
    let audioContext;
    let gainNode;
    let source;

    /**
     * Create the gain graph and connect the media element to the speakers.
     *
     * @returns {void}
     */
    function applyDoubleVolume() {
      if (!video) {
        console.error("No video element found on the page.");
        return;
      }

      // Initialize the AudioContext if not already created
      if (!audioContext) {
        const AudioContextCtor =
          window.AudioContext ||
          /** @type {any} */ (window).webkitAudioContext;
        audioContext = new AudioContextCtor();
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

  // ========== Create Trigger Zone ==========
  const trigger = document.createElement("div");
  trigger.id = "vk-audio-gain-trigger";
  document.body.appendChild(trigger);

  // ========== Create Popup ==========
  const popup = document.createElement("div");
  popup.id = "vk-audio-gain-popup";
  popup.innerHTML = `
    <div id="vk-popup-header">🎵 VK Video Tweaks</div>
    <div id="vk-popup-content">
      <div class="vk-form-group">
        <label for="vk-video-select">Video Element:</label>
        <select id="vk-video-select">
          <option value="">-- No video found --</option>
        </select>
      </div>
      <div class="vk-form-group">
        <label for="vk-gain-value">Gain Value (0-10):</label>
        <input type="number" id="vk-gain-value" min="0" max="10" value="4" step="1">
      </div>
      <button id="vk-apply-gain">Apply Audio Gain</button>
      <button id="vk-toggle-recommendations">Hide Recommendations</button>
      <button id="vk-toggle-fit">Video Fit: Off</button>
    </div>
  `;
  document.body.appendChild(popup);

  // ========== Add Styles ==========
  const style = document.createElement("style");
  style.textContent = `
    #vk-audio-gain-trigger {
      position: fixed;
      top: 0;
      left: 0;
      width: 40px;
      height: 40px;
      background: rgba(102, 126, 234, 0.3);
      border-radius: 0 0 10px 0;
      z-index: 1000000;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    #vk-audio-gain-trigger:hover {
      background: rgba(102, 126, 234, 0.6);
    }

    #vk-audio-gain-popup {
      position: fixed;
      top: 10px;
      left: 10px;
      width: 280px;
      background: #1a1a2e;
      color: #eee;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
      z-index: 999999;
      opacity: 0;
      transform: translateY(-10px);
      transition: opacity 0.3s ease, transform 0.3s ease;
      pointer-events: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
    }

    #vk-audio-gain-popup.visible {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    #vk-popup-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 10px 15px;
      border-radius: 10px 10px 0 0;
      cursor: move;
      font-weight: 600;
      user-select: none;
    }

    #vk-popup-content {
      padding: 15px;
    }

    .vk-form-group {
      margin-bottom: 12px;
    }

    .vk-form-group label {
      display: block;
      margin-bottom: 5px;
      color: #aaa;
      font-size: 12px;
    }

    .vk-form-group select,
    .vk-form-group input {
      width: 100%;
      padding: 8px 10px;
      border: 1px solid #333;
      border-radius: 6px;
      background: #16213e;
      color: #eee;
      font-size: 13px;
      box-sizing: border-box;
    }

    .vk-form-group select:focus,
    .vk-form-group input:focus {
      outline: none;
      border-color: #667eea;
    }

    #vk-apply-gain {
      width: 100%;
      padding: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    #vk-apply-gain:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    #vk-apply-gain:active {
      transform: translateY(0);
    }

    #vk-toggle-recommendations {
      width: 100%;
      padding: 10px;
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      margin-top: 8px;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    #vk-toggle-recommendations:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
    }

    #vk-toggle-recommendations:active {
      transform: translateY(0);
    }

    #vk-toggle-fit {
      width: 100%;
      padding: 10px;
      background: linear-gradient(135deg, #00b09b 0%, #96c93d 100%);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      margin-top: 8px;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    #vk-toggle-fit:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 176, 155, 0.4);
    }

    #vk-toggle-fit:active {
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);

  // ========== Get Elements ==========
  const header = document.getElementById("vk-popup-header");
  const videoSelect = /** @type {HTMLSelectElement} */ (
    document.getElementById("vk-video-select")
  );
  const gainInput = /** @type {HTMLInputElement} */ (
    document.getElementById("vk-gain-value")
  );
  const applyButton = document.getElementById("vk-apply-gain");

  // ========== Show/Hide Popup ==========
  let hideTimeout;

  /**
   * Refresh the video list and fit mode, then reveal the popup.
   *
   * @returns {void}
   */
  function showPopup() {
    clearTimeout(hideTimeout);
    updateVideoList();
    applyVideoFit();
    popup.classList.add("visible");
  }

  /**
   * Hide the popup after a short hover grace period.
   *
   * @returns {void}
   */
  function hidePopup() {
    hideTimeout = setTimeout(() => {
      popup.classList.remove("visible");
    }, 3000);
  }

  trigger.addEventListener("mouseenter", showPopup);
  trigger.addEventListener("mouseleave", hidePopup);
  popup.addEventListener("mouseenter", () => clearTimeout(hideTimeout));
  popup.addEventListener("mouseleave", hidePopup);

  // ========== Collect All Videos (Shadow DOM) ==========
  /**
   * Collect every video element from all vk-video-player shadow roots.
   *
   * @returns {HTMLVideoElement[]} video elements on the page
   */
  function getAllVideos() {
    /** @type {HTMLVideoElement[]} */
    const allVideos = [];

    document.querySelectorAll("vk-video-player").forEach((el) => {
      const player = /** @type {Element & { _shadowRoot?: ShadowRoot }} */ (el);
      if (player._shadowRoot) {
        player._shadowRoot
          .querySelectorAll("video")
          .forEach((v) => allVideos.push(v));
      }
    });

    return allVideos;
  }

  // ========== Update Video List ==========
  /**
   * Rebuild the popup's video <select> from the current page videos.
   *
   * @returns {void}
   */
  function updateVideoList() {
    const allVideos = getAllVideos();

    videoSelect.innerHTML = "";

    if (allVideos.length === 0) {
      videoSelect.innerHTML = '<option value="">-- No video found --</option>';
      return;
    }

    allVideos.forEach((video, index) => {
      const option = document.createElement("option");
      option.value = String(index);

      // Add meta info to label
      let label = `Video ${index + 1}`;
      if (video.src) {
        const srcName = video.src.split("/").pop().split("?")[0];
        if (srcName) label += ` - ${srcName.substring(0, 20)}`;
      }
      if (video.duration && !isNaN(video.duration)) {
        label += ` (${Math.floor(video.duration)}s)`;
      }
      option.textContent = label;

      videoSelect.appendChild(option);
    });
  }

  // ========== Drag & Drop ==========
  let isDragging = false;
  let offsetX, offsetY;

  header.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - popup.getBoundingClientRect().left;
    offsetY = e.clientY - popup.getBoundingClientRect().top;
    popup.style.transition = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    e.preventDefault();

    let newX = e.clientX - offsetX;
    let newY = e.clientY - offsetY;

    // Keep within viewport
    newX = Math.max(0, Math.min(window.innerWidth - popup.offsetWidth, newX));
    newY = Math.max(0, Math.min(window.innerHeight - popup.offsetHeight, newY));

    popup.style.left = newX + "px";
    popup.style.top = newY + "px";
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // ========== Toggle Recommendations ==========
  const toggleRecs = document.getElementById("vk-toggle-recommendations");
  let recsHidden = false;

  toggleRecs.addEventListener("click", () => {
    const el = document.getElementById("video_recommendations");
    if (!el) return;

    // Parent column container that holds the sticky wrapper + section
    const column = /** @type {HTMLElement | null} */ (
      el.closest(".vkitInternalTwoColumnLayoutColumn")
    );
    if (!column) return;

    recsHidden = !recsHidden;
    column.style.display = recsHidden ? "none" : "";
    toggleRecs.textContent = recsHidden
      ? "Show Recommendations"
      : "Hide Recommendations";
  });

  // ========== Video Fit Mode (off -> width -> height) ==========
  /**
   * @typedef {"off" | "width" | "height"} VideoFitMode
   */

  /**
   * Snapshot of a video's own inline fit styles, saved before we override them.
   *
   * @typedef {Object} OriginalFitStyles
   * @property {string} objectFit - inline object-fit value ("" if absent)
   * @property {string} objectFitPriority - its CSS priority ("" or "important")
   * @property {string} objectPosition - inline object-position value ("" if absent)
   * @property {string} objectPositionPriority - its CSS priority ("" or "important")
   */

  const fitButton = document.getElementById("vk-toggle-fit");
  /** @type {VideoFitMode[]} */
  const fitModes = ["off", "width", "height"];
  const fitLabels = {
    off: "Video Fit: Off",
    width: "Video Fit: Width",
    height: "Video Fit: Height",
  };

  /** @type {VideoFitMode} */
  let fitMode =
    /** @type {VideoFitMode} */ (
      localStorage.getItem("vk-video-fit-mode") || "off"
    );
  if (!fitModes.includes(fitMode)) fitMode = "off";

  /**
   * Pick object-fit so exactly one axis of the video fills the player box:
   * "width" fills width (vertical overflow is cropped), "height" fills height.
   *
   * @param {HTMLVideoElement} video - video element to fit inside its player box
   * @param {Exclude<VideoFitMode, "off">} mode - which axis must be filled
   * @returns {"contain" | "cover"} object-fit value implementing the mode
   */
  function fitObjectFit(video, mode) {
    const boxRatio = video.clientWidth / video.clientHeight;
    const videoRatio = video.videoWidth / video.videoHeight;
    if (mode === "width") return videoRatio > boxRatio ? "contain" : "cover";
    return videoRatio < boxRatio ? "contain" : "cover";
  }

  // Remember the video's own inline styles so "off" can restore them
  /** @type {WeakMap<HTMLVideoElement, OriginalFitStyles>} */
  const originalFitStyles = new WeakMap();

  /**
   * Snapshot the video's original inline fit styles, once per element.
   *
   * @param {HTMLVideoElement} video - video element we are about to override
   * @returns {void}
   */
  function saveOriginalFitStyles(video) {
    if (originalFitStyles.has(video)) return;
    originalFitStyles.set(video, {
      objectFit: video.style.getPropertyValue("object-fit"),
      objectFitPriority: video.style.getPropertyPriority("object-fit"),
      objectPosition: video.style.getPropertyValue("object-position"),
      objectPositionPriority: video.style.getPropertyPriority("object-position"),
    });
  }

  /**
   * Restore the video's saved inline fit styles (no-op if never overridden).
   *
   * @param {HTMLVideoElement} video - video element to restore
   * @returns {void}
   */
  function restoreOriginalFitStyles(video) {
    const original = originalFitStyles.get(video);
    if (!original) return;
    originalFitStyles.delete(video);

    [
      ["object-fit", original.objectFit, original.objectFitPriority],
      ["object-position", original.objectPosition, original.objectPositionPriority],
    ].forEach(([name, value, priority]) => {
      if (value) {
        video.style.setProperty(name, value, priority);
      } else {
        video.style.removeProperty(name);
      }
    });
  }

  /**
   * Apply the current fit mode to every video on the page.
   *
   * @returns {void}
   */
  function applyVideoFit() {
    getAllVideos().forEach((video) => {
      videoResizeObserver.observe(video);

      if (fitMode === "off") {
        restoreOriginalFitStyles(video);
        return;
      }

      // Metadata not loaded yet -> retry once it is
      if (!video.videoWidth || !video.videoHeight) {
        video.addEventListener("loadedmetadata", () => applyVideoFit(), {
          once: true,
        });
        return;
      }

      saveOriginalFitStyles(video);
      video.style.setProperty(
        "object-fit",
        fitObjectFit(video, fitMode),
        "important"
      );
      video.style.setProperty("object-position", "center", "important");
    });
  }

  const videoResizeObserver = new ResizeObserver(() => applyVideoFit());

  fitButton.addEventListener("click", () => {
    fitMode = fitModes[(fitModes.indexOf(fitMode) + 1) % fitModes.length];
    localStorage.setItem("vk-video-fit-mode", fitMode);
    fitButton.textContent = fitLabels[fitMode];
    applyVideoFit();
  });

  // Catch videos that appear or change size after page navigation
  let fitApplyTimer;
  new MutationObserver(() => {
    if (fitMode === "off") return;
    clearTimeout(fitApplyTimer);
    fitApplyTimer = setTimeout(applyVideoFit, 300);
  }).observe(document.body, { childList: true, subtree: true });

  window.addEventListener("resize", applyVideoFit);

  fitButton.textContent = fitLabels[fitMode];
  applyVideoFit();

  // ========== Apply Gain ==========
  applyButton.addEventListener("click", () => {
    const allVideos = getAllVideos();
    const selectedIndex = parseInt(videoSelect.value);

    if (isNaN(selectedIndex) || !allVideos[selectedIndex]) {
      alert("Please select a valid video element");
      return;
    }

    const gainValue = parseInt(gainInput.value);
    if (isNaN(gainValue) || gainValue < 0 || gainValue > 10) {
      alert("Gain value must be between 0 and 10");
      return;
    }

    const selectedVideo = allVideos[selectedIndex];
    gainAudio(selectedVideo, gainValue);

    console.log(`Applied gain ${gainValue} to video ${selectedIndex + 1}`);
  });

  // ========== Initial update ==========
  updateVideoList();
})();
