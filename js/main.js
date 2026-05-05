// ====================================
// INITIALISATION DU JEU
// ====================================

window.onload = function () {
  // Three.js est chargé via CDN : on attend qu'il soit disponible avant de démarrer
  var checkThree = setInterval(function() {
    if (typeof THREE !== 'undefined') {
      clearInterval(checkThree);
      initializeGame();
    }
  }, 100);

  // Si Three.js n'est toujours pas là après 5 secondes, la connexion a probablement échoué
  setTimeout(function() {
    if (typeof THREE === 'undefined') {
      alert('Erreur: Three.js n\'a pas pu être chargé. Vérifiez votre connexion internet.');
    }
  }, 5000);
};

function initializeGame() {
  SoundManager.init();

  var saveLoaded = SaveManager.load();
  if (saveLoaded) {
    // Si tous les biopics ont déjà été trouvés, on remet à zéro pour permettre de rejouer
    if (state.foundRefs.size >= BIOPICS.length) {
      state.foundRefs.clear();
      state.xp = 0;
      localStorage.removeItem('biopic_gallery_save');
    }
  }

  initThree();
  updateXPUI();
  updateDifficultyDisplay();

  // Barre de chargement animée — elle simule une progression fluide
  // Le vrai chargement (Three.js + modèles) est asynchrone, ceci donne un retour visuel
  var progression = 0;
  var intervalLoading = setInterval(function () {
    progression += Math.random() * 8 + 2;
    if (progression >= 100) {
      progression = 100;
      clearInterval(intervalLoading);

      setTimeout(function () {
        var loadingScreen = document.getElementById("screen-loading");
        var logo = loadingScreen.querySelector("h1");

        logo.style.animation = "zoom-into-logo 2s cubic-bezier(0.6, 0, 0.4, 1) forwards";
        loadingScreen.style.animation = "fade-to-home 2s ease-out forwards";

        setTimeout(function() {
          loadingScreen.style.display = "none";
          changeScreen("home");
        }, 2000);
      }, 500);
    }
    document.getElementById("loading-bar").style.width = progression + "%";
    document.getElementById("loading-percent").innerText =
      "CALIBRATION ARCHIVE " + Math.floor(progression) + "%";
  }, 35);

  // Le volume est sauvegardé en localStorage — on le restaure à chaque session
  document.getElementById("vol-slider").oninput = function (e) {
    state.musicVolume = parseInt(e.target.value);
    document.getElementById("vol-val").innerText = e.target.value + "%";
    SaveManager.save();
  };
  document.getElementById("vol-slider").value = state.musicVolume;
  document.getElementById("vol-val").innerText = state.musicVolume + "%";

  document.getElementById("btn-guess").onclick = function () {
    handleGuess();
  };

  // Permet de valider la réponse avec la touche Entrée, plus naturel qu'un clic
  document.getElementById("guess-input").addEventListener("keypress", function(e) {
    if (e.key === "Enter") handleGuess();
  });

  // Sauvegarde automatique toutes les 30s pendant une partie active
  setInterval(function() {
    if (state.timerActive) SaveManager.save();
  }, 30000);

  // Sauvegarde de sécurité si l'utilisateur ferme la fenêtre en cours de jeu
  window.addEventListener("beforeunload", function() {
    SaveManager.save();
  });
}

// ====================================
// GESTION DES RÉPONSES
// ====================================

// Normalise une chaîne pour la comparaison : supprime accents, apostrophes,
// espaces multiples, et le 's' ou 'e' final pour tolérer les fautes courantes
function normaliser(str) {
  return str.trim().toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[''`]/g, "")
    .replace(/\s+/g, " ")
    .replace(/s$/i, "")
    .replace(/e$/i, "");
}

var wrongAttempts = 0;
var encouragementTimeout = null;

// Messages progressifs selon le nombre d'erreurs consécutives
var messagesEncouragement = [
  "Pas tout à fait... réfléchis aux indices !",
  "Continue, tu vas y arriver !",
  "N'hésite pas à débloquer un indice supplémentaire.",
  "Pense au réalisateur ou aux acteurs principaux...",
  "Tu es capable ! Prends ton temps.",
];

function afficherEncouragement(msg, color) {
  var el = document.getElementById("encouragement-msg");
  if (!el) return;
  // On réinitialise le timer si un message était déjà affiché
  if (encouragementTimeout) clearTimeout(encouragementTimeout);
  el.style.color = color || "#f97316";
  el.textContent = msg;
  el.style.opacity = "1";
  encouragementTimeout = setTimeout(function() {
    el.style.opacity = "0";
  }, 3000);
}

// Vérifie si au moins un mot significatif de la réponse correspond au titre
// Seuil de 3 caractères pour ignorer les articles courts (le, la, de...)
function estProche(reponse, titre) {
  var r = normaliser(reponse);
  var t = normaliser(titre);
  if (r.length < 2) return false;
  var motsReponse = r.split(" ");
  var motsTitre = t.split(" ");
  for (var i = 0; i < motsReponse.length; i++) {
    if (motsReponse[i].length >= 3) {
      for (var j = 0; j < motsTitre.length; j++) {
        if (motsTitre[j].indexOf(motsReponse[i]) !== -1 || motsReponse[i].indexOf(motsTitre[j]) !== -1) {
          return true;
        }
      }
    }
  }
  return false;
}

function handleGuess() {
  var input = document.getElementById("guess-input");
  var reponse = input.value.trim().toLowerCase();

  if (!selectedBiopic) return;

  if (normaliser(reponse) === normaliser(selectedBiopic.name)) {
    var timeSpent = state.currentBiopicStartTime ?
      Math.floor((Date.now() - state.currentBiopicStartTime) / 1000) : 0;

    state.foundRefs.add(selectedBiopic.id);
    state.xp += selectedBiopic.xp;

    StatsManager.recordFind(selectedBiopic, timeSpent);
    updateXPUI();

    input.classList.add("success-pulse");
    setTimeout(function() { input.classList.remove("success-pulse"); }, 600);

    SoundManager.play('success');
    SaveManager.save();
    changeScreen("reward");

  } else {
    StatsManager.recordError();
    wrongAttempts++;

    // Si un mot de la réponse correspond au titre, on encourage plutôt que de juste signaler l'erreur
    if (reponse.length >= 2 && estProche(reponse, selectedBiopic.name)) {
      afficherEncouragement("Tu chauffes ! Tu es sur la bonne voie.", "#22c55e");
    } else {
      var msg = messagesEncouragement[Math.min(wrongAttempts, messagesEncouragement.length) - 1];
      if (msg) afficherEncouragement(msg, "#f97316");
    }

    input.classList.add("input-error");
    setTimeout(function () { input.classList.remove("input-error"); }, 500);
    SoundManager.play('error');
  }
}

// ====================================
// REDIMENSIONNEMENT
// ====================================

window.onresize = function () {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
};
