function getData() {
  // 1️⃣ Read inputs
  let syllabus = Number(document.getElementById("syllabus").value);
  let study = Number(document.getElementById("study").value) * 10;
  let sleep = Number(document.getElementById("sleep").value) * 10;
  let mock = Number(document.getElementById("mock").value);
  let revision = Number(document.getElementById("revision").value) * 100;

  // 2️⃣ Validation
  if (
    isNaN(syllabus) || isNaN(study) ||
    isNaN(sleep) || isNaN(mock)
  ) {
    alert("Please enter valid numbers");
    return;
  }

  // 3️⃣ Calculate readiness score
  let score =
    (0.3 * syllabus) +
    (0.2 * study) +
    (0.2 * mock) +
    (0.2 * revision) +
    (0.1 * sleep);

  // 4️⃣ Result message
  let message = "";
  if (score >= 75) {
    message = "✅ You are Exam Ready!";
  } else if (score >= 50) {
    message = "⚠ You are Almost Ready. Revise weak areas.";
  } else {
    message = "❌ You are Not Ready. Need more preparation.";
  }

  // 5️⃣ Show score + message
  document.getElementById("output").innerHTML =
    "Your Exam Readiness Score is: <b>" +
    Math.round(score) + "%</b><br>" +
    message;

  // 6️⃣ Suggestions
  let suggestions = "<br><br><b>Suggestions:</b><br>";
  if (syllabus < 60) suggestions += "📘 Complete syllabus properly<br>";
  if (study < 40) suggestions += "⏰ Increase daily study hours<br>";
  if (sleep < 60) suggestions += "😴 Improve your sleep routine<br>";
  if (mock < 50) suggestions += "📝 Practice more mock tests<br>";
  if (revision === 0) suggestions += "🔁 Start revision immediately<br>";

  document.getElementById("output").innerHTML += suggestions;

  // 7️⃣ Progress bar update (THIS IS STEP-7 JS)
  let bar = document.getElementById("progress-bar");
  bar.style.width = Math.round(score) + "%";

  if (score >= 75) {
    bar.style.background = "green";
  } else if (score >= 50) {
    bar.style.background = "orange";
  } else {
    bar.style.background = "red";
  }
}
