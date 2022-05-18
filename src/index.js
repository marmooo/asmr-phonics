let paused = false;
let problem = ["ASMR", "Phonics"];
let englishVoices = [];
let japaneseVoices = [];
loadConfig();

function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.dataset.theme = "dark";
  }
}

function toggleDarkMode() {
  if (localStorage.getItem("darkMode") == 1) {
    localStorage.setItem("darkMode", 0);
    delete document.documentElement.dataset.theme;
  } else {
    localStorage.setItem("darkMode", 1);
    document.documentElement.dataset.theme = "dark";
  }
}

function loadVoices() {
  // https://stackoverflow.com/questions/21513706/
  const allVoicesObtained = new Promise(function (resolve) {
    let voices = speechSynthesis.getVoices();
    if (voices.length !== 0) {
      resolve(voices);
    } else {
      let supported = false;
      speechSynthesis.addEventListener("voiceschanged", function () {
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
  allVoicesObtained.then((voices) => {
    englishVoices = voices.filter((voice) => voice.lang == "en-US");
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
  let text = problem[0];
  for (let i = 0; i < 2; i++) {
    text += ", " + problem[0];
  }
  const msgEn = speak(text, "en-US");
  msgEn.onend = function () {
    if (paused) {
      const msgJa = speak(problem[1], "ja-JP");
      msgJa.onend = () => {
        if (paused) {
          respeak();
        }
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
  const text = problem[0].split("").join("-") + " is, " + problem[0];
  const msgEn = speak(text, "en-US");
  msgEn.onend = function () {
    if (!paused) {
      const msgJa = speak(problem[1], "ja-JP");
      msgJa.onend = () => {
        if (!paused) {
          startASMR();
        }
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
