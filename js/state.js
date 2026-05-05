// ====================================
// ÉTAT GLOBAL DU JEU
// ====================================

var state = {
  currentDifficulty: "FACILE",
  xp: 0,
  foundRefs: new Set(),
  timeLeft: 0,
  timerActive: false,
  timerInterval: null,
  timerWasRunningBeforePause: false,
  previousScreen: "home",
  currentScreen: "home",
  
  // Nouveaux états pour les améliorations
  currentHintLevel: 0, // Niveau d'indice actuel (0, 1, 2)
  hintsUsedTotal: 0,
  currentBiopicStartTime: null,
  soundEnabled: true,
  musicVolume: 50,
};

// ====================================
// STATISTIQUES DU JOUEUR
// ====================================

var playerStats = {
  gamesPlayed: 0,
  totalXPEarned: 0,
  foundCount: 0,
  hintsUsed: 0,
  maxHintsUsedOnOne: 0,
  fastestFind: null, // En secondes
  currentStreak: 0,
  bestStreak: 0,
  wrongGuesses: 0,
  totalPlayTime: 0, // En secondes
  achievements: {},
  lastPlayed: null,
  
  // Statistiques par difficulté
  byDifficulty: {
    FACILE: { played: 0, completed: 0 },
    MOYEN: { played: 0, completed: 0 },
    DIFFICILE: { played: 0, completed: 0 }
  }
};

// ====================================
// ÉTAT DES MOUVEMENTS
// ====================================

var moveState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
};

// ====================================
// VARIABLES 3D
// ====================================

var estEnTrainDeManipuler = false;
var scene, camera, renderer, controls, raycaster, mouse;
var galleryGroup, focusGroup, homeGroup, backgroundParticles;
var selectedBiopic = null;

// ====================================
// SYSTÈME DE SAUVEGARDE (LocalStorage)
// ====================================

// Gère la persistance via localStorage — seules les données essentielles sont sauvegardées
// (xp, films trouvés, difficulté, audio) pour garder la sauvegarde légère
var SaveManager = {
  SAVE_KEY: 'biopic_gallery_save',

  save: function() {
    try {
      var saveData = {
        state: {
          xp: state.xp,
          foundRefs: Array.from(state.foundRefs),
          currentDifficulty: state.currentDifficulty,
          soundEnabled: state.soundEnabled,
          musicVolume: state.musicVolume
        },
        stats: playerStats,
        achievements: ACHIEVEMENTS,
        timestamp: Date.now()
      };
      
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
      console.log('✅ Progression sauvegardée');
      return true;
    } catch (error) {
      console.error('❌ Erreur de sauvegarde:', error);
      return false;
    }
  },
  
  load: function() {
    try {
      var saved = localStorage.getItem(this.SAVE_KEY);
      if (!saved) {
        console.log('ℹ️ Aucune sauvegarde trouvée');
        return false;
      }
      
      var saveData = JSON.parse(saved);
      
      // Restaurer l'état
      state.xp = saveData.state.xp || 0;
      state.foundRefs = new Set(saveData.state.foundRefs || []);
      state.currentDifficulty = saveData.state.currentDifficulty || "FACILE";
      state.soundEnabled = saveData.state.soundEnabled !== undefined ? saveData.state.soundEnabled : true;
      state.musicVolume = saveData.state.musicVolume || 50;
      
      // Restaurer les statistiques
      if (saveData.stats) {
        Object.assign(playerStats, saveData.stats);
      }
      
      // Restaurer les achievements
      if (saveData.achievements) {
        Object.keys(saveData.achievements).forEach(key => {
          if (ACHIEVEMENTS[key]) {
            ACHIEVEMENTS[key].unlocked = saveData.achievements[key].unlocked || false;
          }
        });
      }
      
      console.log('✅ Progression chargée:', saveData);
      return true;
    } catch (error) {
      console.error('❌ Erreur de chargement:', error);
      return false;
    }
  },
  
  reset: function() {
    if (confirm('⚠️ Voulez-vous vraiment réinitialiser toute votre progression ? Cette action est irréversible.')) {
      localStorage.removeItem(this.SAVE_KEY);
      location.reload();
    }
  },
  
};

// ====================================
// SYSTÈME D'ACHIEVEMENTS
// ====================================

