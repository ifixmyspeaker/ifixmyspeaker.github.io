// Web Audio API State & Sound Engine
let audioContext = null;
let oscillator = null;
let gainNode = null;
let pannerNode = null;
let analyserNode = null;
let isPlaying = false;
let currentMode = "water";
let currentSpeaker = "both";
let countdownInterval = null;
let vibrationInterval = null;
let animFrameId = null;

const TOTAL_DURATION_SEC = 60;
let remainingSec = TOTAL_DURATION_SEC;
const CIRCLE_CIRCUMFERENCE = 565.48; // 2 * Math.PI * 90

// -------------------------------------------------------------
// Internationalization (I18N) UI Text Dictionary
// -------------------------------------------------------------
const I18N = {
  en: {
    ejecting: "Ejecting water droplets (165Hz pulse)...",
    dustSweep: (f) => `Dislodging dust & debris: ${f} Hz sweep...`,
    vibrate: "Bass vibration active (80Hz rumble)...",
    complete: "Cleaning complete! Run Sound Test below to verify clarity.",
    ready: "Ready to clean phone speaker",
    done: "DONE",
    start: "START",
    tapEject: "Tap to eject",
    stop: "STOP",
    tapHalt: "Tap to halt"
  },
  es: {
    ejecting: "Expulsando gotas de agua (pulso 165Hz)...",
    dustSweep: (f) => `Desalojando polvo y residuos: barrido a ${f} Hz...`,
    vibrate: "Vibración de graves activa (retumbo 80Hz)...",
    complete: "¡Limpieza completada! Realiza la prueba de sonido abajo.",
    ready: "Listo para limpiar el altavoz",
    done: "LISTO",
    start: "INICIAR",
    tapEject: "Toca para expulsar",
    stop: "DETENER",
    tapHalt: "Toca para detener"
  },
  id: {
    ejecting: "Mengeluarkan butiran air (pulsa 165Hz)...",
    dustSweep: (f) => `Membersihkan debu & kotoran: sweep ${f} Hz...`,
    vibrate: "Getaran bass aktif (gemuruh 80Hz)...",
    complete: "Pembersihan selesai! Jalankan Tes Suara di bawah.",
    ready: "Siap membersihkan speaker ponsel",
    done: "SELESAI",
    start: "MULAI",
    tapEject: "Ketuk untuk keluarkan",
    stop: "BERHENTI",
    tapHalt: "Ketuk untuk berhenti"
  },
  ar: {
    ejecting: "جاري طرد قطرات الماء (نبضات 165 هرتز)...",
    dustSweep: (f) => `إزالة الغبار والرواسب: مسح تردد ${f} هرتز...`,
    vibrate: "الاهتزاز العميق نشط (تردد 80 هرتز)...",
    complete: "اكتمل التنظيف! قم بتشغيل اختبار الصوت أدناه للتحقق.",
    ready: "جاهز لتنظيف سماعة الهاتف",
    done: "تم",
    start: "ابدأ",
    tapEject: "اضغط للطرد",
    stop: "إيقاف",
    tapHalt: "اضغط للإيقاف"
  },
  hi: {
    ejecting: "पानी की बूँदें बाहर निकाल रहे हैं (165Hz पल्स)...",
    dustSweep: (f) => `धूल और कचरा साफ कर रहे हैं: ${f} Hz स्वीप...`,
    vibrate: "बास कंपन सक्रिय है (80Hz गड़गड़ाहट)...",
    complete: "सफाई पूरी हो गई! स्पष्टता की पुष्टि के लिए साउंड टेस्ट चलाएं।",
    ready: "फोन स्पीकर साफ करने के लिए तैयार",
    done: "पूर्ण",
    start: "शुरू",
    tapEject: "निकालने के लिए दबाएं",
    stop: "रोकें",
    tapHalt: "रोकने के लिए दबाएं"
  },
  pt: {
    ejecting: "Expelindo gotas de água (pulso 165Hz)...",
    dustSweep: (f) => `Removendo poeira e detritos: varredura de ${f} Hz...`,
    vibrate: "Vibração de graves ativa (rumble de 80Hz)...",
    complete: "Limpeza concluída! Execute o teste de som abaixo.",
    ready: "Pronto para limpar o alto-falante",
    done: "PRONTO",
    start: "INICIAR",
    tapEject: "Toque para ejetar",
    stop: "PARAR",
    tapHalt: "Toque para parar"
  },
  fr: {
    ejecting: "Éjection des gouttes d'eau (impulsion 165Hz)...",
    dustSweep: (f) => `Décollement poussière & débris : balayage ${f} Hz...`,
    vibrate: "Vibration des basses active (ronronnement 80Hz)...",
    complete: "Nettoyage terminé ! Faites le test audio ci-dessous.",
    ready: "Prêt à nettoyer le haut-parleur",
    done: "FINI",
    start: "DÉMARRER",
    tapEject: "Toucher pour éjecter",
    stop: "ARRÊTER",
    tapHalt: "Toucher pour stopper"
  },
  de: {
    ejecting: "Wassertropfen werden ausgestoßen (165Hz-Impuls)...",
    dustSweep: (f) => `Staub & Partikel lösen: ${f} Hz Frequenz...`,
    vibrate: "Bass-Vibration aktiv (80Hz Grollen)...",
    complete: "Reinigung abgeschlossen! Führen Sie den Soundtest unten durch.",
    ready: "Bereit zur Lautsprecher-Reinigung",
    done: "FERTIG",
    start: "START",
    tapEject: "Tippen zum Ausstoßen",
    stop: "STOPP",
    tapHalt: "Tippen zum Stoppen"
  },
  ru: {
    ejecting: "Выталкивание капель воды (импульс 165 Гц)...",
    dustSweep: (f) => `Удаление пыли и соринок: развертка ${f} Гц...`,
    vibrate: "Басовая вибрация активна (гул 80 Гц)...",
    complete: "Очистка завершена! Запустите аудиотест ниже.",
    ready: "Готов к очистке динамика телефона",
    done: "ГОТОВО",
    start: "СТАРТ",
    tapEject: "Нажмите для очистки",
    stop: "СТОП",
    tapHalt: "Нажмите для остановки"
  },
  ja: {
    ejecting: "水滴を排出中 (165Hzパルス音)...",
    dustSweep: (f) => `ホコリ・ゴミを除去中: ${f} Hzスイープ...`,
    vibrate: "重低音バイブレーション動作中 (80Hz)...",
    complete: "クリーニング完了！下のサウンドテストで確認してください。",
    ready: "スピーカーのクリーニング準備完了",
    done: "完了",
    start: "開始",
    tapEject: "タップして排出",
    stop: "停止",
    tapHalt: "タップして停止"
  },
  zh: {
    ejecting: "正在排出水珠 (165Hz脉冲音)...",
    dustSweep: (f) => `清除灰尘杂质: ${f} Hz扫频...`,
    vibrate: "低音振动已激活 (80Hz轰鸣)...",
    complete: "清理完成！请在下方运行声音测试以验证音质。",
    ready: "已就绪，随时清理手机扬声器",
    done: "完成",
    start: "开始",
    tapEject: "点击排出",
    stop: "停止",
    tapHalt: "点击暂停"
  },
  it: {
    ejecting: "Espulsione gocce d'acqua (impulso 165Hz)...",
    dustSweep: (f) => `Rimozione polvere e detriti: scansione ${f} Hz...`,
    vibrate: "Vibrazione bassi attiva (rimbombo 80Hz)...",
    complete: "Pulizia completata! Esegui il test audio in basso.",
    ready: "Pronto per pulire l'altoparlante",
    done: "FATTO",
    start: "AVVIA",
    tapEject: "Tocca per espellere",
    stop: "FERMA",
    tapHalt: "Tocca per fermare"
  },
  tr: {
    ejecting: "Su damlacıkları tahliye ediliyor (165Hz darbe)...",
    dustSweep: (f) => `Toz ve kalıntılar temizleniyor: ${f} Hz tarama...`,
    vibrate: "Bas titreşimi aktif (80Hz uğultu)...",
    complete: "Temizleme tamamlandı! Netliği kontrol etmek için test yapın.",
    ready: "Hoparlör temizliği için hazır",
    done: "BİTTİ",
    start: "BAŞLAT",
    tapEject: "Tahliye için dokun",
    stop: "DURDUR",
    tapHalt: "Durdurmak için dokun"
  },
  vi: {
    ejecting: "Đang đẩy giọt nước ra ngoài (xung 165Hz)...",
    dustSweep: (f) => `Loại bỏ bụi bẩn: quét tần số ${f} Hz...`,
    vibrate: "Rung âm trầm đang hoạt động (80Hz)...",
    complete: "Đã làm sạch xong! Chạy thử nghiệm âm thanh bên dưới.",
    ready: "Sẵn sàng làm sạch loa điện thoại",
    done: "XONG",
    start: "BẮT ĐẦU",
    tapEject: "Chạm để đẩy nước",
    stop: "DỪNG",
    tapHalt: "Chạm để dừng"
  },
  ko: {
    ejecting: "물방울 배출 중 (165Hz 펄스 음)...",
    dustSweep: (f) => `먼지 및 이물질 제거 중: ${f} Hz 스윕...`,
    vibrate: "베이스 진동 작동 중 (80Hz 럼블)...",
    complete: "클리닝 완료! 아래의 사운드 테스트를 실행해 보세요.",
    ready: "스피ーカー 클리닝 준비 완료",
    done: "완료",
    start: "시작",
    tapEject: "탭하여 물 배출",
    stop: "중지",
    tapHalt: "탭하여 중지"
  }
};

