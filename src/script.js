import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { GUI } from 'lil-gui';

/**
 * Base
 */
// Debug GUI
const gui = new GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("#7deef1"); 

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const matcapTexture = textureLoader.load('textures/matcaps/4.png');

/**
 * Fonts
 */
const fontLoader = new FontLoader();
fontLoader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
    // Material for text
    const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });

    // Create text geometry
    const textGeometry = new TextGeometry('DNA Double Helix Model', {
        font: font,
        size: 0.5,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
    });
    textGeometry.center();

    // Create mesh for text
    const text = new THREE.Mesh(textGeometry, material);
    // Adjust the text position vertically (move it down)
    text.position.y -= 7; 
    scene.add(text);
});

/**
 * DNA Parameters
 */
const dnaParams = {
    segmentCount: 50, // Number of DNA segments
    helixRadius: 1,   // Radius of the double helix
    helixHeight: 0.3, // Vertical spacing between segments
    rotationSpeed: 2.5, // Speed of rotation animation
    connectionLength: 0.2, // Length of the "rungs"
};

// Group to hold the DNA strands
const dnaGroup = new THREE.Group();
scene.add(dnaGroup);

/**
 * Create DNA Function
 */
const sphereMaterialA = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const sphereMaterialB = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const cylinderMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

const sphereGeometry = new THREE.SphereGeometry(0.1, 16, 16); // Base spheres for strands
const cylinderGeometry = new THREE.CylinderGeometry(0.05, 0.05, dnaParams.connectionLength, 16); // Connectors

const createDNA = () => {
    // Clear previous DNA strands
    while (dnaGroup.children.length > 0) {
        dnaGroup.remove(dnaGroup.children[0]);
    }

    // Create the DNA double helix
    for (let i = 0; i < dnaParams.segmentCount; i++) {
        const angle = i * 0.3; // Angle step for the helix
        const height = i * dnaParams.helixHeight; // Vertical position of the segment

        // First strand
        const sphereA = new THREE.Mesh(sphereGeometry, sphereMaterialA);
        sphereA.position.set(
            dnaParams.helixRadius * Math.cos(angle),
            height,
            dnaParams.helixRadius * Math.sin(angle)
        );

        // Second strand
        const sphereB = new THREE.Mesh(sphereGeometry, sphereMaterialB);
        sphereB.position.set(
            dnaParams.helixRadius * Math.cos(angle + Math.PI),
            height,
            dnaParams.helixRadius * Math.sin(angle + Math.PI)
        );

        // Connector (the rung)
        const connector = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        connector.position.set(
            (sphereA.position.x + sphereB.position.x) / 2,
            (sphereA.position.y + sphereB.position.y) / 2,
            (sphereA.position.z + sphereB.position.z) / 2
        );
        connector.lookAt(sphereB.position); // Align the cylinder with the base pair
        connector.rotateX(Math.PI / 2);

        dnaGroup.add(sphereA, sphereB, connector);
    }
    // After DNA is created, adjust the vertical position of the entire DNA group
    dnaGroup.position.y = -6; // Move the whole DNA structure down
};

// Initialize DNA
createDNA();

/**
 * GUI Controls
 */
gui.add(dnaParams, 'segmentCount', 10, 100, 1)
    .name('Segment Count')
    .onChange(createDNA);
gui.add(dnaParams, 'helixRadius', 0.5, 5, 0.1)
    .name('Helix Radius')
    .onChange(createDNA);
gui.add(dnaParams, 'helixHeight', 0.1, 1, 0.01)
    .name('Helix Height')
    .onChange(createDNA);
gui.add(dnaParams, 'rotationSpeed', 0.1, 5, 0.1)
    .name('Rotation Speed');

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(5, 5, 10);
scene.add(camera);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

/**
 * Controls
 */
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animation
 */
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Rotate the DNA strand
    dnaGroup.rotation.y = elapsedTime * dnaParams.rotationSpeed;

    // Update controls
    controls.update();

    // Render the scene
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();
