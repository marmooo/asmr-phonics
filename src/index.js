let problems = [];
let problem = ["ASMR", "Phonics"];
let paused = false;
let englishVoices = [];
let japaneseVoices = [];
loadConfig();

function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
}

function toggleDarkMode() {
  if (localStorage.getItem("darkMode") == 1) {
    localStorage.setItem("darkMode", 0);
    document.documentElement.setAttribute("data-bs-theme", "light");
  } else {
    localStorage.setItem("darkMode", 1);
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
}

function loadVoices() {
  // https://stackoverflow.com/questions/21513706/
  const allVoicesObtained = new Promise((resolve) => {
    let voices = speechSynthesis.getVoices();
    if (voices.length !== 0) {
      resolve(voices);
    } else {
      let supported = false;
      speechSynthesis.addEventListener("voiceschanged", () => {
        supported = true;
        voices = speechSynthesis.getVoices();
        resolve(voices);
      });
      setTimeout(() => {
        if (!supported) {
          document.getElementById("noTTS").classList.remove("d-none");
        }
      }, 1000);
    }
  });
  const jokeVoices = [
    // "com.apple.eloquence.en-US.Flo",
    "com.apple.speech.synthesis.voice.Bahh",
    "com.apple.speech.synthesis.voice.Albert",
    // "com.apple.speech.synthesis.voice.Fred",
    "com.apple.speech.synthesis.voice.Hysterical",
    "com.apple.speech.synthesis.voice.Organ",
    "com.apple.speech.synthesis.voice.Cellos",
    "com.apple.speech.synthesis.voice.Zarvox",
    // "com.apple.eloquence.en-US.Rocko",
    // "com.apple.eloquence.en-US.Shelley",
    // "com.apple.speech.synthesis.voice.Princess",
    // "com.apple.eloquence.en-US.Grandma",
    // "com.apple.eloquence.en-US.Eddy",
    "com.apple.speech.synthesis.voice.Bells",
    // "com.apple.eloquence.en-US.Grandpa",
    "com.apple.speech.synthesis.voice.Trinoids",
    // "com.apple.speech.synthesis.voice.Kathy",
    // "com.apple.eloquence.en-US.Reed",
    "com.apple.speech.synthesis.voice.Boing",
    "com.apple.speech.synthesis.voice.Whisper",
    "com.apple.speech.synthesis.voice.Deranged",
    "com.apple.speech.synthesis.voice.GoodNews",
    "com.apple.speech.synthesis.voice.BadNews",
    "com.apple.speech.synthesis.voice.Bubbles",
    // "com.apple.voice.compact.en-US.Samantha",
    // "com.apple.eloquence.en-US.Sandy",
    // "com.apple.speech.synthesis.voice.Junior",
    // "com.apple.speech.synthesis.voice.Ralph",
  ];
  allVoicesObtained.then((voices) => {
    englishVoices = voices
      .filter((voice) => voice.lang == "en-US")
      .filter((voice) => !jokeVoices.includes(voice.voiceURI));
    japaneseVoices = voices.filter((voice) => voice.lang == "ja-JP");
  });
}
loadVoices();

function speak(text, lang) {
  speechSynthesis.cancel();
  const msg = new SpeechSynthesisUtterance(text);
  if (lang == "en-US") {
    msg.voice = englishVoices[Math.floor(Math.random() * englishVoices.length)];
    msg.lang = "en-US";
  } else {
    msg.voice =
      japaneseVoices[Math.floor(Math.random() * japaneseVoices.length)];
    msg.lang = "ja-JP";
  }
  speechSynthesis.speak(msg);
  return msg;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function initProblems() {
  const grade = document.getElementById("gradeOption").radio.value;
  fetch("data/" + grade + ".csv")
    .then((response) => response.text())
    .then((tsv) => {
      problems = [];
      tsv.trim().split("\n").forEach((line) => {
        const [en, ja] = line.split(",");
        problems.push([en, ja]);
      });
    });
}
initProblems();

function respeak() {
  paused = true;
  document.getElementById("startButton").classList.remove("d-none");
  document.getElementById("stopButton").classList.add("d-none");
  speechSynthesis.cancel();
  const [en, ja] = problem;
  let text = en;
  for (let i = 0; i < 2; i++) {
    text += ", " + en;
  }
  const msgEn = speak(text, "en-US");
  msgEn.onend = () => {
    if (paused) {
      const msgJa = speak(ja, "ja-JP");
      msgJa.onend = () => {
        if (paused) respeak();
      };
    }
  };
  // iOS API is broken
  if (/(iPad|iPhone|iPod|Macintosh)/.test(navigator.userAgent)) {
    setTimeout(() => {
      document.getElementById("startButton").classList.remove("d-none");
      document.getElementById("stopButton").classList.add("d-none");
    }, 2000);
  }
}

function startASMR() {
  paused = false;
  document.getElementById("startButton").classList.add("d-none");
  document.getElementById("stopButton").classList.remove("d-none");
  speechSynthesis.cancel();
  problem = problems[getRandomInt(0, problems.length)];
  const [en, ja] = problem;
  const text = en.split("").join("-") + " is, " + en;
  const msgEn = speak(text, "en-US");
  msgEn.onend = () => {
    if (!paused) {
      const msgJa = speak(ja, "ja-JP");
      msgJa.onend = () => {
        if (!paused) startASMR();
      };
    }
  };
}

function stopASMR() {
  paused = true;
  document.getElementById("startButton").classList.remove("d-none");
  document.getElementById("stopButton").classList.add("d-none");
  speechSynthesis.cancel();
}

function speakAnswer() {
  speak(problem[1], "ja-JP");
}

document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
document.getElementById("startButton").onclick = startASMR;
document.getElementById("stopButton").onclick = stopASMR;
document.getElementById("respeak").onclick = respeak;
document.getElementById("answer").onclick = speakAnswer;
document.getElementById("gradeOption").onchange = initProblems;
