// ====================================
// INITIALISATION THREE.JS
// ====================================

function initThree() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    60,                              // Champ de vision en degrés — 60° donne un rendu naturel
    window.innerWidth / window.innerHeight,
    0.1,                             // Near plane : objets trop proches seront ignorés
    1000                             // Far plane : objets trop loin seront ignorés
  );

  renderer = new THREE.WebGLRenderer({
    antialias: PERFORMANCE_SETTINGS.antialiasing,
    alpha: true,
    // Sur mobile on réduit la consommation GPU pour éviter la surchauffe
    powerPreference: PERFORMANCE_SETTINGS.isMobile ? "low-power" : "high-performance"
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // On plafonne à 2x pour éviter de surcharger les écrans Retina à très haute résolution
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  document
    .getElementById("canvas-container")
    .appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;   // Plus la valeur est faible, plus le mouvement est fluide
  controls.maxDistance = 60;
  controls.minDistance = 2;
  controls.enableRotate = false;   // La rotation est gérée manuellement via player.js

  // On suit l'état de manipulation pour ne pas faire tourner l'objet en focus
  // pendant que l'utilisateur interagit avec la souris
  controls.addEventListener("start", function () { estEnTrainDeManipuler = true; });
  controls.addEventListener("end", function () { estEnTrainDeManipuler = false; });

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  setupLighting();
  setupParticles();
  
  homeGroup = new THREE.Group();
  galleryGroup = new THREE.Group();
  focusGroup = new THREE.Group();
  scene.add(homeGroup, galleryGroup, focusGroup);

  setupHome();
  setupGallery3D();

  renderer.domElement.addEventListener("click", onCanvasClick);
  window.addEventListener("keydown", handleKey);
  window.addEventListener("keyup", handleKey);

  animate();
  
  console.log('🎮 Scène 3D initialisée -', PERFORMANCE_SETTINGS.isMobile ? 'Mode Mobile' : 'Mode Desktop');
}

// ====================================
// CONFIGURATION DE L'ÉCLAIRAGE
// ====================================

function setupLighting() {
  // Lumière ambiante adoucie
  var ambientLight = new THREE.AmbientLight(0xfffbeb, 0.4);
  scene.add(ambientLight);

  // Lumière dorée (point light)
  var pointLight = new THREE.PointLight(0xd4af37, 1.5);
  pointLight.position.set(20, 30, 20);
  scene.add(pointLight);

  // Lumière directionnelle
  var dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
  dirLight.position.set(-15, 25, 15);
  scene.add(dirLight);
}

// ====================================
// CONFIGURATION DES PARTICULES
// ====================================

function setupParticles() {
  backgroundParticles = new THREE.Group();
  var particleCount = PERFORMANCE_SETTINGS.particleCount;
  
  for (var i = 0; i < particleCount; i++) {
    var partGeom = new THREE.SphereGeometry(Math.random() * 0.02, 6, 6);
    var partMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.3,
    });
    var partMesh = new THREE.Mesh(partGeom, partMat);
    partMesh.position.set(
      (Math.random() - 0.5) * 80,
      (Math.random() - 0.5) * 80,
      (Math.random() - 0.5) * 80
    );
    backgroundParticles.add(partMesh);
  }
  scene.add(backgroundParticles);
}

// ====================================
// CONFIGURATION DE L'ÉCRAN D'ACCUEIL
// ====================================

function setupHome() {
  var globe = new THREE.Group();
  var planetGeom = new THREE.SphereGeometry(1.6, 64, 64);
  var planetMat = new THREE.MeshPhongMaterial({
    color: 0x050505,
    shininess: 100,
    emissive: 0x110800,
  });
  var planet = new THREE.Mesh(planetGeom, planetMat);
  globe.add(planet);

  var pointsCount = 2000;
  var positions = new Float32Array(pointsCount * 3);
  for (var i = 0; i < pointsCount; i++) {
    var phi = Math.acos(-1 + (2 * i) / pointsCount);
    var theta = Math.sqrt(pointsCount * Math.PI) * phi;
    positions[i * 3] = 1.63 * Math.cos(theta) * Math.sin(phi);
    positions[i * 3 + 1] = 1.63 * Math.sin(theta) * Math.sin(phi);
    positions[i * 3 + 2] = 1.63 * Math.cos(phi);
  }

  var pointsGeom = new THREE.BufferGeometry();
  pointsGeom.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  var pointsMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.012,
    transparent: true,
    opacity: 0.7,
  });
  var points = new THREE.Points(pointsGeom, pointsMat);
  globe.add(points);

  for (var j = 0; j < 2; j++) {
    var ringGeom = new THREE.TorusGeometry(2.3 + j * 0.2, 0.002, 16, 100);
    var ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.1,
    });
    var ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / (2 + j * 0.3);
    globe.add(ring);
    gsap.to(ring.rotation, {
      z: Math.PI * 2,
      duration: 15 + j * 5,
      repeat: -1,
      ease: "none",
    });
  }

  homeGroup.add(globe);
  function rotateHome() {
    if (homeGroup.visible) globe.rotation.y += 0.0015;
    requestAnimationFrame(rotateHome);
  }
  rotateHome();
}

