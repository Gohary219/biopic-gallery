// ====================================
// SYSTÈME COMPLET - PERSONNAGE ROBLOX + CAMÉRA CINÉMA
// ====================================

var player = {
  mesh: null,
  height: 2.5,
  radius: 0.7,
  speed: 0.15,
  position: new THREE.Vector3(0, 0, 0),
  rotation: 0,
  isWalking: false,
  animations: {}
};

var controls3D = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  mouseX: 0,
  mouseY: 0,
  cameraDistance: 10,
  cameraHeight: 5,
  cameraAngle: 0,
  cinematicMode: false
};

var nearbyObject = null;
var interactionDistance = 4; // Distance en unités Three.js à partir de laquelle un objet est considéré "proche"

// ====================================
// CRÉATION PERSONNAGE ROBLOX
// ====================================

function createPlayer() {
  var playerGroup = new THREE.Group();
  
  // === TÊTE CARRÉE ROBLOX ===
  var headGeom = new THREE.BoxGeometry(1.4, 1.4, 1.4);
  var headMat = new THREE.MeshPhongMaterial({
    color: 0xffd966,
    shininess: 50,
    flatShading: true
  });
  var head = new THREE.Mesh(headGeom, headMat);
  head.position.y = 2.8;
  playerGroup.add(head);
  
  // === VISAGE ROBLOX ===
  var faceCanvas = document.createElement('canvas');
  faceCanvas.width = 256;
  faceCanvas.height = 256;
  var ctx = faceCanvas.getContext('2d');
  
  // Fond jaune
  ctx.fillStyle = '#ffd966';
  ctx.fillRect(0, 0, 256, 256);
  
  // Yeux noirs
  ctx.fillStyle = '#000000';
  ctx.fillRect(60, 80, 40, 50);
  ctx.fillRect(156, 80, 40, 50);
  
  // Blanc des yeux
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(70, 90, 20, 30);
  ctx.fillRect(166, 90, 20, 30);
  
  // Sourire
  ctx.fillStyle = '#000000';
  ctx.fillRect(80, 160, 96, 15);
  
  var faceTexture = new THREE.CanvasTexture(faceCanvas);
  var faceMat = new THREE.MeshBasicMaterial({ map: faceTexture });
  
  var faceGeom = new THREE.PlaneGeometry(1.41, 1.41);
  var face = new THREE.Mesh(faceGeom, faceMat);
  face.position.set(0, 2.8, 0.71);
  playerGroup.add(face);
  
  // === TORSE ===
  var torsoGeom = new THREE.BoxGeometry(1.6, 1.8, 1);
  var torsoMat = new THREE.MeshPhongMaterial({
    color: 0x0066ff,
    shininess: 50,
    flatShading: true
  });
  var torso = new THREE.Mesh(torsoGeom, torsoMat);
  torso.position.y = 1.4;
  playerGroup.add(torso);
  
  // === BRAS ===
  var armGeom = new THREE.BoxGeometry(0.5, 1.6, 0.5);
  var armMat = new THREE.MeshPhongMaterial({
    color: 0xffd966,
    shininess: 50,
    flatShading: true
  });
  
  var leftArm = new THREE.Mesh(armGeom, armMat);
  leftArm.position.set(-1.05, 1.4, 0);
  leftArm.name = 'leftArm';
  playerGroup.add(leftArm);
  
  var rightArm = new THREE.Mesh(armGeom, armMat);
  rightArm.position.set(1.05, 1.4, 0);
  rightArm.name = 'rightArm';
  playerGroup.add(rightArm);
  
  // === JAMBES ===
  var legGeom = new THREE.BoxGeometry(0.6, 1.4, 0.6);
  var legMat = new THREE.MeshPhongMaterial({
    color: 0x00aa00,
    shininess: 50,
    flatShading: true
  });
  
  var leftLeg = new THREE.Mesh(legGeom, legMat);
  leftLeg.position.set(-0.5, 0.3, 0);
  leftLeg.name = 'leftLeg';
  playerGroup.add(leftLeg);
  
  var rightLeg = new THREE.Mesh(legGeom, legMat);
  rightLeg.position.set(0.5, 0.3, 0);
  rightLeg.name = 'rightLeg';
  playerGroup.add(rightLeg);
  
  player.animations = {
    leftArm: leftArm,
    rightArm: rightArm,
    leftLeg: leftLeg,
    rightLeg: rightLeg,
    head: head
  };
  
  player.mesh = playerGroup;
  player.mesh.position.set(0, 0, 0);
  
  return playerGroup;
}

