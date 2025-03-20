// Scene, Camera, and Renderer Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

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
const marsTexture = textureLoader.load('https://supernova.eso.org/static/archives/exhibitionimages/screen/Mars.jpg', () => {
    console.log('Mars texture loaded successfully');
}, undefined, (err) => {
    console.error('Error loading Mars texture:', err);
});
const marsGeometry = new THREE.SphereGeometry(2, 32, 32);
const marsMaterial = new THREE.MeshStandardMaterial({ map: marsTexture, roughness: 0.8, metalness: 0.2 });
const mars = new THREE.Mesh(marsGeometry, marsMaterial);
scene.add(mars);

// Increase the strength of directional light on Mars significantly
const marsLight = new THREE.DirectionalLight(0xffaa88, 1);
marsLight.position.set(3, 3, 2);
scene.add(marsLight);

// Add a powerful spotlight to strongly illuminate Mars
const spotLight = new THREE.SpotLight(0xff7733, 1, 10, Math.PI / 6, 0.5, 2);
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
  const gradient = context.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  context.fillStyle = gradient;
  context.fill();
  return new THREE.CanvasTexture(canvas);
}

const starGeometry = new THREE.BufferGeometry();
const starCount = 1000;
const starVertices = [];
for (let i = 0; i < starCount; i++) {
  const x = THREE.MathUtils.randFloatSpread(200);
  const y = THREE.MathUtils.randFloatSpread(200);
  const z = THREE.MathUtils.randFloatSpread(200);
  starVertices.push(x, y, z);
}
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const starMaterial = new THREE.PointsMaterial({ 
  color: 0xffffff,
  size: 1.5,
  map: createCircleTexture(),
  transparent: true,
  alphaTest: 0.5
});
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

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
  camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
  camera.position.y += (mouseY * 2 - camera.position.y) * 0.05;
  camera.lookAt(scene.position);
  
  renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});