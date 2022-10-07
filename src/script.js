import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const canvas = document.querySelector("canvas.webgl");
const look = document.querySelector("div#look");
const walk = document.querySelector("div#walk");
const change = document.querySelector("div#change");

let text3D = null;
let mixer = null;
let currentIntersect = null;
let objectToTest = [];

const scene = new THREE.Scene();

const textureLoader = new THREE.TextureLoader();
const first = textureLoader.load("/textures/reddish.webp");
const second = textureLoader.load("/textures/handMade.webp");
const third = textureLoader.load("/textures/colorTexture.webp");
const fourth = textureLoader.load("/textures/camouflage.jpg");
const fifth = textureLoader.load("/textures/pencil.jpg");
const sixth = textureLoader.load("/textures/yellow.webp");

const fontLoader = new FontLoader();
fontLoader.load("/fonts/helvetiker_regular.typeface.json", (font) => {
  const textGeometry = new TextGeometry("Tap Here \n      to \n Call Yeti", {
    font: font,
    size: 1,
    height: 0.4,
    curveSegments: 80,
    bevelEnabled: true,
    bevelThickness: 0.15,
    bevelSize: 0.06,
    bevelOffset: 0,
    bevelSegments: 4,
  });
  textGeometry.center();
  const textMaterial = new THREE.MeshMatcapMaterial({ color: "#4BFFFF" });
  text3D = new THREE.Mesh(textGeometry, textMaterial);
  text3D.rotation.x = -Math.PI * 0.25;
  text3D.position.y = 3.1;
  objectToTest.push(text3D);
  scene.add(text3D);
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / sizes.width) * 2 - 1;
  mouse.y = -(event.clientY / sizes.height) * 2 + 1;
});

window.addEventListener("click", () => {
  if (currentIntersect !== null) {
    callYeti();
  }
});

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

const callYeti = () => {
  walk.style.display = "flex";
  look.style.display = "flex";
  change.style.display = "flex";
  scene.remove(text3D);
  gltfLoader.load("/models/doty.glb", (gltf) => {
    mixer = new THREE.AnimationMixer(gltf.scene);
    const looking = mixer.clipAction(gltf.animations[0]);
    const walking = mixer.clipAction(gltf.animations[1]);

    look.addEventListener("click", () => {
      looking.play();
      walking.stop();
    });

    walk.addEventListener("click", () => {
      walking.play();
      looking.stop();
    });
    change.addEventListener("click", () => {
      const textures = [first, second, third, fourth, fifth, sixth];
      gltf.scene.children[0].children[0].children[1].children[0].children[1].material.map =
        textures[Math.floor(Math.random() * textures.length)];
    });
    gltf.scene.scale.set(12, 12, 12);
    gltf.scene.position.set(0, 3, 0);
    gltf.scene.rotation.y = Math.PI * 0.15;

    scene.add(gltf.scene);
  });
};

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.castShadow = true;

directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 8, 8);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  raycaster.setFromCamera(mouse, camera);
  const intersect = raycaster.intersectObjects(objectToTest);

  if (intersect.length) {
    if (currentIntersect == null) {
      intersect[0].object.material.color.set("#FF7145");
    }
    currentIntersect = intersect[0];
  } else {
    if (currentIntersect) {
      currentIntersect.object.material.color.set("#4BFFFF");
    }
    currentIntersect = null;
  }
  if (mixer) {
    mixer.update(deltaTime * 2);
  }

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();
