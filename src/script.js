import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import TWEEN from '@tweenjs/tween.js'
import { Water } from 'three/examples/jsm/objects/Water.js';

/**
 * Setup Global Utilities
 * GUI, Canvas, Scene, Mixer, Camera vector
 */
const gui = new dat.GUI({ closed: false, width: 700})
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()
let mixer = null

/**
 * Set Up File loaders
 */
//Loading Manager
const loadingManager = new THREE.LoadingManager()

loadingManager.onStart = function ( url, itemsLoaded, itemsTotal ) {
	console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};
loadingManager.onLoad = function ( ) {
    const loadingScreen = document.getElementById('loading-screen')
    loadingScreen.classList.add( 'fade-out' );
    loadingScreen.addEventListener( 'transitionend', onTransitionEnd );
	console.log( 'Loading complete!');
};
loadingManager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
	console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};

loadingManager.onError = function ( url ) {
	console.log( 'There was an error loading ' + url );
};

function onTransitionEnd( event ) {
	event.target.remove();
}

//Models
const dracoLoader = new DRACOLoader(loadingManager)
dracoLoader.setDecoderPath('/draco/')
const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)

//Textures
const textureLoader = new THREE.TextureLoader(loadingManager)
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager)

//Fonts
const fontLoader = new THREE.FontLoader(loadingManager)

//Helper functions for main file loading
function loadWithPromise(url, loader){
    return new Promise((resolve, reject) => {
        loader.load(url, data=> resolve(data), null, reject);
      });
}

async function doLoading(url, loader, textureUrl, textureLoader){
    const gltfData = await loadWithPromise(url, loader)
    const texture = await loadWithPromise(textureUrl, textureLoader)
    texture.flipY = false
    const material = new THREE.MeshBasicMaterial({ map: texture})
    gltfData.scene.traverse((child) => {child.material = material});    
    let model = gltfData.scene
    scene.add(model)
    applyModelSettings(model)
    return model
}

function applyModelSettings(model){
    model.scale.set(0.5, 0.5, 0.5)
}

/**
 * Constants
 */
const params = {
    helperx: 0,
    helpery: 2,
    helperz: 0,
    animationDuration: 1000
}

const cameraSettings = {
    cameraPositionX: 79.39020840624255,
    cameraPositionY: 5.30854889867763,
    cameraPositionZ: 44.76856193642261,
    fov: 8,
    targetx: 0,
    targety: 2,
    targetz: 0
}
const cameraSettings1 = {
    cameraPositionX: 10.09952891398274,
    cameraPositionY: 5.283287750839582,
    cameraPositionZ: 0.6046661058867199,
    fov: 35,
    targetx: 9.2,
    targety: 1.8,
    targetz: 38
}

const cameraSettings2 = {
    cameraPositionX: 19.549670902554276,
    cameraPositionY: 1.9951785273600007,
    cameraPositionZ: 12.074181724836727,
    fov: 40,
    targetx: 19,
    targety: 1.1,
    targetz: 24
}


const oceanSettings = {
    oceanColor: 0x001e0f,
    oceanSunColor: 0xffffff,
    distortionScale: 2.5,
    timeModifier: 320
}

//Start Loading Stuff -----------------------------------------------------------------------------------------------------

/**
 * Load Materials
 */
//General
const waterTexture = textureLoader.load('/textures/Misc/waternormals.jpg', function ( texture ) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    }) 
    
//Sky Textures
const skyCubeTexture = cubeTextureLoader.load([
    'textures/Sky/px.png',
    'textures/Sky/nx.png',
    'textures/Sky/py.png',
    'textures/Sky/ny.png',
    'textures/Sky/pz.png',
    'textures/Sky/nz.png'
  ]);

scene.background = skyCubeTexture;

