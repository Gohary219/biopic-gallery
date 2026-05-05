// ====================================
// GESTION DE L'INTERFACE UTILISATEUR
// ====================================

// L'écran de jeu crée un renderer WebGL dédié pour l'objet 3D.
// Il faut le détruire explicitement quand on quitte cet écran,
// sinon la boucle d'animation continue de tourner en arrière-plan et fuit la mémoire GPU.
function cleanupObjectRenderer() {
  if (state.objectRenderer) {
    if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
    if (state.resizeHandler) window.removeEventListener('resize', state.resizeHandler);

    var objectViewerContainer = document.getElementById('object-viewer');
    if (objectViewerContainer && state.objectRenderer.domElement) {
      objectViewerContainer.removeChild(state.objectRenderer.domElement);
    }

    state.objectRenderer.dispose();
    state.objectRenderer = null;
    state.objectScene = null;
    state.objectControls = null;
    state.animationFrameId = null;
    state.resizeHandler = null;
  }
}

// Changement d'écrans
function changeScreen(id) {
  var previousScreen = state.currentScreen;
  // On saute la cinématique d'intro si on revient de l'écran de jeu vers la galerie,
  // pour ne pas rejouer l'animation à chaque bonne réponse
  var skipGalleryIntro = previousScreen === "game" && id === "gallery";

  // Nettoyer le renderer 3D si on quitte l'écran game
  if (previousScreen === "game" && id !== "game") {
    cleanupObjectRenderer();
  }
  
  state.currentScreen = id;

  if (id !== "leaderboard") {
    state.previousScreen = id;
    resumeTimer();
  } else {
    pauseTimer();
    updateLeaderboard();
  }
  
  var allScreens = document.querySelectorAll("#ui-layer > div");
  for (var i = 0; i < allScreens.length; i++) {
    allScreens[i].classList.add("hidden");
  }
  
  var nextScreen = document.getElementById("screen-" + id);
  if (nextScreen) nextScreen.classList.remove("hidden");
  
  var hud = document.getElementById("top-hud");
  var timer = document.getElementById("timer-display");
  var title = document.getElementById("hud-center-title");
  var audio = document.getElementById("audio-panel");

  homeGroup.visible = galleryGroup.visible = focusGroup.visible = false;
  controls.enabled = false;
  controls.enableRotate = false;

  if (id === "home") {
    hud.classList.remove("hidden");
    timer.classList.add("hidden");
    title.classList.add("hidden");
    audio.classList.remove("hidden");
    homeGroup.visible = true;
    tweenCamera({ x: 0, y: 0, z: 6.5 }, { x: 0, y: 0, z: 0 }, 2.5);
  } else if (id === "gallery") {
    hud.classList.remove("hidden");
    timer.classList.remove("hidden");
    title.classList.remove("hidden");
    audio.classList.add("hidden");
    galleryGroup.visible = true;
    
    // 🎬 LANCER LA CINÉMATIQUE D'INTRO uniquement au premier passage
    if (typeof cinematicCamera !== 'undefined' && !skipGalleryIntro) {
      cinematicCamera.playIntro(function() {
        if (typeof setupPlayerControls === 'function') {
          setupPlayerControls();
        }
      });
    } else {
      if (typeof setupPlayerControls === 'function') {
        setupPlayerControls();
      }
    }
    
    updateGalleryVisuals();
    
    if (!skipGalleryIntro) {
      setTimeout(function() {
        if (typeof animateGalleryEntrance === 'function') {
          animateGalleryEntrance();
        }
      }, 1000); // Pendant la descente de la caméra
    }
    
  } else if (id === "game") {
    hud.classList.remove("hidden");
    timer.classList.remove("hidden");
    title.classList.add("hidden");
    audio.classList.add("hidden");

    // Réinitialiser le compteur d'erreurs et le message
    if (typeof wrongAttempts !== 'undefined') wrongAttempts = 0;
    var encMsg = document.getElementById("encouragement-msg");
    if (encMsg) { encMsg.textContent = ""; encMsg.style.opacity = "0"; }

    var objectViewerContainer = document.getElementById('object-viewer');

    // On crée un renderer WebGL séparé pour l'objet 3D du jeu.
    // Il ne partage pas la scène principale de la galerie, ce qui évite
    // les conflits de caméra et permet un éclairage et fond indépendants.
    var objectRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    var viewW = window.innerWidth;
    var viewH = window.innerHeight;
    objectRenderer.setSize(viewW, viewH);
    objectRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    objectRenderer.setClearColor(0x0a0a0a, 1);
    objectViewerContainer.innerHTML = '';
    objectViewerContainer.appendChild(objectRenderer.domElement);

    // Créer une scène et caméra dédiées
    var objectScene = new THREE.Scene();
    var objectCamera = new THREE.PerspectiveCamera(
      50,
      viewW / viewH,
      0.1,
      1000
    );
    objectCamera.position.set(0, 0, 6);
    
    
    objectScene.add(new THREE.AmbientLight(0xffffff, 0.8));
    var dlMain = new THREE.DirectionalLight(0xffffff, 1.0); dlMain.position.set(3, 5, 3); objectScene.add(dlMain);

    // Ajouter l'objet à la scène
    var objectShape = createBiopicShape(
      selectedBiopic.shape,
      selectedBiopic.color,
      selectedBiopic.model
    );
    
    objectShape.scale.set(1.6, 1.6, 1.6);

    objectScene.add(objectShape);
    
    // ORBITCONTROLS pour rotation
    var objectControls = new THREE.OrbitControls(objectCamera, objectRenderer.domElement);
    objectControls.enableDamping = true;
    objectControls.dampingFactor = 0.05;
    objectControls.enableZoom = true;
    objectControls.enablePan = false;
    objectControls.autoRotate = true;
    objectControls.autoRotateSpeed = 1.5;
    objectControls.minDistance = 3;
    objectControls.maxDistance = 12;
    objectControls.target.set(0, 0, 0);
    
    // Boucle d'animation pour l'objet
    var animationFrameId;
    function animateObject() {
      animationFrameId = requestAnimationFrame(animateObject);
      objectControls.update();
      objectRenderer.render(objectScene, objectCamera);
    }
    animateObject();
    
    // Gérer le redimensionnement
    var resizeHandler = function() {
      var width = window.innerWidth;
      var height = window.innerHeight;
      objectCamera.aspect = width / height;
      objectCamera.updateProjectionMatrix();
      objectRenderer.setSize(width, height);
    };
    window.addEventListener('resize', resizeHandler);
    
    // Stocker les références pour cleanup
    state.objectRenderer = objectRenderer;
    state.objectScene = objectScene;
    state.objectControls = objectControls;
    state.animationFrameId = animationFrameId;
    state.resizeHandler = resizeHandler;

    var gameDifficulty = GAME_DIFFICULTIES[state.currentDifficulty];
    var gameDifficultyElement = document.getElementById("game-item-difficulty");
    if (gameDifficultyElement) {
      gameDifficultyElement.classList.remove('text-green-500', 'text-orange-500', 'text-red-500', 'text-amber-700/40');
      if (gameDifficulty) {
        gameDifficultyElement.classList.add(...gameDifficulty.color.split(' '));
      }
      gameDifficultyElement.innerText = selectedBiopic.difficulty + " | +" + selectedBiopic.xp + " XP";
    }
    
    var inputField = document.getElementById("guess-input");
    inputField.value = "";
    inputField.focus();
    
    // Afficher les indices
    displayHints();
    
  } else if (id === "reward") {
    hud.classList.remove("hidden");
    document.getElementById("reward-xp-text").innerText =
      "+ " + selectedBiopic.xp + " XP";
  } else if (id === "leaderboard") {
    hud.classList.add("hidden");
    audio.classList.add("hidden");
  }
}