// ====================================
// ANIMATION DE MARCHE ROBLOX (SACCADÉE)
// ====================================

var walkCycle = 0;

function animateWalking(delta) {
  if (!player.animations.leftLeg) return;
  
  if (player.isWalking) {
    walkCycle += delta * 6;
    
    var step = Math.floor(walkCycle * 2) % 2;
    
    // Animation saccadée style Roblox
    if (step === 0) {
      player.animations.leftLeg.rotation.x = -0.5;
      player.animations.rightLeg.rotation.x = 0.5;
      player.animations.leftArm.rotation.x = 0.5;
      player.animations.rightArm.rotation.x = -0.5;
    } else {
      player.animations.leftLeg.rotation.x = 0.5;
      player.animations.rightLeg.rotation.x = -0.5;
      player.animations.leftArm.rotation.x = -0.5;
      player.animations.rightArm.rotation.x = 0.5;
    }
    
    // Bobbing de la tête
    player.animations.head.position.y = 2.8 + Math.sin(walkCycle * 4) * 0.05;
    
  } else {
    // Position neutre
    if (typeof gsap !== 'undefined') {
      gsap.to(player.animations.leftLeg.rotation, { x: 0, duration: 0.2 });
      gsap.to(player.animations.rightLeg.rotation, { x: 0, duration: 0.2 });
      gsap.to(player.animations.leftArm.rotation, { x: 0, duration: 0.2 });
      gsap.to(player.animations.rightArm.rotation, { x: 0, duration: 0.2 });
      gsap.to(player.animations.head.position, { y: 2.8, duration: 0.2 });
    }
  }
}

// ====================================
// ANIMATION - TENDRE LA MAIN (ROBLOX STYLE)
// ====================================

function playReachAnimation(targetObject) {
  if (!player.animations.rightArm) return;
  
  console.log('👋 Animation Roblox : tendre la main !');
  
  // Tourner vers l'objet
  var dx = targetObject.position.x - player.mesh.position.x;
  var dz = targetObject.position.z - player.mesh.position.z;
  var angle = Math.atan2(dx, dz);
  
  gsap.to(player.mesh.rotation, {
    y: angle,
    duration: 0.2,
    ease: "power1.out"
  });
  
  // Bras se tend (mouvement saccadé Roblox)
  gsap.to(player.animations.rightArm.rotation, {
    x: -1.5,
    duration: 0.15,
    ease: "steps(3)",
    onComplete: function() {
      setTimeout(function() {
        gsap.to(player.animations.rightArm.rotation, {
          x: 0,
          duration: 0.15,
          ease: "steps(3)"
        });
      }, 800);
    }
  });
  
  // Tête regarde l'objet
  gsap.to(player.animations.head.rotation, {
    x: -0.2,
    duration: 0.15,
    ease: "steps(2)",
    onComplete: function() {
      setTimeout(function() {
        gsap.to(player.animations.head.rotation, {
          x: 0,
          duration: 0.15,
          ease: "steps(2)"
        });
      }, 800);
    }
  });
}

// ====================================
// CAMÉRA CINÉMATOGRAPHIQUE
// ====================================

