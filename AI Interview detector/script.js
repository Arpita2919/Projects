// ===============================
// THEME TOGGLE (LIGHT / DARK)
// ===============================
const themeToggle = document.getElementById("themeToggle");

// Load saved theme
const savedTheme = localStorage.getItem("theme") || "light";
document.body.setAttribute("data-theme", savedTheme);
themeToggle.textContent =
  savedTheme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";

themeToggle.addEventListener("click", () => {
  const currentTheme = document.body.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  document.body.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);

  themeToggle.textContent =
    newTheme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
});

// ===============================
// INTERVIEW QUESTIONS
// ===============================
const questions = [
  "Tell me about yourself.",
  "What are your strengths?",
  "What are your weaknesses?",
  "Why should we hire you?",
  "Where do you see yourself in 5 years?"
];

// ===============================
// STATE VARIABLES
// ===============================
let currentQuestion = 0;
let isAnswering = false;
let answerStartTime = null;

// Speech analysis
let finalTranscript = "";
let wordCount = 0;
let lastSpeechTime = null;
let longPauses = 0;

// Filler words
const fillerWords = ["um", "uh", "like", "you know", "actually", "basically"];
let fillerCount = 0;

// Eye contact
let eyeContactTime = 0;
let lookingAwayTime = 0;

// ===============================
// SPEECH RECOGNITION
// ===============================
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  alert("Speech Recognition not supported in this browser.");
}

const recognition = new SpeechRecognition();
recognition.lang = "en-IN";
recognition.interimResults = true;
recognition.continuous = false;

// ===============================
// DOM ELEMENTS
// ===============================
const questionText = document.getElementById("question-text");
const questionNumber = document.getElementById("question-number");
const transcriptDiv = document.getElementById("transcript");

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const nextBtn = document.getElementById("nextBtn");
const pdfBtn = document.getElementById("pdfBtn");

// Camera
const videoElement = document.getElementById("video");
const faceStatus = document.getElementById("faceStatus");

// Dashboard
const scoreBar = document.getElementById("scoreBar");
const scoreText = document.getElementById("scoreText");
const eyeBar = document.getElementById("eyeBar");
const eyeText = document.getElementById("eyeText");
const wpmText = document.getElementById("wpmText");
const pauseText = document.getElementById("pauseText");
const fillerText = document.getElementById("fillerText");

// ===============================
// INITIAL UI SETUP
// ===============================
questionText.textContent = questions[0];
questionNumber.textContent = "Question 1";
stopBtn.disabled = true;
pdfBtn.disabled = true;

// ===============================
// START ANSWER
// ===============================
startBtn.addEventListener("click", () => {
  if (isAnswering) return;

  isAnswering = true;
  answerStartTime = Date.now();

  // Reset metrics
  finalTranscript = "";
  transcriptDiv.textContent = "";
  wordCount = 0;
  fillerCount = 0;
  longPauses = 0;
  lastSpeechTime = null;
  eyeContactTime = 0;
  lookingAwayTime = 0;

  startBtn.disabled = true;
  stopBtn.disabled = false;
  pdfBtn.disabled = true;

  recognition.start();
});

// ===============================
// STOP ANSWER
// ===============================
stopBtn.addEventListener("click", () => {
  if (!isAnswering) return;

  isAnswering = false;
  recognition.stop();

  const duration = Math.max(
    1,
    Math.round((Date.now() - answerStartTime) / 1000)
  );

  const wpm = Math.round((wordCount / duration) * 60);

  const gazeTotal = eyeContactTime + lookingAwayTime;
  const eyePercent = gazeTotal
    ? Math.round((eyeContactTime / gazeTotal) * 100)
    : 0;

  const finalScore = calculateScore(wpm, longPauses, fillerCount, eyePercent);

  // Update dashboard
  scoreBar.style.width = finalScore + "%";
  scoreText.textContent = finalScore + " / 100";

  eyeBar.style.width = eyePercent + "%";
  eyeText.textContent = eyePercent + "%";

  wpmText.textContent = wpm;
  pauseText.textContent = longPauses;
  fillerText.textContent = fillerCount;

  startBtn.disabled = false;
  stopBtn.disabled = true;
  pdfBtn.disabled = false;
});

