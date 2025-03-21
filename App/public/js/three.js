// Scene, Camera, and Renderer Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1); // White background

// Append renderer's canvas to the background container
const bgContainer = document.getElementById('threejs-background');
bgContainer.appendChild(renderer.domElement);

// Style the canvas so it covers the entire background
renderer.domElement.style.position = 'fixed';
renderer.domElement.style.top = 0;
renderer.domElement.style.left = 0;
renderer.domElement.style.zIndex = '-1';

// Load Mars texture from an online source
const textureLoader = new THREE.TextureLoader();
const marsTexture = textureLoader.load('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTv2vZwe5UJrgkP-2gUSv3gwzKorOQSqCabYqsJlEwPQXqyi71YxXlVRZe8HAfKIgMd9u0&usqp=CAU', () => {
    console.log('Mars texture loaded successfully');
}, undefined, (err) => {
    console.error('Error loading Mars texture:', err);
});
//nfsdnie
const marsGeometry = new THREE.SphereGeometry(1.2, 64, 64);
const marsMaterial = new THREE.MeshStandardMaterial({ 
  map: marsTexture, 
  roughness: 0.8, 
  metalness: 0.2 
});
const mars = new THREE.Mesh(marsGeometry, marsMaterial);
scene.add(mars);
mars.position.y = -1;

//a Increase the strength of directional light on Mars significantly
const marsLight = new THREE.DirectionalLight(0xffffff, 1);
marsLight.position.set(3, 3, 2);
scene.add(marsLight);

// Add a powerful spotlight to strongly illuminate Mars
const spotLight = new THREE.SpotLight(0xffffff, 1, 1, Math.PI / 6, 0.5, 2);
spotLight.position.set(3, 3, 2);
spotLight.target = mars;
scene.add(spotLight);
scene.add(spotLight.target);

// Create a star field with round stars using a circle texture
function createCircleTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  context.beginPath();
  context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, false);
  context.closePath();
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  context.fillStyle = gradient;
  context.fill();
  return new THREE.CanvasTexture(canvas);
}

const starGeometry = new THREE.BufferGeometry();
const starCount = 240;
const starVertices = [];
const minSeparation = 5; // Minimum separation distance between stars

// Modified star generation: use rejection sampling to ensure stars are not too close.
for (let i = 0; i < starCount; i++) {
  let valid = false;
  let attempt = 0;
  while (!valid && attempt < 1000) {
    const x = THREE.MathUtils.randFloatSpread(130);
    const y = THREE.MathUtils.randFloatSpread(60);
    const z = THREE.MathUtils.randFloatSpread(3) - 15;
    valid = true;
    // Check against every star already in the list.
    for (let j = 0; j < starVertices.length; j += 3) {
      const dx = x - starVertices[j];
      const dy = y - starVertices[j + 1];
      const dz = z - starVertices[j + 2];
      if ((dx * dx + dy * dy + dz * dz) < minSeparation * minSeparation) {
        valid = false;
        break;
      }
    }
    if (valid) {
      starVertices.push(x, y, z);
    }
    attempt++;
  }
}
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

// Update star material: size set to 1 and color set to black.
const starMaterial = new THREE.PointsMaterial({ 
  color: 0x2f611d, 
  size: 1,
  map: createCircleTexture(),
  transparent: true,
  alphaTest: 0.5
});
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// === Added for Star Animation ===
// Save a copy of the original star positions and assign a phase/amplitude per star.
const originalStarPositions = starGeometry.attributes.position.array.slice(0);
const starPhases = [];
const starAmplitudes = [];
for (let i = 0; i < starCount; i++) {
  starPhases.push(Math.random() * Math.PI * 2);
  starAmplitudes.push(0.2 + Math.random() * 0.3); // amplitude between 0.2 and 0.5
}
// ================================

// -----------------------------------------------------------------
// Create connections between stars ensuring at least 2 per star
// -----------------------------------------------------------------
const thresholdDistance = 10;  // Only connect stars within this distance
const connectionsForStar = new Array(starCount).fill(0).map(() => []);
const connectionsList = [];