var cinematicCamera = {
  mode: 'follow', // 'follow', 'orbit', 'dramatic'
  
  // Mode FOLLOW - Caméra qui suit le personnage de dos
  updateFollow: function() {
    if (!player.mesh) return;
    
    var offset = new THREE.Vector3(
      Math.sin(controls3D.cameraAngle) * controls3D.cameraDistance,
      controls3D.cameraHeight,
      Math.cos(controls3D.cameraAngle) * controls3D.cameraDistance
    );
    
    var targetPos = player.mesh.position.clone().add(offset);
    var targetLook = player.mesh.position.clone();
    targetLook.y += 2;
    
    // Smooth camera
    camera.position.lerp(targetPos, 0.1);
    
    var currentDir = new THREE.Vector3();
    camera.getWorldDirection(currentDir);
    var lookTarget = camera.position.clone().add(currentDir);
    lookTarget.lerp(targetLook, 0.1);
    camera.lookAt(lookTarget);
  },
  
  // Mode DRAMATIC - Caméra dramatique qui tourne autour
  updateDramatic: function() {
    if (!player.mesh) return;
    
    var time = Date.now() * 0.0005;
    var radius = 12;
    
    camera.position.x = player.mesh.position.x + Math.sin(time) * radius;
    camera.position.z = player.mesh.position.z + Math.cos(time) * radius;
    camera.position.y = player.mesh.position.y + 6;
    
    camera.lookAt(player.mesh.position.x, player.mesh.position.y + 2, player.mesh.position.z);
  },
  
  // CINÉMATIQUE D'INTRO
  playIntro: function(callback) {
    console.log('🎬 CINÉMATIQUE D\'INTRO');
    
    // Caméra part de très haut
    camera.position.set(0, 80, 0);
    camera.lookAt(0, 0, 0);
    
    // Descente dramatique en spirale
    gsap.to(camera.position, {
      x: 15,
      y: 25,
      z: 15,
      duration: 3,
      ease: "power2.inOut",
      onUpdate: function() {
        camera.lookAt(0, 0, 0);
      }
    });
    
    // Zoom vers le joueur
    setTimeout(function() {
      gsap.to(camera.position, {
        x: 0,
        y: 8,
        z: 12,
        duration: 2,
        ease: "power2.out",
        onUpdate: function() {
          if (player.mesh) {
            camera.lookAt(player.mesh.position.x, player.mesh.position.y + 2, player.mesh.position.z);
          }
        },
        onComplete: function() {
          cinematicCamera.mode = 'follow';
          if (callback) callback();
        }
      });
    }, 3000);
  },
  
  // Effet de secousse caméra lors d'un clic sur un objet — renforce le retour visuel
  // Le decay réduit progressivement l'amplitude pour un arrêt naturel
  shake: function(intensity, duration) {
    var originalPos = camera.position.clone();
    var startTime = Date.now();
    var shakeInterval = setInterval(function() {
      var elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        clearInterval(shakeInterval);
        camera.position.copy(originalPos);
        return;
      }
      var decay = 1 - (elapsed / duration);
      camera.position.x = originalPos.x + (Math.random() - 0.5) * intensity * decay;
      camera.position.y = originalPos.y + (Math.random() - 0.5) * intensity * decay;
      camera.position.z = originalPos.z + (Math.random() - 0.5) * intensity * decay;
    }, 16);
  }
};

// ====================================
// CONTRÔLES
// ====================================

function setupPlayerControls() {
  document.addEventListener('keydown', function(e) {
    switch(e.key.toLowerCase()) {
      case 'z': case 'w': controls3D.forward = true; break;
      case 's': controls3D.backward = true; break;
      case 'q': case 'a': controls3D.left = true; break;
      case 'd': controls3D.right = true; break;
      case 'c':
        // Changer mode caméra
        cycleCameraMode();
        break;
    }
  });
  
  document.addEventListener('keyup', function(e) {
    switch(e.key.toLowerCase()) {
      case 'z': case 'w': controls3D.forward = false; break;
      case 's': controls3D.backward = false; break;
      case 'q': case 'a': controls3D.left = false; break;
      case 'd': controls3D.right = false; break;
    }
  });
  
  var isDragging = false;
  var mouseSensitivity = 0.002;

  document.addEventListener('mousedown', function(e) {
    if (state.currentScreen === 'gallery') isDragging = true;
  });
  document.addEventListener('mouseup', function() { isDragging = false; });

  document.addEventListener('mousemove', function(e) {
    if (state.currentScreen !== 'gallery') return;

    if (isDragging) {
      // Clic maintenu : rotation précise proportionnelle au mouvement de souris
      controls3D.cameraAngle += e.movementX * mouseSensitivity;
    } else {
      // Sans clic : rotation douce basée sur la position relative au centre de l'écran
      // Cela donne une impression de "regard" naturel même sans interaction directe
      var canvas = document.getElementById('canvas-container');
      if (canvas) {
        var rect = canvas.getBoundingClientRect();
        var deltaX = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
        controls3D.cameraAngle += deltaX * mouseSensitivity * 0.5;
      }
    }
  });
  
  document.addEventListener('contextmenu', function(e) {
    if (state.currentScreen === 'gallery') {
      e.preventDefault();
    }
  });
  
  // SYSTÈME DE CLIC SUR OBJETS
  setupObjectClicking();
}

