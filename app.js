// Web Audio API State
let audioContext = null;
let oscillator = null;
let gainNode = null;
let pannerNode = null;
let isPlaying = false;
let currentMode = "water";
let currentSpeaker = "both";
let progressInterval = null;
let vibrationInterval = null;

// Initialize Audio Context on user gesture
function initAudio() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

// Build Audio Graph: Oscillator -> Gain -> StereoPanner -> Destination
function setupAudioGraph(frequency) {
  stopAudio();

  oscillator = audioContext.createOscillator();
  gainNode = audioContext.createGain();
  pannerNode = audioContext.createStereoPanner();

  // Channel balance: Left (-1), Right (+1), Both (0)
  if (currentSpeaker === "left") {
    pannerNode.pan.value = -1;
  } else if (currentSpeaker === "right") {
    pannerNode.pan.value = 1;
  } else {
    pannerNode.pan.value = 0;
  }

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);

  oscillator.connect(gainNode);
  gainNode.connect(pannerNode);
  pannerNode.connect(audioContext.destination);
}

// 1. Water Eject Mode: 165Hz Pulsed Tone
function playPulsedTone(frequency, durationMs, pulseMs = 1000, gapMs = 300) {
  setupAudioGraph(frequency);

  const startTime = audioContext.currentTime;
  const totalSec = durationMs / 1000;
  const pulseSec = pulseMs / 1000;
  const cycleSec = (pulseMs + gapMs) / 1000;
  const ramp = 0.04;

  for (let t = 0; t < totalSec; t += cycleSec) {
    const pStart = startTime + t;
    const pEnd = Math.min(pStart + pulseSec, startTime + totalSec);

    gainNode.gain.setValueAtTime(0, pStart);
    gainNode.gain.linearRampToValueAtTime(1, pStart + ramp);
    gainNode.gain.setValueAtTime(1, Math.max(pEnd - ramp, pStart + ramp));
    gainNode.gain.linearRampToValueAtTime(0, pEnd);
  }

  oscillator.start(startTime);
  oscillator.stop(startTime + totalSec);
}

// 2. Continuous Tone (with smooth fade-in/fade-out)
function playTone(frequency, durationMs) {
  setupAudioGraph(frequency);
  const now = audioContext.currentTime;
  const stopTime = now + durationMs / 1000;

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(1, now + 0.08);
  gainNode.gain.setValueAtTime(1, stopTime - 0.08);
  gainNode.gain.linearRampToValueAtTime(0, stopTime);

  oscillator.start(now);
  oscillator.stop(stopTime);
}

function stopAudio() {
  if (oscillator) {
    try {
      oscillator.stop();
      oscillator.disconnect();
    } catch (e) {}
    oscillator = null;
  }
  if (gainNode) {
    gainNode.disconnect();
    gainNode = null;
  }
}

// Start Main Cleaning Process
async function startCleaning() {
  if (isPlaying) return;
  initAudio();

  isPlaying = true;
  updateUI(true);

  if (currentMode === "water") {
    const duration = 60000; // 60s
    playPulsedTone(165, duration, 1000, 300);
    animateProgress(duration, "Ejecting water (165Hz pulsed wave)...");
    await sleep(duration);

  } else if (currentMode === "dust") {
    const frequencies = [200, 300, 450, 700, 1000, 1500];
    const stepDuration = 7000;
    const totalDuration = frequencies.length * stepDuration;

    for (let i = 0; i < frequencies.length && isPlaying; i++) {
      const freq = frequencies[i];
      playTone(freq, stepDuration);
      
      const startTime = Date.now();
      while (Date.now() - startTime < stepDuration && isPlaying) {
        const elapsed = i * stepDuration + (Date.now() - startTime);
        updateProgressBar((elapsed / totalDuration) * 100, `Dust sweep active: ${freq} Hz`);
        await sleep(100);
      }
      stopAudio();
      await sleep(200);
    }

  } else if (currentMode === "vibrate") {
    const duration = 30000;
    playTone(80, duration);

    if ("vibrate" in navigator) {
      vibrationInterval = setInterval(() => {
        if (isPlaying) navigator.vibrate([200, 100]);
      }, 300);
    }

    animateProgress(duration, "Vibrating and loosening moisture...");
    await sleep(duration);
  }

  if (isPlaying) {
    stopCleaning();
    updateProgressBar(100, "Cleaning cycle complete! Run Sound Test below.");
  }
}

