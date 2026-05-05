// ====================================
// DONNÉES DES BIOPICS AVEC INDICES
// ====================================

var BIOPICS = [
  {
    id: 1,
    name: "8 Miles",
    color: 0x555555,
    shape: "crumpled_paper",
    model: "models/Papier Froissé.glb",
    difficulty: "Expert",
    xp: 30,
    hints: [
      "Film sorti en 2002",
      "Eminem dans son premier rôle principal",
      "Citation: 'You only get one shot'"
    ]
  },
  {
    id: 2,
    name: "Malcolm X",
    color: 0x111111,
    shape: "glasses",
    model: "models/Lunettes_MX.glb",
    difficulty: "Culte",
    xp: 10,
    hints: [
      "Film de Spike Lee sorti en 1992",
      "Denzel Washington dans le rôle principal",
      "Leader des droits civiques afro-américains"
    ]
  },
  {
    id: 3,
    name: "Réussir ou mourir",
    color: 0xd4af37,
    shape: "dollar",
    model: "models/Dollars.glb",
    difficulty: "Culte",
    xp: 10,
    hints: [
      "Film de 2005 avec 50 Cent",
      "Histoire d'un dealer devenu rappeur",
      "Titre original: Get Rich or Die Tryin'"
    ]
  },
  {
    id: 4,
    name: "Des mains en or",
    color: 0xffffff,
    shape: "medical_tool",
    model: "models/Insturment_medical_main_en_or.glb",
    difficulty: "Expert",
    xp: 30,
    hints: [
      "Film de 2016 avec Will Smith",
      "Neurochirurgien célèbre",
      "Dr. Bennet Omalu et les commotions cérébrales"
    ]
  },
  {
    id: 5,
    name: "American Gangster",
    color: 0x222222,
    shape: "suit",
    model: "models/mens_two_piece_suit.glb",
    difficulty: "Technique",
    xp: 20,
    hints: [
      "Film de Ridley Scott (2007)",
      "Denzel Washington et Russell Crowe",
      "Trafiquant de drogue Frank Lucas"
    ]
  },
  {
    id: 6,
    name: "All Eyez On Me",
    color: 0x8b0000,
    shape: "bandana",
    model: "models/Bandana_Tupac.glb",
    difficulty: "Accessible",
    xp: 15,
    hints: [
      "Biopic sorti en 2017",
      "Rappeur légendaire des années 90",
      "Tupac Shakur"
    ]
  },
  {
    id: 7,
    name: "Le Loup de Wall Street",
    color: 0x1e3a8a,
    shape: "external_model",
    model: "models/Trading.glb",
    difficulty: "Accessible",
    xp: 15,
    hints: [
      "Film de Martin Scorsese (2013)",
      "Leonardo DiCaprio dans le rôle principal",
      "Jordan Belfort, courtier corrompu"
    ]
  },
  {
    id: 8,
    name: "Mandela",
    color: 0xd97706,
    shape: "shirt",
    model: "models/SHIRT MANDELA.glb",
    difficulty: "Expert",
    xp: 30,
    hints: [
      "Film de 2013",
      "Idris Elba dans le rôle principal",
      "Premier président noir d'Afrique du Sud"
    ]
  },
  {
    id: 9,
    name: "Bob Marley",
    color: 0x065f46,
    shape: "guitar",
    model: "models/Guitare_Bob_Marley.glb",
    difficulty: "Culte",
    xp: 10,
    hints: [
      "Légende du reggae",
      "Musicien jamaïcain",
      "One Love"
    ]
  },
  {
    id: 10,
    name: "The Imitation Game",
    color: 0x4b5563,
    shape: "enigma",
    model: "models/enigma_machine.glb",
    difficulty: "Technique",
    xp: 20,
    hints: [
      "Film de 2014",
      "Benedict Cumberbatch",
      "Mathématicien qui a cassé le code Enigma"
    ]
  },
  {
    id: 11,
    name: "The Founder",
    color: 0xb45309,
    shape: "mcdonalds",
    model: "models/macdo.glb",
    difficulty: "Accessible",
    xp: 15,
    hints: [
      "Film de 2016",
      "Michael Keaton dans le rôle de Ray Kroc",
      "Histoire de McDonald's"
    ]
  },
  {
    id: 12,
    name: "Hidden Figures",
    color: 0x374151,
    shape: "chalkboard",
    model: "models/chalkboard.glb",
    difficulty: "Technique",
    xp: 20,
    hints: [
      "Film de 2016",
      "Trois mathématiciennes afro-américaines",
      "NASA et la course à l'espace"
    ]
  },
  {
    id: 13,
    name: "Ford V Ferrari",
    color: 0x991b1b,
    shape: "wrench",
    model: "models/adjustable_spannerwrench.glb",
    difficulty: "Technique",
    xp: 20,
    hints: [
      "Film de 2019",
      "Christian Bale et Matt Damon",
      "24 Heures du Mans 1966"
    ]
  },
  {
    id: 14,
    name: "The Peaky Blinders",
    color: 0x0f172a,
    shape: "flat_cap",
    model: "models/peaky_blinders_gatsby_hat.glb",
    difficulty: "Culte",
    xp: 10,
    hints: [
      "Série britannique",
      "Gang de Birmingham années 1920",
      "Cillian Murphy"
    ]
  },
  {
    id: 15,
    name: "The Social Network",
    color: 0x1d4ed8,
    shape: "laptop",
    model: "models/laptop.glb",
    difficulty: "Technique",
    xp: 20,
    hints: [
      "Film de David Fincher (2010)",
      "Jesse Eisenberg",
      "Création de Facebook"
    ]
  },
  {
    id: 16,
    name: "Les Affranchis",
    color: 0x64748b,
    shape: "razor",
    model: "models/LAME RASOIR.glb",
    difficulty: "Expert",
    xp: 30,
    hints: [
      "Film de Martin Scorsese (1990)",
      "Robert De Niro, Joe Pesci, Ray Liotta",
      "Mafia italienne à New York"
    ]
  },
  {
    id: 17,
    name: "Ray",
    color: 0x000000,
    shape: "piano",
    model: "models/PIANO RAY.glb",
    difficulty: "Technique",
    xp: 20,
    hints: [
      "Film de 2004",
      "Jamie Foxx (Oscar du meilleur acteur)",
      "Ray Charles, pianiste et chanteur aveugle"
    ]
  },

  {
    id: 18,
    name: "Ali",
    color: 0x7f1d1d,
    shape: "gloves",
    model: "models/Gant_Box.glb",
    difficulty: "Accessible",
    xp: 15,
    hints: [
      "Film de 2001",
      "Will Smith dans le rôle principal",
      "Muhammad Ali, boxeur légendaire"
    ]
  },
  {
    id: 19,
    name: "Back to Black",
    color: 0x000000,
    shape: "micro",
    model: "models/Micro_Amy_Winehouse.glb",
    difficulty: "Technique",
    xp: 20,
    hints: [
      "Film récent sur une chanteuse",
      "Voix soul britannique",
      "Amy Winehouse"
    ]
  },
];