// ====================================
// CONFIGURATION DE LA GALERIE 3D
// ====================================

function setupGallery3D() {
  // Disposition en CERCLE autour du joueur
  var radius = 15; // Rayon du cercle
  var angleStep = (Math.PI * 2) / BIOPICS.length;
  
  for (var i = 0; i < BIOPICS.length; i++) {
    var bio = BIOPICS[i];
    var group = new THREE.Group();
    
    // Position en cercle
    var angle = i * angleStep;
    var x = Math.cos(angle) * radius;
    var z = Math.sin(angle) * radius;
    var y = 2; // Hauteur au-dessus du sol
    
    // Socle
    var pedestalGeom = new THREE.CylinderGeometry(1.4, 1.6, 0.5, 32);
    var pedestalMat = new THREE.MeshPhongMaterial({
      color: 0x111111,
      shininess: 80,
      emissive: 0x050505,
    });
    var pedestal = new THREE.Mesh(pedestalGeom, pedestalMat);
    pedestal.userData = bio;
    group.add(pedestal);
    
    // Objet 3D
    var shape = createBiopicShape(bio.shape, bio.color, bio.model);
    shape.position.y = 2.2;
    shape.userData = bio;
    
    // Rotation spécifique pour certains objets
    if (bio.name === "Les Affranchis" || (bio.model && bio.model.includes('LAME'))) {
      // Lame de rasoir: debout et en longueur
      shape.rotation.x = Math.PI / 2.5;
      shape.rotation.z = Math.PI / 4;
    } else if (bio.name === "8 Miles" || (bio.model && bio.model.includes('Papier'))) {
      // Feuille froissée: debout et visible
      shape.rotation.x = Math.PI / 3;
      shape.rotation.z = Math.PI / 6;
    } else if (bio.name === "Bob Marley" || bio.id === 9) {
      // Guitare debout
      shape.rotation.x = Math.PI / 2;
    } else if (bio.name === "Mandela" || (bio.model && bio.model.includes('SHIRT MANDELA'))) {
      // Chemise Mandela: debout de face
      shape.rotation.x = Math.PI / 2;
      shape.rotation.y = Math.PI / 2;
    }
    
    group.add(shape);

    group.position.set(x, y, z);

    // Tourner l'objet vers le centre
    group.lookAt(0, y, 0);

    group.userData.originalPosition = { x: x, y: y, z: z };
    group.userData.originalRotation = group.rotation.y;
    
    galleryGroup.add(group);
  }
  
  // Créer le PERSONNAGE au centre
  var playerMesh = createPlayer();
  galleryGroup.add(playerMesh);
  
  console.log('🎮 ' + BIOPICS.length + ' objets disposés en cercle + personnage créé !');
}

// ====================================
// CRÉATION DES FORMES 3D
// ====================================