function stopCleaning() {
  isPlaying = false;
  stopAudio();
  if (vibrationInterval) {
    clearInterval(vibrationInterval);
    vibrationInterval = null;
  }
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
  updateUI(false);
  updateProgressBar(0, "Ready for cleaning cycle");
}

function animateProgress(durationMs, statusMsg) {
  const start = Date.now();
  progressInterval = setInterval(() => {
    if (!isPlaying) {
      clearInterval(progressInterval);
      return;
    }
    const elapsed = Date.now() - start;
    const percent = Math.min(100, (elapsed / durationMs) * 100);
    updateProgressBar(percent, statusMsg);
    if (percent >= 100) clearInterval(progressInterval);
  }, 100);
}

function updateProgressBar(percent, status) {
  const fill = document.getElementById("progressFill");
  const percentTxt = document.getElementById("progressPercent");
  const statusTxt = document.getElementById("statusText");

  if (fill) fill.style.width = `${percent}%`;
  if (percentTxt) percentTxt.textContent = `${Math.round(percent)}%`;
  if (statusTxt) statusTxt.textContent = status;
}

function updateUI(running) {
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  if (startBtn) startBtn.disabled = running;
  if (stopBtn) stopBtn.disabled = !running;
  
  document.querySelectorAll(".mode-btn, .speaker-btn").forEach(btn => {
    btn.disabled = running;
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// -------------------------------------------------------------
// Interactive Sound Diagnostic Tests
// -------------------------------------------------------------
function playDiagnosticTone(frequency, durationMs, buttonElement) {
  initAudio();
  stopAudio();

  const originalText = buttonElement ? buttonElement.textContent : "";
  if (buttonElement) buttonElement.textContent = "🔊 Playing...";

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(frequency, audioContext.currentTime);

  gain.gain.setValueAtTime(0, audioContext.currentTime);
  gain.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1);
  gain.gain.setValueAtTime(0.5, audioContext.currentTime + durationMs / 1000 - 0.1);
  gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + durationMs / 1000);

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.start();
  osc.stop(audioContext.currentTime + durationMs / 1000);

  setTimeout(() => {
    if (buttonElement) buttonElement.textContent = originalText;
  }, durationMs);
}

function playStereoCheck(buttonElement) {
  initAudio();
  stopAudio();

  const originalText = buttonElement ? buttonElement.textContent : "";
  if (buttonElement) buttonElement.textContent = "🔊 Panning Left ➔ Right...";

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const panner = audioContext.createStereoPanner();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5 note

  panner.pan.setValueAtTime(-1, audioContext.currentTime);
  panner.pan.linearRampToValueAtTime(1, audioContext.currentTime + 3);

  gain.gain.setValueAtTime(0.4, audioContext.currentTime);

  osc.connect(gain);
  gain.connect(panner);
  panner.connect(audioContext.destination);

  osc.start();
  osc.stop(audioContext.currentTime + 3);

  setTimeout(() => {
    if (buttonElement) buttonElement.textContent = originalText;
  }, 3000);
}

// Setup Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Mode selection buttons
  document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentMode = btn.dataset.mode;
    });
  });

  // Speaker channel buttons
  document.querySelectorAll(".speaker-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".speaker-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentSpeaker = btn.dataset.speaker;
    });
  });

  // Main cleaning controls
  document.getElementById("startBtn")?.addEventListener("click", startCleaning);
  document.getElementById("stopBtn")?.addEventListener("click", stopCleaning);

  // Sound Diagnostic buttons with live UI feedback
  const testMidBtn = document.getElementById("testMidBtn");
  testMidBtn?.addEventListener("click", () => playDiagnosticTone(440, 2500, testMidBtn));

  const testHighBtn = document.getElementById("testHighBtn");
  testHighBtn?.addEventListener("click", () => playDiagnosticTone(2500, 2500, testHighBtn));

  const testStereoBtn = document.getElementById("testStereoBtn");
  testStereoBtn?.addEventListener("click", () => playStereoCheck(testStereoBtn));

  // FAQ Accordion
  document.querySelectorAll(".faq-question").forEach(q => {
    q.addEventListener("click", () => {
      const item = q.parentElement;
      const isOpen = item.classList.contains("active");
      document.querySelectorAll(".faq-item").forEach(el => el.classList.remove("active"));
      if (!isOpen) item.classList.add("active");
    });
  });
});