function getLang() {
  const code = (document.documentElement.lang || 'en').toLowerCase().split('-')[0];
  return I18N[code] ? code : 'en';
}

function t(key, arg) {
  const lang = getLang();
  const res = I18N[lang] && I18N[lang][key] ? I18N[lang][key] : I18N.en[key];
  if (typeof res === 'function') {
    return res(arg);
  }
  return res || '';
}

// Initialize or resume AudioContext safely on user gesture
function initAudio() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

// Build Audio Node Graph: Oscillator -> Gain -> Panner -> Analyser -> Destination
function setupAudioGraph(frequency) {
  stopAudioNodes();

  oscillator = audioContext.createOscillator();
  gainNode = audioContext.createGain();
  pannerNode = audioContext.createStereoPanner();
  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = 256;

  // Channel balance: Left / Earpiece (-1), Right / Bottom (+1), Both (0)
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
  pannerNode.connect(analyserNode);
  analyserNode.connect(audioContext.destination);
}

// 1. Water Eject Mode: 165Hz Pulsed Tone (Acoustic Excursion Wave)
function playPulsedTone(frequency, durationMs, pulseMs = 1000, gapMs = 250) {
  setupAudioGraph(frequency);

  const startTime = audioContext.currentTime;
  const totalSec = durationMs / 1000;
  const pulseSec = pulseMs / 1000;
  const cycleSec = (pulseMs + gapMs) / 1000;
  const ramp = 0.03;

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

// 2. Continuous Tone
function playTone(frequency, durationMs) {
  setupAudioGraph(frequency);
  const now = audioContext.currentTime;
  const stopTime = now + durationMs / 1000;

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(1, now + 0.05);
  gainNode.gain.setValueAtTime(1, stopTime - 0.05);
  gainNode.gain.linearRampToValueAtTime(0, stopTime);

  oscillator.start(now);
  oscillator.stop(stopTime);
}

function stopAudioNodes() {
  if (oscillator) {
    try {
      oscillator.stop();
      oscillator.disconnect();
    } catch (e) {}
    oscillator = null;
  }
  if (gainNode) {
    try {
      gainNode.disconnect();
    } catch (e) {}
    gainNode = null;
  }
  if (pannerNode) {
    try {
      pannerNode.disconnect();
    } catch (e) {}
    pannerNode = null;
  }
}

// Start Main Cleaning Process
async function startCleaning() {
  if (isPlaying) {
    stopCleaning();
    return;
  }

  initAudio();
  isPlaying = true;
  remainingSec = TOTAL_DURATION_SEC;
  updateUI(true);
  startWaveformVisualizer();

  const totalMs = TOTAL_DURATION_SEC * 1000;
  startCountdown(TOTAL_DURATION_SEC);

  if (currentMode === "water") {
    playPulsedTone(165, totalMs, 1000, 250);
    updateStatusText(t("ejecting"));
    await sleep(totalMs);

  } else if (currentMode === "dust") {
    const frequencies = [200, 300, 450, 700, 1000, 1500];
    const stepDuration = Math.floor(totalMs / frequencies.length);

    for (let i = 0; i < frequencies.length && isPlaying; i++) {
      const freq = frequencies[i];
      playTone(freq, stepDuration);
      updateStatusText(t("dustSweep", freq));
      await sleep(stepDuration);
      stopAudioNodes();
      await sleep(150);
    }

  } else if (currentMode === "vibrate") {
    playTone(80, totalMs);
    updateStatusText(t("vibrate"));

    if ("vibrate" in navigator) {
      vibrationInterval = setInterval(() => {
        if (isPlaying) {
          navigator.vibrate([250, 100]);
        }
      }, 350);
    }

    await sleep(totalMs);
  }

  if (isPlaying) {
    completeCleaning();
  }
}

// Timer Countdown & SVG Progress Ring
function startCountdown(durationSec) {
  clearInterval(countdownInterval);
  updateProgressRing(0);

  countdownInterval = setInterval(() => {
    if (!isPlaying) {
      clearInterval(countdownInterval);
      return;
    }

    remainingSec--;
    const percent = ((durationSec - remainingSec) / durationSec) * 100;
    updateProgressRing(percent);

    const timerSpan = document.getElementById("countdownTimer");
    if (timerSpan) {
      timerSpan.textContent = `${remainingSec}s`;
    }

    if (remainingSec <= 0) {
      clearInterval(countdownInterval);
    }
  }, 1000);
}

function updateProgressRing(percent) {
  const circle = document.getElementById("progressCircle");
  if (circle) {
    const offset = CIRCLE_CIRCUMFERENCE - (percent / 100) * CIRCLE_CIRCUMFERENCE;
    circle.style.strokeDashoffset = offset;
  }
}

function completeCleaning() {
  isPlaying = false;
  stopAudioNodes();
  clearInterval(countdownInterval);
  if (vibrationInterval) clearInterval(vibrationInterval);

  updateProgressRing(100);
  updateUI(false);
  updateStatusText(t("complete"));

  const timerSpan = document.getElementById("countdownTimer");
  if (timerSpan) timerSpan.textContent = t("done");
}

function stopCleaning() {
  isPlaying = false;
  stopAudioNodes();
  if (vibrationInterval) {
    clearInterval(vibrationInterval);
    vibrationInterval = null;
  }
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  updateProgressRing(0);
  updateUI(false);
  updateStatusText(t("ready"));

  const timerSpan = document.getElementById("countdownTimer");
  if (timerSpan) timerSpan.textContent = "60s";
}

function updateStatusText(text) {
  const statusEl = document.getElementById("statusText");
  if (statusEl) statusEl.textContent = text;
}

function updateUI(running) {
  const masterBtn = document.getElementById("masterEjectBtn");
  const startBtn = document.getElementById("btnCleanStart");
  const stopBtn = document.getElementById("btnCleanStop");
  const statusBadge = document.getElementById("statusBadge");
  const progressCircle = document.getElementById("progressCircle");
  const btnSubtext = document.getElementById("btnSubtext");
  const btnTitle = document.getElementById("btnPrimaryText");

  if (running) {
    masterBtn.classList.add("running");
    progressCircle?.classList.add("active-pulse");
    statusBadge?.classList.add("active-clean");
    if (btnTitle) btnTitle.textContent = t("stop");
    if (btnSubtext) btnSubtext.textContent = t("tapHalt");
    if (startBtn) startBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = false;
  } else {
    masterBtn.classList.remove("running");
    progressCircle?.classList.remove("active-pulse");
    statusBadge?.classList.remove("active-clean");
    if (btnTitle) btnTitle.textContent = t("start");
    if (btnSubtext) btnSubtext.textContent = t("tapEject");
    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
  }

  document.querySelectorAll(".mode-tab, .channel-btn").forEach(btn => {
    btn.disabled = running;
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// -------------------------------------------------------------
// Real-Time Waveform Visualizer (Canvas Oscilloscope)
// -------------------------------------------------------------
function startWaveformVisualizer() {
  const canvas = document.getElementById("waveformCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function draw() {
    animFrameId = requestAnimationFrame(draw);

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (!isPlaying || !analyserNode) {
      // Draw subtle idle breathing line
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(6, 182, 212, 0.25)";
      ctx.beginPath();
      const mid = height / 2;
      const t = Date.now() / 600;
      ctx.moveTo(0, mid);
      for (let x = 0; x < width; x += 10) {
        ctx.lineTo(x, mid + Math.sin(x * 0.03 + t) * 3);
      }
      ctx.stroke();
      return;
    }

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserNode.getByteTimeDomainData(dataArray);

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#22c55e";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#06b6d4";

    ctx.beginPath();
    const sliceWidth = (width * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(width, height / 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  if (!animFrameId) {
    draw();
  }
}

// -------------------------------------------------------------
// Interactive Sound Diagnostic Tests (Clarity Checkers)
// -------------------------------------------------------------
function playDiagnosticTone(frequency, durationMs) {
  initAudio();
  stopAudioNodes();

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
}

function playStereoCheck() {
  initAudio();
  stopAudioNodes();

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const panner = audioContext.createStereoPanner();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5 note

  // Pan from Left (-1) to Right (+1) over 3 seconds
  panner.pan.setValueAtTime(-1, audioContext.currentTime);
  panner.pan.linearRampToValueAtTime(1, audioContext.currentTime + 3);

  gain.gain.setValueAtTime(0.4, audioContext.currentTime);

  osc.connect(gain);
  gain.connect(panner);
  panner.connect(audioContext.destination);

  osc.start();
  osc.stop(audioContext.currentTime + 3);
}

// -------------------------------------------------------------
// DOM Event Initializations
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Fix Canvas resolution for Retina Displays
  const canvas = document.getElementById("waveformCanvas");
  if (canvas) {
    canvas.width = canvas.offsetWidth * window.devicePixelRatio || 600;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio || 60;
    startWaveformVisualizer();
  }

  // Master circular button tap
  document.getElementById("masterEjectBtn")?.addEventListener("click", startCleaning);

  // Footer clean controls
  document.getElementById("btnCleanStart")?.addEventListener("click", startCleaning);
  document.getElementById("btnCleanStop")?.addEventListener("click", stopCleaning);

  // Mode tabs
  document.querySelectorAll(".mode-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      if (isPlaying) return;
      document.querySelectorAll(".mode-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentMode = tab.dataset.mode;
    });
  });

  // Channel buttons
  document.querySelectorAll(".channel-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (isPlaying) return;
      document.querySelectorAll(".channel-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentSpeaker = btn.dataset.channel;
    });
  });

  // Sound Diagnostic Buttons
  document.getElementById("testVoiceBtn")?.addEventListener("click", () => playDiagnosticTone(440, 2500));
  document.getElementById("testTrebleBtn")?.addEventListener("click", () => playDiagnosticTone(2500, 2500));
  document.getElementById("testStereoBtn")?.addEventListener("click", playStereoCheck);

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