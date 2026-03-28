const questions = [
  { text: 'C’est un muffin ou un chien ?', image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=900&q=80', choices: ['Muffin','Chien'], answer: 'Muffin' },
  { text: 'C’est une chambre du Crous ou une cellule ?', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80', choices: ['Chambre du Crous','Cellule de prison'], answer: 'Chambre du Crous' },
  { text: 'C’est un cookie ou un chat ?', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=900&q=80', choices: ['Cookie','Chat'], answer: 'Cookie' },
  { text: 'C’est une pizza ou un sac ?', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80', choices: ['Pizza','Sac'], answer: 'Pizza' }
];

const elImage = document.getElementById('questionImage');
const elText = document.getElementById('questionText');
const elChoices = document.getElementById('choices');
const elFeedback = document.getElementById('feedback');
const elNext = document.getElementById('nextBtn');
const elProgress = document.getElementById('progress');
const elScore = document.getElementById('scorePill');

let playerName = '';
let index = 0;
let score = 0;
let locked = false;
const highScoresKey = 'image_quiz_scores';
const totalQuestions = questions.length;

// ───── Fonctions pour les scores ─────
const firebaseConfig = {
  // Colle ici TOUTE ta config copiée étape 1
  apiKey: "AIzaSy...",
  authDomain: "tonprojet.firebaseapp.com",
  databaseURL: "https://tonprojet-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "tonprojet",
  storageBucket: "tonprojet.appspot.com",
  messagingSenderId: "123456",
  appId: "1:123456:web:abcdef"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

function loadScores() {
  return db.ref('scores').orderByChild('score').limitToLast(10).once('value')
    .then(snapshot => {
      const scores = [];
      snapshot.forEach(child => {
        scores.unshift(child.val());
      });
      return scores;
    }).catch(() => []);
}

function saveScore(name, score) {
  db.ref('scores').push({
    name: name,
    score: score,
    date: Date.now()
  });
}

function showRanking() {
  const list = loadScores();
  elChoices.innerHTML = '';
  elFeedback.textContent = '';

  if (list.length === 0) {
    elFeedback.textContent = 'Aucun score enregistré.';
    elFeedback.className = 'feedback';
    return;
  }

  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.marginTop = '12px';

  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr style="background:#e5e7eb">
      <th style="padding:12px 8px;border-radius:8px;font-weight:700">Pos</th>
      <th style="padding:12px 8px;border-radius:8px;font-weight:700">Prénom</th>
      <th style="padding:12px 8px;border-radius:8px;font-weight:700">Score</th>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  list.forEach((entry, i) => {
    const tr = document.createElement('tr');
    tr.style.background = i < 3 ? '#fef3c7' : 'white';
    tr.innerHTML = `
      <td style="padding:12px 8px;text-align:center;font-weight:${i < 3 ? 'bold' : 'normal'}">${i + 1}</td>
      <td style="padding:12px 8px">${entry.name}</td>
      <td style="padding:12px 8px;text-align:center;font-weight:bold">${entry.score}/${totalQuestions}</td>
    `;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  elChoices.appendChild(table);
}

// ───── Écrans de jeu ─────
function showNameScreen() {
  //elImage.removeAttribute('src');
  //elText.textContent = 'Devine l’image';
  elProgress.textContent = 'Entre ton prénom';
  elFeedback.textContent = '';
  elScore.textContent = 'Score : 0';
  elChoices.innerHTML = '';
  elNext.classList.add('hidden');

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Ton prénom/pseudo';
  input.style.width = '100%';
  input.style.padding = '16px';
  input.style.border = '2px solid #e5e7eb';
  input.style.borderRadius = '16px';
  input.style.fontSize = '18px';
  input.style.marginBottom = '12px';

  const btnStart = document.createElement('button');
  btnStart.className = 'next';
  btnStart.textContent = 'Commencer !';
  btnStart.onclick = () => {
    playerName = input.value.trim() || 'Anonyme';
    if (playerName === 'Anonyme') {
      elFeedback.textContent = '⚠️ Donne un prénom pour être dans le classement !';
      elFeedback.className = 'feedback bad';
      return;
    }
    elScore.textContent = `Joueur : ${playerName}`;
    index = 0;
    score = 0;
    render();
  };

  elChoices.appendChild(input);
  elChoices.appendChild(btnStart);
}

function render() {
  locked = false;
  const q = questions[index];
  elImage.src = q.image;
  elText.textContent = q.text;
  elProgress.textContent = `Question ${index + 1}/${totalQuestions}`;
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
    elFeedback.textContent = '✅ Bonne réponse !';
    elFeedback.classList.add('good');
    btn.style.background = '#15803d';
  } else {
    elFeedback.textContent = `❌ Raté — c’était ${q.answer}.`;
    elFeedback.classList.add('bad');
    btn.style.background = '#b91c1c';
    buttons.find(b => b.textContent === q.answer)?.style.setProperty('background', '#15803d');
  }
  elScore.textContent = `Score : ${score}`;
  elNext.classList.remove('hidden');
}

elNext.addEventListener('click', () => {
  index++;
  if (index >= totalQuestions) {
    // Fin de partie
    saveScore(playerName, score);
    elImage.removeAttribute('src');
    elChoices.innerHTML = '';
    elProgress.textContent = 'Terminé !';
    elFeedback.textContent = `Score final : ${score}/${totalQuestions}`;
    elFeedback.className = 'feedback good';
    elNext.classList.add('hidden');

    const btnRank = document.createElement('button');
    btnRank.className = 'next';
    btnRank.textContent = 'Voir le classement';
    btnRank.onclick = showRanking;
    document.querySelector('.card').appendChild(btnRank);

    const btnRestart = document.createElement('button');
    btnRestart.className = 'next';
    btnRestart.style.background = '#2563eb';
    btnRestart.textContent = 'Rejouer';
    btnRestart.onclick = showNameScreen;
    document.querySelector('.card').appendChild(btnRestart);
    return;
  }
  render();
});

// ───── Lancement ─────
showNameScreen();