// ====================================
// SYSTÈME D'INDICES
// ====================================

function displayHints() {
  var hintsContainer = document.getElementById("hints-container");
  if (!hintsContainer || !selectedBiopic) return;
  
  hintsContainer.innerHTML = "";
  
  var hints = selectedBiopic.hints || [];
  
  for (var i = 0; i < hints.length; i++) {
    var hintDiv = document.createElement("div");
    hintDiv.className = "hint-item";
    
    var cost = HINT_COSTS[i];
    var isUnlocked = i <= state.currentHintLevel;
    
    if (!isUnlocked) {
      hintDiv.classList.add("locked");
      hintDiv.onclick = (function(index, hintCost) {
        return function() {
          unlockHint(index, hintCost);
        };
      })(i, cost);
    } else {
      hintDiv.classList.add("unlocked");
    }
    
    var icon = isUnlocked ? "💡" : "🔒";
    var text = isUnlocked ? hints[i] : "Cliquez pour débloquer";
    var costText = cost === 0 ? "GRATUIT" : cost + " XP";
    
    hintDiv.innerHTML = 
      '<div class="hint-icon">' + icon + '</div>' +
      '<div class="hint-text">' + text + '</div>' +
      '<div class="hint-cost">' + costText + '</div>';
    
    hintsContainer.appendChild(hintDiv);
  }
}