function cycleCameraMode() {
  var modes = ['follow', 'dramatic'];
  var currentIndex = modes.indexOf(cinematicCamera.mode);
  var nextIndex = (currentIndex + 1) % modes.length;
  cinematicCamera.mode = modes[nextIndex];
  
  console.log('📷 Mode caméra:', cinematicCamera.mode);
  
  // Notification
  showNotification('Caméra: ' + cinematicCamera.mode.toUpperCase());
}

function showNotification(text) {
  var notif = document.createElement('div');
  notif.textContent = text;
  notif.style.cssText = `
    position: fixed;
    top: 120px;
    right: 30px;
    background: rgba(212, 175, 55, 0.9);
    color: black;
    padding: 15px 25px;
    border-radius: 8px;
    font-weight: 900;
    font-size: 14px;
    z-index: 1000;
    animation: slideInRight 0.3s ease-out;
  `;
  document.body.appendChild(notif);
  
  setTimeout(function() {
    notif.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(function() {
      notif.remove();
    }, 300);
  }, 2000);
}

// ====================================
// MISE À JOUR DU JOUEUR
// ====================================

function updatePlayer(delta) {
  if (!player.mesh) return;
  
  var moveVector = new THREE.Vector3();
  var isMoving = false;
  
  if (controls3D.forward) {
    moveVector.z -= 1;
    isMoving = true;
  }
  if (controls3D.backward) {
    moveVector.z += 1;
    isMoving = true;
  }
  if (controls3D.left) {
    moveVector.x -= 1;
    isMoving = true;
  }
  if (controls3D.right) {
    moveVector.x += 1;
    isMoving = true;
  }
  
  player.isWalking = isMoving;
  
  if (isMoving) {
    moveVector.normalize();
    moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), controls3D.cameraAngle);
    
    var newX = player.mesh.position.x + moveVector.x * player.speed;
    var newZ = player.mesh.position.z + moveVector.z * player.speed;
    
    // COLLISION - Rester dans le cercle
    var distFromCenter = Math.sqrt(newX * newX + newZ * newZ);
    if (distFromCenter < 18) { // Rayon du cercle
      player.mesh.position.x = newX;
      player.mesh.position.z = newZ;
    }
    
    var angle = Math.atan2(moveVector.x, moveVector.z);
    player.mesh.rotation.y = angle;
  }
  
  animateWalking(delta);
  
  // Mettre à jour caméra selon le mode
  if (cinematicCamera.mode === 'follow') {
    cinematicCamera.updateFollow();
  } else if (cinematicCamera.mode === 'dramatic') {
    cinematicCamera.updateDramatic();
  }
  
  checkNearbyObjects();
}

// ====================================
// DÉTECTION OBJETS AVEC EFFETS VISUELS
// ====================================

var objectHalos = new Map();

function checkNearbyObjects() {
  if (!player.mesh || !galleryGroup) return;
  
  nearbyObject = null;
  var closestDist = interactionDistance;
  
  // Enlever les anciens halos
  objectHalos.forEach(function(halo, obj) {
    if (halo.parent) {
      halo.parent.remove(halo);
    }
  });
  objectHalos.clear();
  
  for (var i = 0; i < galleryGroup.children.length; i++) {
    var obj = galleryGroup.children[i];
    
    // Objets
    if (obj.userData && obj.userData.originalPosition) {
      var dist = player.mesh.position.distanceTo(obj.position);
      if (dist < closestDist) {
        closestDist = dist;
        nearbyObject = obj;
        
        // CRÉER HALO LUMINEUX autour de l'objet proche
        createObjectHalo(obj);
      }
    }
  }
  
  updateInteractionUI();
}

function createObjectHalo(obj) {
  // Anneau lumineux qui tourne autour de l'objet
  var haloGeom = new THREE.TorusGeometry(2.5, 0.08, 16, 100);
  var haloMat = new THREE.MeshBasicMaterial({
    color: 0xffd700,
    transparent: true,
    opacity: 0.6
  });
  var halo = new THREE.Mesh(haloGeom, haloMat);
  halo.rotation.x = Math.PI / 2;
  halo.position.y = -1.5;
  
  obj.add(halo);
  objectHalos.set(obj, halo);
  
  // Animation de rotation
  gsap.to(halo.rotation, {
    z: Math.PI * 2,
    duration: 3,
    repeat: -1,
    ease: "none"
  });
  
  // Animation de pulsation
  gsap.to(halo.scale, {
    x: 1.2,
    y: 1.2,
    z: 1.2,
    duration: 1,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });
  
  // Particules dorées qui tournent
  createOrbitingParticles(obj);
  
  // Afficher le NOM du film au-dessus
  showFilmNameLabel(obj);
}