//Dock Building
let DockBuilding_Building = doLoading(
    '/models/DockBuilding/glTF-Draco/DockBuilding_Model_Building.glb', gltfLoader,
    '/textures/DockBuilding/DockBuilding_Building.png', textureLoader
)
let DockBuilding_Surface = doLoading(
    '/models/DockBuilding/glTF-Draco/DockBuilding_Model_Surface.glb', gltfLoader,
    '/textures/DockBuilding/DockBuilding_Surface.png', textureLoader
)
let DockBuilding_Pylons = doLoading(
    '/models/DockBuilding/glTF-Draco/DockBuilding_Model_Pylons.glb', gltfLoader,
    '/textures/DockBuilding/DockBuilding_Pylons.png', textureLoader
)
let DockBuilding_Deco = doLoading(
    '/models/DockBuilding/glTF-Draco/DockBuilding_Model_Deco.glb', gltfLoader,
    '/textures/DockBuilding/DockBuilding_Deco.png', textureLoader
)
//Maine State Pier
let MaineStatePier_Building = doLoading(
    '/models/MaineStatePier/glTF-Draco/MaineStatePier_Model_Building_8K.glb', gltfLoader,
    '/textures/MaineStatePier/MaineStatePier_Building_8K.png', textureLoader
)
let MaineStatePier_Surface = doLoading(
    '/models/MaineStatePier/glTF-Draco/MaineStatePier_Model_Surface.glb', gltfLoader,
    '/textures/MaineStatePier/MaineStatePier_Surface.png', textureLoader
)
let MaineStatePier_Pylons = doLoading(
    '/models/MaineStatePier/glTF-Draco/MaineStatePier_Model_Pylons.glb', gltfLoader,
    '/textures/MaineStatePier/MaineStatePier_Pylons.png', textureLoader
)
let MaineStatePier_Deco = doLoading(
    '/models/MaineStatePier/glTF-Draco/MaineStatePier_Model_Deco.glb', gltfLoader,
    '/textures/MaineStatePier/MaineStatePier_Deco.png', textureLoader
)
//Park
let Park_Surface = doLoading(
    '/models/Park/glTF-Draco/Park_Surface.glb', gltfLoader,
    '/textures/Park/Park_Surface.png', textureLoader
)
let Park_Foliage = doLoading(
    '/models/Park/glTF-Draco/Park_Foliage.glb', gltfLoader,
    '/textures/Park/Park_Foliage.png', textureLoader
)
let Park_Deco = doLoading(
    '/models/Park/glTF-Draco/Park_Deco.glb', gltfLoader,
    '/textures/Park/Park_Deco.png', textureLoader
)
let Park_Rocks = doLoading(
    '/models/Park/glTF-Draco/Park_Rocks.glb', gltfLoader,
    '/textures/Park/Park_Rocks.png', textureLoader
)

//Bug Light
let BugLight = doLoading(
    '/models/BugLight/glTF-Draco/BugLight.glb', gltfLoader,
    '/textures/BugLight/BugLight.png', textureLoader
)

//Fort Gorges
let FortGorges = doLoading(
    '/models/FortGorges/glTF-Draco/FortGorges.glb', gltfLoader,
    '/textures/FortGorges/FortGorges.png', textureLoader
)

//City
let City_Modeled = doLoading(
    '/models/City/glTF-Draco/City_Modeled.glb', gltfLoader,
    '/textures/City/City_Modeled.png', textureLoader
)

let City_Projected = doLoading(
    '/models/City/glTF-Draco/City_Projected.glb', gltfLoader,
    '/textures/City/City_Projected.png', textureLoader
)



/**
 * Load Fonts and Matcaps
 */
let helvetica, matcapTexture
let fontLoadPromise = loadWithPromise('/fonts/helvetiker_regular.typeface.json',fontLoader).then(result => { helvetica = result })
let matcapTexturePromise = loadWithPromise('/textures/matcaps/1.png',textureLoader).then(result =>{ matcapTexture = result})

// Generated Mesh Objects -----------------------------------------------------------------------------------------------------

/**
 * Handle Loaded Data
 */
//Make Text Geometry
function generateTextGeometry(text, font, size, height){
    //Generate Text and add to scene
    const textGeometry = new THREE.TextGeometry(
       text,
       {
           font: font,
           size: size,
           height: height,
           curveSegments: 4,
           bevelEnabled: true,
           bevelThickness: 0.03,
           bevelSize: 0.02,
           bevelOffset: 0,
           bevelSegments: 5
       }
   )
   textGeometry.computeBoundingBox()
   textGeometry.center()
   return textGeometry
}

