let usedWords = [];
let currentWords = [];
let score = 0;
let selected = null;
let locked = false;
let time = 0;
let timer;
let timerRunning = false;

function formatTime(s) {
  const m = String(Math.floor(s / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  return m + ":" + sec;
}

function speak(text, lang) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = 0.9;
  speechSynthesis.speak(utter);
}

function getTenWords() {
  const pool = wordList.filter(w => !usedWords.includes(w.en));
  if (pool.length === 0) {
    alert("🎉 恭喜你！已完成全部单词练习！");
    return null;
  }
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const ten = shuffled.slice(0, 10);
  usedWords.push(...ten.map(w => w.en));
  return ten;
}

function render() {
  const container = document.getElementById("container");
  container.innerHTML = "";
  selected = null;
  locked = false;

  const ens = currentWords.map(w => ({ type: "en", text: w.en, match: w.cn }));
  const cns = currentWords.map(w => ({ type: "cn", text: w.cn, match: w.en }));
  const all = [...ens, ...cns].sort(() => Math.random() - 0.5);

  all.forEach(item => {
    const bubble = document.createElement("div");
    bubble.className = "bubble flex items-center justify-center rounded-full font-bold shadow-md aspect-square " +
      (item.type === "en" ? "bg-pink-300 text-lg" : "bg-green-300 text-base");
    bubble.textContent = item.text;

    bubble.addEventListener("click", () => {
      if (locked || bubble.classList.contains("vanish")) return;
      if (bubble === selected?.bubble) return;

      item.type === "en" ? speak(item.text, "en-US") : speak(item.text, "zh-CN");

      if (!selected) {
        selected = { bubble, matchText: item.match };
        bubble.classList.add("selected");
        return;
      }

      locked = true;
      if (selected.matchText === item.text && item.match === selected.bubble.textContent) {
        selected.bubble.classList.add("vanish");
        bubble.classList.add("vanish");
        score += 10;
        document.getElementById("score").textContent = score;
        setTimeout(() => {
          selected = null;
          locked = false;
          checkFinish();
        }, 600);
      } else {
        setTimeout(() => {
          selected.bubble.classList.remove("selected");
          selected = null;
          locked = false;
        }, 400);
      }
    });
    container.appendChild(bubble);
  });
}

function checkFinish() {
  if (document.querySelectorAll(".vanish").length === 20) {
    clearInterval(timer);
    document.getElementById("restart").classList.remove("hidden");
    const utter = new SpeechSynthesisUtterance('红豆太棒啦');
    utter.lang = "zh-CN";
    speechSynthesis.speak(utter);
  }
}

function start() {
  currentWords = getTenWords();
  if (!currentWords) return;
  render();
  document.getElementById("restart").classList.add("hidden");
  if (!timerRunning) {
    timerRunning = true;
    timer = setInterval(() => {
      time++;
      document.getElementById("timer").textContent = formatTime(time);
    }, 1000);
  }
}

document.getElementById("restart").onclick = start;
window.onload = start;