function createBiopicShape(type, color, modelPath) {
  if (modelPath) {
    var container = new THREE.Group();

    // Le chargement GLB est asynchrone — on affiche un octaèdre coloré en attendant
    // pour que l'objet soit présent et cliquable dès l'entrée en galerie
    var fallback = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.2, 0),
      new THREE.MeshPhongMaterial({
        color: color,
        shininess: 95,
        emissive: color,
        emissiveIntensity: 0.16,
      })
    );
    container.add(fallback);
    
    var loader = new THREE.GLTFLoader();
    loader.load(
      modelPath,
      function(gltf) {
        var model = gltf.scene;

        // ÉCHELLE ADAPTÉE - Machine Enigma petite, autres objets plus grands
        var scale = 1.2; // Échelle agrandie pour les autres objets
        if (modelPath.includes('enigma')) {
          scale = 0.05; // Machine Enigma
        } else if (modelPath.includes('PIANO')) {
          scale = 1.5; // Piano agrandi
        } else if (modelPath.includes('Dollars')) {
          scale = 0.6; // Dollars diminués
        } else if (modelPath.includes('Trading')) {
          scale = 3.0; // Trading GIGANTESQUE
        } else if (modelPath.includes('macdo')) {
          scale = 1.0; // McDonald's The Founder
        } else if (modelPath.includes('Lunettes')) {
          scale = 3.0; // Lunettes Malcolm X
        } else if (modelPath.includes('Guitare') || modelPath.includes('Bob')) {
          scale = 3.5; // Guitare grande
        } else if (modelPath.includes('mens_two_piece_suit')) {
          scale = 1.5; // Costume American Gangster
        } else if (modelPath.includes('chalkboard')) {
          scale = 0.012; // Tableau Hidden Figures
        } else if (modelPath.includes('adjustable_spannerwrench')) {
          scale = 0.05; // Clé Ford V Ferrari
        } else if (modelPath.includes('peaky_blinders_gatsby_hat')) {
          scale = 0.08; // Chapeau Peaky Blinders
        } else if (modelPath.includes('laptop')) {
          scale = 0.5; // Laptop Social Network
        }

        model.scale.set(scale, scale, scale);

        // Les lunettes Malcolm X ont des matériaux transparents par défaut dans le GLB —
        // on les remplace pour les rendre visibles sur fond sombre
        if (modelPath.includes('Lunettes')) {
          model.traverse(function(child) {
            if (child.isMesh) {
              child.material = new THREE.MeshPhongMaterial({
                color: 0x1a1a1a,
                shininess: 200,
                emissive: 0xaaaaaa,
                emissiveIntensity: 0.8,
                side: THREE.DoubleSide
              });
            }
          });
        }

        // Ces modèles ont des matériaux très sombres ou noirs — sans émission forcée,
        // ils seraient quasiment invisibles sur le fond noir de la scène
        var darkModels = ['mens_two_piece_suit', 'peaky_blinders_gatsby_hat', 'chalkboard', 'laptop', 'adjustable_spannerwrench', 'macdo', 'Insturment_medical', 'Gant_Box', 'LAME', 'RASOIR', 'Papier', 'Bandana'];
        var isDark = darkModels.some(function(name) { return modelPath.includes(name); });
        if (isDark) {
          model.traverse(function(child) {
            if (child.isMesh && child.material) {
              var mats = Array.isArray(child.material) ? child.material : [child.material];
              mats.forEach(function(mat) {
                mat.emissive = mat.emissive || new THREE.Color(0x000000);
                mat.emissive.set(0x888888);
                mat.emissiveIntensity = 0.6;
                mat.needsUpdate = true;
              });
            }
          });
        }

        // Retirer le fallback et ajouter le modèle chargé
        container.remove(fallback);
        container.add(model);
        console.log('✅ Modèle chargé:', modelPath, '- Échelle:', scale);
      },
      undefined,
      function(error) {
        console.error('❌ Erreur:', error);
        // Le fallback reste visible
      }
    );
    return container;
  }
  
  // FORMES GÉOMÉTRIQUES - Dimension agrandie (cohérente avec les modèles)
  var STANDARD_SIZE = 1.2; // Taille agrandie pour les formes géométriques
  var shape;
  switch (type) {
    case "sphere":
      shape = new THREE.Mesh(
        new THREE.SphereGeometry(STANDARD_SIZE, 32, 32),
        new THREE.MeshPhongMaterial({
          color: color,
          shininess: 100,
          emissive: color,
          emissiveIntensity: 0.15,
        })
      );
      break;
    case "cube":
      shape = new THREE.Mesh(
        new THREE.BoxGeometry(STANDARD_SIZE, STANDARD_SIZE, STANDARD_SIZE),
        new THREE.MeshPhongMaterial({
          color: color,
          shininess: 80,
          emissive: color,
          emissiveIntensity: 0.12,
        })
      );
      break;
    case "torus":
      shape = new THREE.Mesh(
        new THREE.TorusGeometry(STANDARD_SIZE * 0.85, STANDARD_SIZE * 0.35, 16, 100),
        new THREE.MeshPhongMaterial({
          color: color,
          shininess: 90,
          emissive: color,
          emissiveIntensity: 0.13,
        })
      );
      break;
    case "cone":
      shape = new THREE.Mesh(
        new THREE.ConeGeometry(STANDARD_SIZE * 0.9, STANDARD_SIZE * 1.8, 32),
        new THREE.MeshPhongMaterial({
          color: color,
          shininess: 85,
          emissive: color,
          emissiveIntensity: 0.14,
        })
      );
      break;
    default:
      shape = new THREE.Mesh(
        new THREE.OctahedronGeometry(STANDARD_SIZE, 0),
        new THREE.MeshPhongMaterial({
          color: color,
          shininess: 95,
          emissive: color,
          emissiveIntensity: 0.16,
        })
      );
  }
  return shape;
}

// ====================================
// ANIMATION DE LA CAMÉRA
// ====================================

function tweenCamera(pos, look, dur) {
  controls.enabled = false;
  gsap.to(camera.position, {
    x: pos.x,
    y: pos.y,
    z: pos.z,
    duration: dur,
    ease: "expo.inOut",
  });
  gsap.to(controls.target, {
    x: look.x,
    y: look.y,
    z: look.z,
    duration: dur,
    ease: "expo.inOut",
    onComplete: function () {
      if (state.currentScreen === "game") {
        controls.enableRotate = true;
      } else {
        controls.enableRotate = false;
      }
      controls.enabled = true;
    },
  });
}