//Generate Scene Text after Font/Matcap Load
let greetingText, cityText, cityText1, overViewText
Promise.all([fontLoadPromise, matcapTexturePromise]).then(() => {
    const textMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapTexture })

    //Greeting Text
    const greetingTextGeometry = generateTextGeometry('Hi, I\'m Henry',helvetica, 0.5, 0.2)
    greetingText = new THREE.Mesh(greetingTextGeometry, textMaterial)
    greetingText.position.set(-50,5.5,-30)
    greetingText.scale.set(5,5,5)
    greetingText.rotation.y = .4* Math.PI
    scene.add(greetingText)

    //City Text
    const cityTextGeometry = generateTextGeometry('I\'m a 3D Artist',helvetica, 0.5, 0.2)
    cityText = new THREE.Mesh(cityTextGeometry, textMaterial)
    cityText.position.set(9.5,11,41.3)
    cityText.scale.set(5,5,5)
    cityText.rotation.y = 1* Math.PI
    scene.add(cityText)

    //City Text2
    const cityTextGeometry1 = generateTextGeometry('and Software Engineer',helvetica, 0.5, 0.2)
    cityText1 = new THREE.Mesh(cityTextGeometry1, textMaterial)
    cityText1.position.set(9.5,8,41.3)
    cityText1.scale.set(3,3,3)
    cityText1.rotation.y = 1* Math.PI
    scene.add(cityText1)
    
    //continue the process
    tick()
});

//Water
function buildWater() {
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    const water = new Water(
      waterGeometry,
      {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: waterTexture,
        alpha: 1.0,
        sunDirection: new THREE.Vector3(),
        sunColor: oceanSettings.oceanSunColor,
        waterColor: oceanSettings.oceanColor,
        distortionScale: oceanSettings.distortionScale,
        fog: scene.fog !== undefined
      }
    );
    water.rotation.x =- Math.PI / 2;
    scene.add(water);
    
    const waterUniforms = water.material.uniforms;
    return water;
}

const water = buildWater()

/**
 * Non Loaded Objects
 */
//3d Buttons
const buttonMaterial = new THREE.MeshBasicMaterial({ color: '#ff0000' })
const buttonGeometry = new THREE.SphereGeometry(0.5, 16, 16)

const button1 = new THREE.Mesh(buttonGeometry,buttonMaterial)
button1.position.set(10.7,1.8,6.2)
scene.add(button1)

const button2 = new THREE.Mesh(buttonGeometry,buttonMaterial)
button2.position.set(9.5,2,26)
scene.add(button2)

const button3 = new THREE.Mesh(buttonGeometry,buttonMaterial)
button3.position.set(19,1.8,24)
scene.add(button3)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * User Input
 */
//Raycaster
const raycaster = new THREE.Raycaster()
let currentIntersect = null

//Mouse
const mouse = new THREE.Vector2()

window.addEventListener('mousemove', (event) =>
{
    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = - (event.clientY / sizes.height) * 2 + 1
})

window.addEventListener('click', () =>
{
    if(currentIntersect)
    {
        switch(currentIntersect.object)
        {
            case button1:
                console.log('Button1')
                cameraToMarker(cameraSettings1)
                break
            case button2:
                console.log('Button2')
                cameraToMarker(cameraSettings2)
                break
            case button3:
                console.log('Button3')
                cameraToMarker(cameraSettings)
                break
        }
    }
})

//Window resize
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})
// Scene Setup ---------------------------------------------------------------------------------------------------------------

/**
 * GUI Items
 */
// 3D Cursor GUI
/**
 * Helper Cube functions
 */
let helper = null
const debugObject = {}
debugObject.placeHelper = () => {
    if(!helper){
        console.log("placing helper")
        helper = createBox(
            1,
            1,
            1,
        {
            x: params.helperx,
            y: params.helpery,
            z: params.helperz
        })
        scene.add(helper)
    }
}
 
//HelperBox
const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const boxMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
})

const createBox = (width, height, depth, position) =>{
    //Three.js Mesh
    const mesh = new THREE.Mesh(boxGeometry, boxMaterial)
    mesh.scale.set(width, height, depth)
    mesh.castShadow = true
    mesh.position.copy(position)
    return mesh
}

var helperGUI = gui.addFolder("Cube Helper")
helperGUI.add(debugObject, 'placeHelper')
helperGUI.add(params, 'helperx').min(-100).max(100).step(0.001)
helperGUI.add(params, 'helpery').min(-100).max(100).step(0.001)
helperGUI.add(params, 'helperz').min(-100).max(100).step(0.001)

// Camera GUI
debugObject.logCamera = () => {
    console.log("Camera Details")
    console.log(camera)
}

var cameraGUI = gui.addFolder("Camera")
cameraGUI.add(debugObject, 'logCamera')

// Ocean GUI
const oceanFolder = gui.addFolder("Ocean")
oceanFolder.add(oceanSettings, 'timeModifier').min(0).max(500).step(1)

/**
 * Camera Movements
 */