var AchievementManager = {
  // Vérifier et débloquer les achievements
  checkAchievements: function() {
    var newlyUnlocked = [];
    
    Object.keys(ACHIEVEMENTS).forEach(key => {
      var achievement = ACHIEVEMENTS[key];
      
      // Si déjà débloqué, on passe
      if (achievement.unlocked) return;
      
      // Vérifier la condition
      if (achievement.condition(playerStats)) {
        achievement.unlocked = true;
        newlyUnlocked.push(achievement);
        console.log('🏆 Achievement débloqué:', achievement.name);
      }
    });
    
    // Afficher les nouveaux achievements
    if (newlyUnlocked.length > 0) {
      this.showAchievementNotification(newlyUnlocked);
    }
    
    return newlyUnlocked;
  },
  
  // Afficher une notification d'achievement
  showAchievementNotification: function(achievements) {
    achievements.forEach((achievement, index) => {
      setTimeout(() => {
        this.createNotification(achievement);
      }, index * 500);
    });
  },
  
  // Créer une notification visuelle
  createNotification: function(achievement) {
    var notif = document.createElement('div');
    notif.className = 'achievement-notification';
    notif.innerHTML = `
      <div class="achievement-icon">${achievement.icon}</div>
      <div class="achievement-content">
        <div class="achievement-title">${achievement.name}</div>
        <div class="achievement-desc">${achievement.description}</div>
      </div>
    `;
    
    document.body.appendChild(notif);
    
    // Animation d'entrée
    setTimeout(() => notif.classList.add('show'), 100);
    
    // Animation de sortie
    setTimeout(() => {
      notif.classList.remove('show');
      setTimeout(() => notif.remove(), 300);
    }, 4000);
    
    // Son si activé
    if (state.soundEnabled) {
      SoundManager.play('achievement');
    }
  },
  
  // Obtenir le pourcentage de complétion
  getCompletionPercentage: function() {
    var total = Object.keys(ACHIEVEMENTS).length;
    var unlocked = Object.values(ACHIEVEMENTS).filter(a => a.unlocked).length;
    return Math.round((unlocked / total) * 100);
  }
};

// ====================================
// GESTIONNAIRE DE SONS
// ====================================

// Sons générés via Web Audio API — pas de fichiers audio externes nécessaires
var SoundManager = {
  sounds: {},

  init: function() {
    // On utilisera des sons basiques HTML5 Audio
    // Pour l'instant, on prépare juste la structure
    this.sounds = {
      click: this.createSound(440, 0.1, 'sine'),
      success: this.createSound(523.25, 0.3, 'sine'),
      error: this.createSound(220, 0.2, 'sawtooth'),
      achievement: this.createSound(659.25, 0.4, 'sine'),
      hover: this.createSound(330, 0.05, 'sine')
    };
  },
  
  // Créer un son avec Web Audio API
  createSound: function(frequency, duration, type) {
    return {
      frequency: frequency,
      duration: duration,
      type: type
    };
  },
  
  // Jouer un son
  play: function(soundName) {
    if (!state.soundEnabled) return;
    
    var sound = this.sounds[soundName];
    if (!sound) return;
    
    try {
      var audioContext = new (window.AudioContext || window.webkitAudioContext)();
      var oscillator = audioContext.createOscillator();
      var gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = sound.frequency;
      oscillator.type = sound.type;
      
      gainNode.gain.setValueAtTime(0.3 * (state.musicVolume / 100), audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + sound.duration);
    } catch (error) {
      console.warn('Erreur audio:', error);
    }
  }
};

// ====================================
// GESTIONNAIRE DE STATISTIQUES
// ====================================

var StatsManager = {
  // Enregistrer une partie terminée
  recordGame: function(completed) {
    playerStats.gamesPlayed++;
    playerStats.byDifficulty[state.currentDifficulty].played++;
    
    if (completed) {
      playerStats.byDifficulty[state.currentDifficulty].completed++;
    }
    
    playerStats.lastPlayed = Date.now();
    SaveManager.save();
  },
  
  // Enregistrer une découverte
  recordFind: function(biopic, timeSpent) {
    playerStats.foundCount++;
    playerStats.totalXPEarned += biopic.xp;
    
    // Vérifier le temps le plus rapide
    if (!playerStats.fastestFind || timeSpent < playerStats.fastestFind) {
      playerStats.fastestFind = timeSpent;
    }
    
    // Incrémenter le streak
    playerStats.currentStreak++;
    if (playerStats.currentStreak > playerStats.bestStreak) {
      playerStats.bestStreak = playerStats.currentStreak;
    }
    
    SaveManager.save();
    AchievementManager.checkAchievements();
  },
  
  // Enregistrer une erreur
  recordError: function() {
    playerStats.wrongGuesses++;
    playerStats.currentStreak = 0; // Reset du streak
    SaveManager.save();
  },
  
  // Enregistrer l'utilisation d'un indice
  recordHintUsed: function(hintLevel) {
    playerStats.hintsUsed++;
    state.hintsUsedTotal++;
    
    if (hintLevel + 1 > playerStats.maxHintsUsedOnOne) {
      playerStats.maxHintsUsedOnOne = hintLevel + 1;
    }
    
    SaveManager.save();
  }
};