// ====================================
// GESTION DES TOUCHES CLAVIER
// ====================================

function handleKey(e) {
  var isDown = e.type === "keydown";
  var k = e.key.toLowerCase();
  if (k === "arrowup" || k === "z" || k === "w")
    moveState.forward = isDown;
  if (k === "arrowdown" || k === "s") moveState.backward = isDown;
  if (k === "arrowleft" || k === "q" || k === "a")
    moveState.left = isDown;
  if (k === "arrowright" || k === "d") moveState.right = isDown;
}

// ====================================
// DÉTECTION DES CLICS 3D
// ====================================

function onCanvasClick(event) {
  if (state.currentScreen !== "gallery") return;

  // Conversion des coordonnées écran vers l'espace normalisé WebGL (-1 à 1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  // true = cherche dans tous les enfants récursifs des groupes
  var intersects = raycaster.intersectObjects(galleryGroup.children, true);

  if (intersects.length > 0) {
    var obj = intersects[0].object;

    // On remonte l'arbre jusqu'au groupe parent qui porte l'id du biopic
    // car le raycaster peut toucher un sous-mesh du modèle GLB
    while (obj && !obj.userData.id) {
      obj = obj.parent;
    }

    if (obj && obj.userData.id) {
      var bio = null;
      for (var i = 0; i < BIOPICS.length; i++) {
        if (BIOPICS[i].id === obj.userData.id) {
          bio = BIOPICS[i];
          break;
        }
      }
      if (bio && !state.foundRefs.has(bio.id)) {
        selectedBiopic = bio;
        state.currentBiopicStartTime = Date.now();
        state.currentHintLevel = 0;
        SoundManager.play('click');
        changeScreen("game");
      }
    }
  }
}

// ====================================
// BOUCLE D'ANIMATION
// ====================================

function animate() {
  requestAnimationFrame(animate);
  if (state.inGameScreen) return;
  
  var delta = 0.016; // ~60fps
  
  // Mettre à jour le joueur si on est en galerie
  if (state.currentScreen === 'gallery' && typeof updatePlayer === 'function') {
    updatePlayer(delta);
  } else {
    controls.update();
  }

  if (galleryGroup.visible && controls.enabled && state.currentScreen !== 'gallery') {
    var speed = 0.4;
    if (moveState.forward) {
      camera.position.z -= speed;
      controls.target.z -= speed;
    }
    if (moveState.backward) {
      camera.position.z += speed;
      controls.target.z += speed;
    }
    if (moveState.left) {
      camera.position.x -= speed;
      controls.target.x -= speed;
    }
    if (moveState.right) {
      camera.position.x += speed;
      controls.target.x += speed;
    }
  }

  if (focusGroup.visible && !estEnTrainDeManipuler) {
    focusGroup.rotation.y += 0.012;
  }

  // ANIMATION DE ROTATION DES OBJETS LORS DE PROXIMITÉ
  if (galleryGroup.visible && state.currentScreen === 'gallery') {
    var proximityThreshold = 8; // Distance à partir de laquelle l'animation commence
    var cameraPosition = camera.position;

    galleryGroup.children.forEach(function(group) {
      if (group.userData && group.userData.originalPosition) { // C'est un objet biopics
        var distance = cameraPosition.distanceTo(group.position);

        if (distance < proximityThreshold) {
          // Calculer la vitesse de rotation basée sur la proximité (plus proche = plus rapide)
          var rotationSpeed = (proximityThreshold - distance) / proximityThreshold * 0.02;
          group.rotation.y += rotationSpeed;
        }
      }
    });
  }

  if (backgroundParticles) backgroundParticles.rotation.y += 0.0001;
  renderer.render(scene, camera);
}

// ====================================
// MISE À JOUR DES VISUELS DE LA GALERIE
// ====================================

// Masque les objets déjà trouvés pour indiquer visuellement la progression
function updateGalleryVisuals() {
  var children = galleryGroup.children;
  for (var i = 0; i < children.length; i++) {
    var g = children[i];
    if (g.children[0]) {
      var bioData = g.children[0].userData;
      var isFound = state.foundRefs.has(bioData.id);
      g.visible = !isFound;
    }
  }
}

// ====================================
// ANIMATION D'APPARITION DES OBJETS
// ====================================

function animateGalleryEntrance() {
  if (!galleryGroup || !galleryGroup.children) return;

  for (var i = 0; i < galleryGroup.children.length; i++) {
    var obj = galleryGroup.children[i];
    if (obj.userData.originalPosition) {
      var p = obj.userData.originalPosition;
      obj.position.set(p.x, p.y, p.z);
      obj.scale.set(1, 1, 1);
      obj.rotation.set(0, obj.userData.originalRotation || 0, 0);
    }
  }
  
}
