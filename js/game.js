// Démarrer le jeu
function startGame() {
  startGlobalTimer();
  changeScreen("gallery");
}

// Réinitialiser le jeu
function resetGame() {
  clearInterval(state.timerInterval);
  state.timerActive = false;
  state.xp = 0;
  state.foundRefs.clear();
  localStorage.removeItem('biopic_gallery_save');

  // Forcer la visibilité de tous les objets directement
  if (galleryGroup) {
    for (var i = 0; i < galleryGroup.children.length; i++) {
      galleryGroup.children[i].visible = true;
    }
  }

  updateXPUI();
  changeScreen("home");
}

// Démarrer le timer global
function startGlobalTimer(resume) {
  if (state.timerActive) return;
  if (!resume)
    state.timeLeft = GAME_DIFFICULTIES[state.currentDifficulty].time;
  state.timerActive = true;
  state.timerInterval = setInterval(function () {
    state.timeLeft--;
    updateTimerUI();
    if (state.timeLeft <= 0) {
      clearInterval(state.timerInterval);
      resetGame();
    }
  }, 1000);
  updateTimerUI();
}

// Mettre en pause le timer
function pauseTimer() {
  if (state.timerActive) {
    clearInterval(state.timerInterval);
    state.timerActive = false;
    state.timerWasRunningBeforePause = true;
  }
}

// Reprendre le timer
function resumeTimer() {
  if (state.timerWasRunningBeforePause) {
    startGlobalTimer(true);
    state.timerWasRunningBeforePause = false;
  }
}