// Loop through every unique pair and add a connection if they're close enough.
for (let i = 0; i < starCount; i++) {
  const i3 = i * 3;
  const x1 = starVertices[i3],
        y1 = starVertices[i3 + 1],
        z1 = starVertices[i3 + 2];
  for (let j = i + 1; j < starCount; j++) {
    const j3 = j * 3;
    const x2 = starVertices[j3],
          y2 = starVertices[j3 + 1],
          z2 = starVertices[j3 + 2];
    const dx = x2 - x1,
          dy = y2 - y1,
          dz = z2 - z1;
    if (dx * dx + dy * dy + dz * dz < thresholdDistance * thresholdDistance) {
      connectionsList.push({ i, j });
      connectionsForStar[i].push(j);
      connectionsForStar[j].push(i);
    }
  }
}

// Ensure every star has at least 2 connections.
for (let i = 0; i < starCount; i++) {
  while (connectionsForStar[i].length < 2) {
    const i3 = i * 3;
    const x1 = starVertices[i3],
          y1 = starVertices[i3 + 1],
          z1 = starVertices[i3 + 2];
    let minDist = Infinity;
    let closestStar = -1;
    for (let j = 0; j < starCount; j++) {
      if (j === i || connectionsForStar[i].includes(j)) continue;
      const j3 = j * 3;
      const x2 = starVertices[j3],
            y2 = starVertices[j3 + 1],
            z2 = starVertices[j3 + 2];
      const dx = x2 - x1,
            dy = y2 - y1,
            dz = z2 - z1;
      const distSq = dx * dx + dy * dy + dz * dz;
      if (distSq < minDist) {
        minDist = distSq;
        closestStar = j;
      }
    }
    if (closestStar !== -1) {
      connectionsList.push({ i, j: closestStar });
      connectionsForStar[i].push(closestStar);
      connectionsForStar[closestStar].push(i);
    } else {
      break;
    }
  }
}

// Build an array for line positions from our connections list.
const linePositions = [];
connectionsList.forEach(({ i, j }) => {
  const i3 = i * 3;
  const j3 = j * 3;
  linePositions.push(
    starVertices[i3], starVertices[i3 + 1], starVertices[i3 + 2],
    starVertices[j3], starVertices[j3 + 1], starVertices[j3 + 2]
  );
});

const lineGeometry = new THREE.BufferGeometry();
lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
const lineMaterial = new THREE.LineBasicMaterial({ 
  color: 0x000000, // black connections
  transparent: true, 
  opacity: 0.5,
  linewidth: 2  // Thicker line (if supported)
});
const connections = new THREE.LineSegments(lineGeometry, lineMaterial);
scene.add(connections);
// -----------------------------------------------------------------
// End of star connections
// -----------------------------------------------------------------

// Lighting for the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.12);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 0.5);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// Track mouse movement for subtle camera movement
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = - (event.clientY / window.innerHeight) * 2 + 1;
});

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  
  // Rotate Mars slowly for realism
  mars.rotation.y += 0.002;
  
  // Subtle camera movement based on mouse
  camera.position.x += (mouseX * 0.8 - camera.position.x) * 0.5;
  camera.position.y += (mouseY * 0.8 - camera.position.y) * 0.5;
  camera.lookAt(scene.position);
  
  // --- Added Star Animation ---
  const time = Date.now() * 0.001;
  const positions = starGeometry.attributes.position.array;
  for (let i = 0; i < starCount; i++) {
    const baseX = originalStarPositions[i * 3];
    const baseY = originalStarPositions[i * 3 + 1];
    const baseZ = originalStarPositions[i * 3 + 2];
    const phase = starPhases[i];
    const amplitude = starAmplitudes[i];
    const offset = Math.sin(time + phase) * amplitude;
    positions[i * 3] = baseX + offset;
    positions[i * 3 + 1] = baseY + offset;
    positions[i * 3 + 2] = baseZ + offset * 0.5;
  }
  starGeometry.attributes.position.needsUpdate = true;
  
  // Update connection lines to follow animated star positions
  const linePositions = lineGeometry.attributes.position.array;
  for (let k = 0; k < connectionsList.length; k++) {
    const conn = connectionsList[k];
    const i = conn.i;
    const j = conn.j;
    linePositions[k * 6] = positions[i * 3];
    linePositions[k * 6 + 1] = positions[i * 3 + 1];
    linePositions[k * 6 + 2] = positions[i * 3 + 2];
    linePositions[k * 6 + 3] = positions[j * 3];
    linePositions[k * 6 + 4] = positions[j * 3 + 1];
    linePositions[k * 6 + 5] = positions[j * 3 + 2];
  }
  lineGeometry.attributes.position.needsUpdate = true;
  // --- End Star Animation ---
  
  renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