// ===============================
// NEXT QUESTION
// ===============================
nextBtn.addEventListener("click", () => {
  if (isAnswering) {
    alert("Stop the current answer first.");
    return;
  }

  currentQuestion++;

  if (currentQuestion < questions.length) {
    questionText.textContent = questions[currentQuestion];
    questionNumber.textContent = "Question " + (currentQuestion + 1);
    transcriptDiv.textContent = "";
  } else {
    questionText.textContent = "Interview Completed";
    questionNumber.textContent = "";
    startBtn.disabled = true;
    stopBtn.disabled = true;
    nextBtn.disabled = true;
  }
});

// ===============================
// SPEECH RESULT HANDLER
// ===============================
recognition.onresult = (event) => {
  const now = Date.now();
  let interim = "";

  if (lastSpeechTime && now - lastSpeechTime > 2500) {
    longPauses++;
  }
  lastSpeechTime = now;

  for (let i = event.resultIndex; i < event.results.length; i++) {
    const text = event.results[i][0].transcript;

    if (event.results[i].isFinal) {
      finalTranscript += text + " ";
      wordCount += text.trim().split(/\s+/).length;

      const lower = text.toLowerCase();
      fillerWords.forEach(word => {
        fillerCount += lower.split(word).length - 1;
      });
    } else {
      interim += text;
    }
  }

  transcriptDiv.textContent = finalTranscript + interim;
};

recognition.onend = () => {
  if (isAnswering) recognition.start();
};

// ===============================
// FACE + EYE CONTACT (MediaPipe)
// ===============================
const faceDetection = new FaceDetection({
  locateFile: file =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
});

faceDetection.setOptions({
  model: "short",
  minDetectionConfidence: 0.6
});

faceDetection.onResults(results => {
  if (results.detections.length > 0) {
    const x = results.detections[0].boundingBox.xCenter;

    if (x > 0.4 && x < 0.6) {
      eyeContactTime += 100;
      faceStatus.textContent = "Looking at camera 👁️";
    } else {
      lookingAwayTime += 100;
      faceStatus.textContent = "Looking away ❌";
    }
  } else {
    faceStatus.textContent = "Face not detected ❌";
  }
});

// Start camera
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceDetection.send({ image: videoElement });
  },
  width: 300,
  height: 220
});
camera.start();

// ===============================
// PDF GENERATION
// ===============================
pdfBtn.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("AI Interview Performance Report", 20, 20);

  doc.setFontSize(12);
  doc.text(`Question: ${currentQuestion + 1}`, 20, 35);
  doc.text(`WPM: ${wpmText.textContent}`, 20, 45);
  doc.text(`Pauses: ${pauseText.textContent}`, 20, 55);
  doc.text(`Filler Words: ${fillerText.textContent}`, 20, 65);
  doc.text(`Eye Contact: ${eyeText.textContent}`, 20, 75);
  doc.text(`Final Score: ${scoreText.textContent}`, 20, 85);

  doc.save(`Interview_Report_Q${currentQuestion + 1}.pdf`);
});

// ===============================
// SCORING FUNCTION
// ===============================
function calculateScore(wpm, pauses, fillers, eye) {
  let score = 0;

  // Speed (25)
  if (wpm >= 90 && wpm <= 160) score += 25;
  else if (wpm >= 70 && wpm <= 180) score += 15;
  else score += 5;

  // Pauses (20)
  if (pauses === 0) score += 20;
  else if (pauses <= 2) score += 15;
  else score += 5;

  // Fillers (20)
  if (fillers === 0) score += 20;
  else if (fillers <= 3) score += 15;
  else score += 5;

  // Eye contact (35)
  if (eye >= 70) score += 35;
  else if (eye >= 50) score += 25;
  else score += 10;

  return score;
}