// ====================================
// FAUX JOUEURS POUR LE LEADERBOARD
// ====================================

var FAKE_PLAYERS = [
  { name: "Scorsese_Fan", xp: 340, rank: "Légende", gamesPlayed: 15 },
  { name: "BioHunter", xp: 210, rank: "Historien", gamesPlayed: 8 },
  { name: "Cinephile_X", xp: 180, rank: "Historien", gamesPlayed: 6 },
];

// ====================================
// CONFIGURATION DU JEU
// ====================================

var TOTAL_XP_AVAILABLE = 360;

var GAME_DIFFICULTIES = {
  FACILE: { 
    time: 20 * 60, 
    color: "text-green-500",
    label: "Facile",
    description: "20 minutes pour explorer"
  },
  MOYEN: { 
    time: 15 * 60, 
    color: "text-orange-500",
    label: "Moyen",
    description: "15 minutes, plus intense"
  },
  DIFFICILE: { 
    time: 10 * 60, 
    color: "text-red-500",
    label: "Difficile",
    description: "10 minutes, pour experts"
  },
};

// Prix des indices en XP
var HINT_COSTS = [0, 5, 10]; // Premier indice gratuit, puis 5 XP, puis 10 XP

// ====================================
// SYSTÈME D'ACHIEVEMENTS
// ====================================

var ACHIEVEMENTS = {
  FIRST_DISCOVERY: {
    id: "first_discovery",
    name: "Première Découverte",
    description: "Trouvez votre premier biopic",
    icon: "🎬",
    condition: (stats) => stats.foundCount >= 1,
    unlocked: false
  },
  SPEED_DEMON: {
    id: "speed_demon",
    name: "Démon de Vitesse",
    description: "Trouvez un film en moins de 30 secondes",
    icon: "⚡",
    condition: (stats) => stats.fastestFind && stats.fastestFind < 30,
    unlocked: false
  },
  PERFECT_GAME: {
    id: "perfect_game",
    name: "Perfection Absolue",
    description: "Terminez sans utiliser d'indices",
    icon: "💎",
    condition: (stats) => stats.foundCount === BIOPICS.length && stats.hintsUsed === 0,
    unlocked: false
  },
  SCORSESE_FAN: {
    id: "scorsese_fan",
    name: "Fan de Scorsese",
    description: "Trouvez tous les films de Scorsese",
    icon: "🎥",
    condition: (stats) => {
      var scorsese = [7, 16]; // Le Loup de Wall Street, Les Affranchis
      return scorsese.every(id => state.foundRefs.has(id));
    },
    unlocked: false
  },
  COMPLETIONIST: {
    id: "completionist",
    name: "Complétionniste",
    description: "Débloquez tous les biopics",
    icon: "🏆",
    condition: (stats) => stats.foundCount === BIOPICS.length,
    unlocked: false
  },
  HINT_MASTER: {
    id: "hint_master",
    name: "Maître des Indices",
    description: "Utilisez tous les indices d'un film",
    icon: "🔍",
    condition: (stats) => stats.maxHintsUsedOnOne >= 3,
    unlocked: false
  },
  STREAK_5: {
    id: "streak_5",
    name: "Série de 5",
    description: "Trouvez 5 films d'affilée sans erreur",
    icon: "🔥",
    condition: (stats) => stats.currentStreak >= 5,
    unlocked: false
  },
  NIGHT_OWL: {
    id: "night_owl",
    name: "Oiseau de Nuit",
    description: "Jouez après minuit",
    icon: "🌙",
    condition: (stats) => {
      var hour = new Date().getHours();
      return hour >= 0 && hour < 6;
    },
    unlocked: false
  }
};

// ====================================
// CONFIGURATION PERFORMANCE
// ====================================

var PERFORMANCE_SETTINGS = {
  // Détection auto du device
  isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  
  // Paramètres graphiques adaptatifs
  get particleCount() {
    return this.isMobile ? 50 : 150;
  },
  
  get shadowQuality() {
    return this.isMobile ? 'low' : 'high';
  },
  
  get antialiasing() {
    return !this.isMobile;
  }
};