function createOrbitingParticles(obj) {
  var particleCount = 8;
  var radius = 3;
  
  for (var i = 0; i < particleCount; i++) {
    var angle = (i / particleCount) * Math.PI * 2;
    
    var particleGeom = new THREE.SphereGeometry(0.1, 8, 8);
    var particleMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.8
    });
    var particle = new THREE.Mesh(particleGeom, particleMat);
    
    particle.position.x = Math.cos(angle) * radius;
    particle.position.z = Math.sin(angle) * radius;
    particle.position.y = 1;
    
    obj.add(particle);
    
    // Animation orbitale
    gsap.to(particle.position, {
      x: Math.cos(angle + Math.PI * 2) * radius,
      z: Math.sin(angle + Math.PI * 2) * radius,
      duration: 4,
      repeat: -1,
      ease: "none",
      modifiers: {
        x: function(x) {
          var time = Date.now() * 0.001;
          return Math.cos(angle + time) * radius;
        },
        z: function(z) {
          var time = Date.now() * 0.001;
          return Math.sin(angle + time) * radius;
        }
      }
    });
    
    objectHalos.set(particle, particle);
  }
}

function showFilmNameLabel(obj) {
  if (!obj.children || !obj.children[1] || !obj.children[1].userData) return;
  
  var biopic = obj.children[1].userData;
  if (!biopic) return;
  
  // Créer un canvas avec le nom du film
  var canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  var ctx = canvas.getContext('2d');
  
  // Fond semi-transparent
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, 512, 128);
  
  // Bordure dorée
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, 512, 128);
  
  // Texte
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(biopic.name.toUpperCase(), 256, 64);
  
  var texture = new THREE.CanvasTexture(canvas);
  var spriteMat = new THREE.SpriteMaterial({ 
    map: texture,
    transparent: true
  });
  var sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(6, 1.5, 1);
  sprite.position.y = 5;
  
  obj.add(sprite);
  objectHalos.set(sprite, sprite);
  
  // Animation d'apparition
  sprite.material.opacity = 0;
  gsap.to(sprite.material, {
    opacity: 1,
    duration: 0.3
  });
  
  // Bobbing
  gsap.to(sprite.position, {
    y: 5.3,
    duration: 1.5,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });
}

function updateInteractionUI() {
  document.body.style.cursor = nearbyObject ? 'pointer' : 'default';
}

// ====================================
// CLIC SUR OBJET
// ====================================

function setupObjectClicking() {
  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();
  
  document.addEventListener('click', function(e) {
    if (state.currentScreen !== 'gallery') return;
    
    // Calculer la position de la souris
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    
    // Raycaster
    raycaster.setFromCamera(mouse, camera);
    
    // Vérifier si on a cliqué sur un objet proche
    if (nearbyObject) {
      var intersects = raycaster.intersectObjects(galleryGroup.children, true);
      
      for (var i = 0; i < intersects.length; i++) {
        var obj = intersects[i].object;
        
        // Trouver le groupe parent
        while (obj.parent && obj.parent !== galleryGroup) {
          obj = obj.parent;
        }
        
        if (obj === nearbyObject) {
          interactWithObject(nearbyObject);
          break;
        }
      }
    }
  });
}

function interactWithObject(obj) {
  if (!obj || !obj.children || !obj.children[1]) return;
  
  var biopic = obj.children[1].userData;
  if (!biopic) return;
  
  console.log('🎬 Clic sur:', biopic.name);
  
  playReachAnimation(obj);
  cinematicCamera.shake(0.2, 300);
  
  // Flash doré
  if (typeof ParticleSystem !== 'undefined') {
    ParticleSystem.explode(window.innerWidth / 2, window.innerHeight / 2, 20);
  }
  
  setTimeout(function() {
    selectBiopic(biopic);
    changeScreen('game');
  }, 900);
}

// Export
window.createPlayer = createPlayer;
window.setupPlayerControls = setupPlayerControls;
window.updatePlayer = updatePlayer;
window.cinematicCamera = cinematicCamera;

console.log('🎮 Système Roblox + Caméra Cinéma chargé !');