/**
 * Big Boi Tween Time
 * Function Structure is as follows:
 * 
 * Quaternion Tween
 *      -Field of View Tween
 *          -Camera Position Tween
 *              -Camera/Controls Target Tween
 * 
 * All values are tweened simultaniously (via chaining the onStart() methods)
 * Special thanks to Dan Hammond and his wonderful blog post detailing this 
 * method: https://blogs.perficient.com/2020/05/21/3d-camera-movement-in-three-js-i-learned-the-hard-way-so-you-dont-have-to/
 */
function cameraToMarker(marker) {
    const storedMarkerPosition = new THREE.Vector3(marker.targetx, marker.targety, marker.targetz);
    const startQuaternion = camera.quaternion.clone();
    camera.lookAt(storedMarkerPosition);
    const endQuaternion = camera.quaternion.clone();
    camera.quaternion.set(startQuaternion);
    let time = {t: 0};
    let currentFov = {fov: camera.fov}
    let currentTarget = {x: controls.target.x,y: controls.target.y,z: controls.target.z}


    new TWEEN.Tween(time)
        .to({t: 1}, params.animationDuration/2)
        .onStart(() =>{
            new TWEEN.Tween(currentFov)
            .to({fov: marker.fov}, params.animationDuration)
            .onStart(() =>{
                new TWEEN.Tween(camera.position)
                .to({
                    x: marker.cameraPositionX,
                    y: marker.cameraPositionY,
                    // y: camera.position.y,
                    z: marker.cameraPositionZ,
                }, params.animationDuration)
                .onStart(() => {
                    new TWEEN.Tween(currentTarget)
                    .to({
                        x: marker.targetx,
                        y: marker.targety,
                        z: marker.targetz
                    }, params.animationDuration)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onUpdate(() =>{
                        camera.lookAt(new THREE.Vector3(currentTarget.x, currentTarget.y, currentTarget.z));
                        controls.target.set(currentTarget.x, currentTarget.y, currentTarget.z)
                    })
                    .start()
                })
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
            })
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                console.log(currentFov.fov)
                camera.fov = currentFov.fov
                camera.updateProjectionMatrix();
            })
            .onComplete(() => {
                camera.fov = marker.fov
                camera.updateProjectionMatrix();
            })
            .start();
        })
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
            camera.quaternion.slerpQuaternions(startQuaternion, endQuaternion, time.t);
        })
        .onComplete(() => {
            camera.quaternion.set(endQuaternion);
            camera.lookAt(storedMarkerPosition);
            controls.target.set(marker.targetx, marker.targety, marker.targetz)
        })
        .start();
}

/**
 * Scene Setup Functions
 */
// Camera
function setupCamera(){
    const camera = new THREE.PerspectiveCamera(cameraSettings.fov, sizes.width / sizes.height, 0.1, 1000)
    camera.position.set(cameraSettings.cameraPositionX,cameraSettings.cameraPositionY,cameraSettings.cameraPositionZ)
    scene.add(camera)
    return camera
}

// Controls
function setupControls(){
    const controls = new OrbitControls(camera, canvas)
    controls.target.set(cameraSettings.targetx,cameraSettings.targety,cameraSettings.targetz)
    controls.enableDamping = true
    return controls
}
// Renderer
function setupRenderer(){
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas
    })
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    return renderer
}

/**
 * Setup Main Scene
 */
let camera, controls, renderer
function init(){
    camera = setupCamera()
    controls = setupControls()
    renderer = setupRenderer()
}

/**
 * Animation Loop Stuff
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    //Water
    water.material.uniforms[ 'time' ].value += 1.0 / oceanSettings.timeModifier;

    //Mixer
    if(mixer){mixer.update(deltaTime)}

    //Helper
    if(helper){ helper.position.set(params.helperx,params.helpery,params.helperz)}    

    //Raycasting from mouse pointer
    raycaster.setFromCamera(mouse, camera)
    const objectsToTest = [button1, button2, button3]
    const intersects = raycaster.intersectObjects(objectsToTest)

    if(intersects.length){
        // if(!currentIntersect){console.log('mouse enter')}
        currentIntersect = intersects[0]
    } else {
        // if(currentIntersect){console.log('mouse leave')}
        currentIntersect = null
    }
    for(const object of objectsToTest){
        object.material.color.set('#ff0000')
    }
    for(const intersect of intersects){
        intersect.object.material.color.set('#0000ff')
    }

    // Update controls
    controls.update()
    TWEEN.update();

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

init()
tick()