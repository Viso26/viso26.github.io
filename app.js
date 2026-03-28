const questions = [
  { text: 'C’est un muffin ou un chien ?', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc500f?auto=format&fit=crop&w=900&q=80', choices: ['Muffin','Chien'], answer: 'Muffin' },
  { text: 'C’est une chambre du Crous ou une cellule ?', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80', choices: ['Chambre du Crous','Cellule de prison'], answer: 'Chambre du Crous' },
  { text: 'C’est un cookie ou un chat ?', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=900&q=80', choices: ['Cookie','Chat'], answer: 'Chat' },
  { text: 'C’est une pizza ou un sac ?', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80', choices: ['Pizza','Sac'], answer: 'Pizza' }
];

const elImage = document.getElementById('questionImage');
const elText = document.getElementById('questionText');
const elChoices = document.getElementById('choices');
const elFeedback = document.getElementById('feedback');
const elNext = document.getElementById('nextBtn');
const elProgress = document.getElementById('progress');
const elScore = document.getElementById('scorePill');

let index = 0;
let score = 0;
let locked = false;

function render() {
  locked = false;
  const q = questions[index];
  elImage.src = q.image;
  elText.textContent = q.text;
  elProgress.textContent = `Question ${index + 1}/${questions.length}`;
  elFeedback.textContent = '';
  elFeedback.className = 'feedback';
  elNext.classList.add('hidden');
  elChoices.innerHTML = '';
  q.choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.textContent = choice;
    btn.addEventListener('click', () => pick(choice, btn));
    elChoices.appendChild(btn);
  });
}

function pick(choice, btn) {
  if (locked) return;
  locked = true;
  const q = questions[index];
  const buttons = [...elChoices.querySelectorAll('button')];
  buttons.forEach(b => b.disabled = true);
  if (choice === q.answer) {
    score++;
    elFeedback.textContent = 'Bonne réponse !';
    elFeedback.classList.add('good');
    btn.style.background = '#15803d';
  } else {
    elFeedback.textContent = `Raté — c’était ${q.answer}.`;
    elFeedback.classList.add('bad');
    btn.style.background = '#b91c1c';
    buttons.find(b => b.textContent === q.answer)?.style.setProperty('background', '#15803d');
  }
  elScore.textContent = `Score : ${score}`;
  elNext.classList.remove('hidden');
}

elNext.addEventListener('click', () => {
  index++;
  if (index >= questions.length) {
    index++; // ou après le dernier render
    elText.textContent = "Fin de la partie";
    elImage.removeAttribute("src");
    elChoices.innerHTML = "";
    
    // demande un pseudo
    const name = prompt("Ton prénom/pseudo :", "Sans nom") || "Anonyme";
    const finalScore = score;
    
    saveScore(name, finalScore);
    elFeedback.textContent = `Score : ${finalScore}/${questions.length}`;
    elFeedback.className = "feedback good";
    elScore.textContent = `Score : ${finalScore}`;
    elNext.classList.add("hidden");
    
    // ajouter un bouton pour voir le classement
    const btnRank = document.createElement("button");
    btnRank.className = "next";
    btnRank.textContent = "Voir le classement";
    btnRank.onclick = showRanking;
    document.querySelector(".card").appendChild(btnRank);
  }
  render();
});

render();

// ───── Sauvegarde du score avec pseudo ─────

const highScoresKey = "image_quiz_scores";

function loadScores() {
  const json = localStorage.getItem(highScoresKey);
  return json ? JSON.parse(json) : [];
}

function saveScore(name, score) {
  const list = loadScores();
  list.push({ name, score, date: new Date().toISOString() });
  // tri par score décroissant, garder les 10 meilleurs
  list.sort((a, b) => b.score - a.score);
  const top10 = list.slice(0, 10);
  localStorage.setItem(highScoresKey, JSON.stringify(top10));
}

function showScoreScreen(name, score) {
  elText.textContent = `Bravo ${name} !`;
  elImage.removeAttribute("src");
  elChoices.innerHTML = "";
  elFeedback.textContent = `Score : ${score}/${questions.length}.`;
  elNext.classList.add("hidden");
  elScore.textContent = `Score : ${score}`;

  // bouton pour voir le classement
  const btnRank = document.createElement("button");
  btnRank.className = "next";
  btnRank.textContent = "Voir le classement";
  btnRank.onclick = showRanking;
  document.querySelector(".card").appendChild(btnRank);
}

function showRanking() {
  const list = loadScores();

  elChoices.innerHTML = "";
  elFeedback.textContent = "";

  if (list.length === 0) {
    elFeedback.textContent = "Aucun score enregistré.";
    elFeedback.className = "feedback";
    return;
  }

  const table = document.createElement("table");

  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr>
      <th>Pos</th>
      <th>Prénom</th>
      <th>Score</th>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  list.forEach((entry, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${entry.name}</td>
      <td>${entry.score}/${questions.length}</td>
    `;
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  elChoices.appendChild(table);
}