function unlockHint(hintIndex, cost) {
  if (hintIndex <= state.currentHintLevel) return;
  
  if (state.xp < cost) {
    alert("❌ XP insuffisant ! Il vous faut " + cost + " XP.");
    SoundManager.play('error');
    return;
  }
  
  state.xp -= cost;
  state.currentHintLevel = hintIndex;
  
  updateXPUI();
  displayHints();
  
  StatsManager.recordHintUsed(hintIndex);
  SaveManager.save();
  
  SoundManager.play('success');
}

// ====================================
// MISE À JOUR DE L'XP
// ====================================

function updateXPUI() {
  var percentage = (state.xp / TOTAL_XP_AVAILABLE) * 100;
  document.getElementById("xp-progress").style.width = percentage + "%";
  document.getElementById("xp-text").innerText =
    state.xp + " / " + TOTAL_XP_AVAILABLE;
}

// ====================================
// MISE À JOUR DU TIMER
// ====================================

function updateTimerUI() {
  var d = document.getElementById("timer-display");
  var m = Math.floor(state.timeLeft / 60),
    s = state.timeLeft % 60;
  d.innerText = (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
  if (state.timeLeft < 60) d.classList.add("timer-danger");
  else d.classList.remove("timer-danger");
}

// ====================================
// AFFICHAGE DE LA DIFFICULTÉ
// ====================================

function updateDifficultyDisplay() {
  var config = GAME_DIFFICULTIES[state.currentDifficulty];
  var label = document.getElementById("difficulty-label");
  if (!config || !label) return;

  var colors = { FACILE: '#22c55e', MOYEN: '#f97316', DIFFICILE: '#ef4444' };
  label.style.color = colors[state.currentDifficulty] || '#ffffff';
  label.innerText = config.label + " - " + Math.floor(config.time / 60) + ":00";
}

// ====================================
// BASCULER LA DIFFICULTÉ
// ====================================

function toggleDifficulty() {
  var keys = Object.keys(GAME_DIFFICULTIES);
  var currentIndex = keys.indexOf(state.currentDifficulty);
  var nextIndex = (currentIndex + 1) % keys.length;
  state.currentDifficulty = keys[nextIndex];
  updateDifficultyDisplay();
  console.log("✅ Difficulté:", state.currentDifficulty, "Couleur:", GAME_DIFFICULTIES[state.currentDifficulty].color);
}

// ====================================
// LEADERBOARD
// ====================================

function updateLeaderboard() {
  var list = document.getElementById("leaderboard-list");
  list.innerHTML = "";
  var players = [
    { name: "Moi (Vous)", xp: state.xp, rank: "Aventurier", isMe: true },
  ].concat(FAKE_PLAYERS);
  players.sort(function (a, b) {
    return b.xp - a.xp;
  });
  for (var i = 0; i < players.length; i++) {
    var p = players[i];
    var item = document.createElement("div");
    item.className =
      "flex justify-between items-center p-6 rounded-xl border-l-2 " +
      (p.isMe
        ? "bg-amber-500/5 border-amber-500"
        : "bg-white/5 border-white/10");
    item.innerHTML =
      '<div class="flex items-center gap-5"><span class="text-2xl font-black italic serif-title ' +
      (p.isMe ? "text-amber-500" : "text-amber-900") +
      '">' +
      (i + 1) +
      '</span><div class="flex flex-col"><span class="font-black text-xs uppercase tracking-[0.2em] ' +
      (p.isMe ? "text-white" : "text-amber-200/60") +
      '">' +
      p.name +
      '</span><span class="text-[8px] text-amber-700 uppercase tracking-widest mono-info">Score Héritage: ' +
      p.xp +
      " XP</span></div></div>";
    list.appendChild(item);
  }
}

function closeLeaderboard() {
  changeScreen(state.previousScreen);
}
