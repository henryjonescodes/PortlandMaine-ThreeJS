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

//Helper function for main file loading
function useLoader(url, loader) {
    return new Promise(resolve => {
        loader.load(url, resolve);
    });
}

function loadBakedTexture(url, loader) {
    const temp = loader.load(url)
    temp.flipY = false
    return temp
}

// function setUpBakedModel(url, textureUrl, promise){
//     const texture = loadBakedTexture(textureUrl, textureLoader)
//     const material = new THREE.MeshBasicMaterial({map: texture})
//     let object
//     promise = useLoader(url, gltfLoader).then(result => {
//         result.scene.traverse((child) => {child.material = material});
//         object = result.scene; 
//     })
//     return object
// }

/**
 * Constants
 */
const params = {
    helperx: 0,
    helpery: 2,
    helperz: 0,
    fov: 8,
}

const cameraSettings = {
    x: 79.39020840624255,
    y: 5.30854889867763,
    z: 44.76856193642261,
    fov: 8,
    targetx: 0,
    targety: 2,
    targetz: 0
}
const cameraSettings1 = {
    x: 10.09952891398274,
    y: 5.283287750839582,
    z: 0.6046661058867199,
    fov: 40,
    targetx: 9.2,
    targety: 1.8,
    targetz: 38
}

const oceanSettings = {
    oceanColor: 0x001e0f,
    oceanSunColor: 0xffffff,
    distortionScale: 2.5,
    timeModifier: 320
}

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

//Gui
var helperGUI = gui.addFolder("Cube Helper")
helperGUI.add(debugObject, 'placeHelper')
helperGUI.add(params, 'helperx').min(-100).max(100).step(0.001)
helperGUI.add(params, 'helpery').min(-100).max(100).step(0.001)
helperGUI.add(params, 'helperz').min(-100).max(100).step(0.001)

/**
 * Camera Setter Functions
 */
debugObject.setCameraPosition0 = () => {
    updateCameraSettings(cameraSettings)
}

debugObject.setCameraPosition1 = () => {
    updateCameraSettings(cameraSettings1)
}

debugObject.logCamera = () => {
    console.log("Camera Details")
    console.log(camera)
}

const setCamera = (x,y,z) => {
    camera.position.set(x,y,z)
}

//Gui
var cameraGUI = gui.addFolder("Camera")
cameraGUI.add(params, 'fov').min(0).max(120).step(0.001)
cameraGUI.add(debugObject, 'setCameraPosition0')
cameraGUI.add(debugObject, 'setCameraPosition1')
cameraGUI.add(debugObject, 'logCamera')

//Start Loading Stuff -----------------------------------------------------------------------------------------------------

/**
 * Load Materials
 */
//General
const matcapTexture = textureLoader.load('/textures/matcaps/1.png')
const textMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapTexture })
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
const DockBuilding_Building_Texture = loadBakedTexture('/textures/DockBuilding/DockBuilding_Building.png', textureLoader)
const DockBuilding_Buildings_Material = new THREE.MeshBasicMaterial({ map: DockBuilding_Building_Texture})

const DockBuilding_Surface_Texture = loadBakedTexture('/textures/DockBuilding/DockBuilding_Surface.png', textureLoader)
const DockBuilding_Surface_Material = new THREE.MeshBasicMaterial({ map: DockBuilding_Surface_Texture })

const DockBuilding_Pylons_Texture = loadBakedTexture('/textures/DockBuilding/DockBuilding_Pylons.png', textureLoader)
const DockBuilding_Pylons_Material = new THREE.MeshBasicMaterial({ map: DockBuilding_Pylons_Texture })

const DockBuilding_Deco_Texture = loadBakedTexture('/textures/DockBuilding/DockBuilding_Deco.png', textureLoader)
const DockBuilding_Deco_Material = new THREE.MeshBasicMaterial({ map: DockBuilding_Deco_Texture })

//Maine State Pier
const MaineStatePier_Building_Texture = loadBakedTexture('/textures/MaineStatePier/MaineStatePier_Building_8K.png', textureLoader)
const MaineStatePier_Building_Material = new THREE.MeshBasicMaterial({ map: MaineStatePier_Building_Texture})

const MaineStatePier_Surface_Texture = loadBakedTexture('/textures/MaineStatePier/MaineStatePier_Surface.png', textureLoader)
const MaineStatePier_Surface_Material = new THREE.MeshBasicMaterial({ map: MaineStatePier_Surface_Texture})

const MaineStatePier_Pylons_Texture = loadBakedTexture('/textures/MaineStatePier/MaineStatePier_Pylons.png', textureLoader)
const MaineStatePier_Pylons_Material = new THREE.MeshBasicMaterial({ map: MaineStatePier_Pylons_Texture})

const MaineStatePier_Deco_Texture = loadBakedTexture('/textures/MaineStatePier/MaineStatePier_Deco.png', textureLoader)
const MaineStatePier_Deco_Material = new THREE.MeshBasicMaterial({ map: MaineStatePier_Deco_Texture})

//Park
const Park_Surface_Texture = loadBakedTexture('/textures/Park/Park_Surface.png', textureLoader)
const Park_Surface_Material = new THREE.MeshBasicMaterial({ map: Park_Surface_Texture})

const Park_Foliage_Texture = loadBakedTexture('/textures/Park/Park_Foliage.png', textureLoader)
const Park_Foliage_Material = new THREE.MeshBasicMaterial({ map: Park_Foliage_Texture})

const Park_Deco_Texture = loadBakedTexture('/textures/Park/Park_Deco.png', textureLoader)
const Park_Deco_Material = new THREE.MeshBasicMaterial({ map: Park_Deco_Texture})

const Park_Rocks_Texture = loadBakedTexture('/textures/Park/Park_Rocks.png', textureLoader)
const Park_Rocks_Material = new THREE.MeshBasicMaterial({ map: Park_Rocks_Texture})

//Fort Gorges
const FortGorges_Texture = loadBakedTexture('/textures/FortGorges/FortGorges.png', textureLoader)
const FortGorges_Material = new THREE.MeshBasicMaterial({ map: FortGorges_Texture})

//Bug Light
const BugLight_Texture = loadBakedTexture('/textures/BugLight/BugLight.png', textureLoader)
const BugLight_Material = new THREE.MeshBasicMaterial({ map: BugLight_Texture})

/**
 * Load Models
 */
//Dock Building
let DockBuilding_Building, DockBuilding_Surface, DockBuilding_Pylons, DockBuilding_Deco
let DockBuilding_Building_Promise = useLoader('/models/DockBuilding/glTF-Draco/DockBuilding_Model_Building.glb', gltfLoader)
    .then(result => {
            result.scene.traverse((child) => {child.material = DockBuilding_Buildings_Material});
            DockBuilding_Building = result.scene; 
        })
let DockBuilding_Surface_Promise = useLoader('/models/DockBuilding/glTF-Draco/DockBuilding_Model_Surface.glb', gltfLoader)
    .then(result => {  
            result.scene.traverse((child) => {child.material = DockBuilding_Surface_Material});
            DockBuilding_Surface = result.scene; 
        })
let DockBuilding_Pylons_Promise = useLoader('/models/DockBuilding/glTF-Draco/DockBuilding_Model_Pylons.glb', gltfLoader)
    .then(result => {  
            result.scene.traverse((child) => {child.material = DockBuilding_Pylons_Material});    
            DockBuilding_Pylons = result.scene; 
        })      
let DockBuilding_Deco_Promise = useLoader('/models/DockBuilding/glTF-Draco/DockBuilding_Model_Deco.glb', gltfLoader)
    .then(result => {  
            result.scene.traverse((child) => {child.material = DockBuilding_Deco_Material});
            DockBuilding_Deco = result.scene; 
        })

//Maine State Pier
let MaineStatePier_Building, MaineStatePier_Surface, MaineStatePier_Pylons, MaineStatePier_Deco
let MaineStatePier_Building_Promise = useLoader('/models/MaineStatePier/glTF-Draco/MaineStatePier_Model_Building_8K.glb', gltfLoader)
    .then(result => {
            result.scene.traverse((child) => {child.material = MaineStatePier_Building_Material});
            MaineStatePier_Building = result.scene; 
        })
let MaineStatePier_Surface_Promise = useLoader('/models/MaineStatePier/glTF-Draco/MaineStatePier_Model_Surface.glb', gltfLoader)
    .then(result => {  
            result.scene.traverse((child) => {child.material = MaineStatePier_Surface_Material});
            MaineStatePier_Surface = result.scene; 
        })
let MaineStatePier_Pylons_Promise = useLoader('/models/MaineStatePier/glTF-Draco/MaineStatePier_Model_Pylons.glb', gltfLoader)
    .then(result => {  
            result.scene.traverse((child) => {child.material = MaineStatePier_Pylons_Material});    
            MaineStatePier_Pylons = result.scene; 
        })   
let MaineStatePier_Deco_Promise = useLoader('/models/MaineStatePier/glTF-Draco/MaineStatePier_Model_Deco.glb', gltfLoader)
    .then(result => {  
            result.scene.traverse((child) => {child.material = MaineStatePier_Deco_Material});
            MaineStatePier_Deco = result.scene; 
        })

//park
let Park_Surface, Park_Foliage, Park_Deco, Park_Rocks
let Park_Surface_Promise = useLoader('/models/Park/glTF-Draco/Park_Surface.glb', gltfLoader)
    .then(result => {
            result.scene.traverse((child) => {child.material = Park_Surface_Material});
            Park_Surface = result.scene; 
        })
let Park_Foliage_Promise = useLoader('/models/Park/glTF-Draco/Park_Foliage.glb', gltfLoader)
    .then(result => {  
            result.scene.traverse((child) => {child.material = Park_Foliage_Material});
            Park_Foliage = result.scene; 
        })
let Park_Deco_Promise = useLoader('/models/Park/glTF-Draco/Park_Deco.glb', gltfLoader)
    .then(result => {  
            result.scene.traverse((child) => {child.material = Park_Deco_Material});    
            Park_Deco = result.scene; 
        })       
let Park_Rocks_Promise = useLoader('/models/Park/glTF-Draco/Park_Rocks.glb', gltfLoader)
    .then(result => {  
            result.scene.traverse((child) => {child.material = Park_Rocks_Material});
            Park_Rocks = result.scene; 
        })

//Fort Gorges
let FortGorges
let FortGorges_Promise = useLoader('/models/FortGorges/glTF-Draco/FortGorges.glb', gltfLoader)
    .then(result => {  
            result.scene.traverse((child) => {child.material = FortGorges_Material});
            FortGorges = result.scene; 
        })

//Bug Light
let BugLight
let BugLight_Promise = useLoader('/models/BugLight/glTF-Draco/BugLight.glb', gltfLoader)
    .then(result => {  
            result.scene.traverse((child) => {child.material = BugLight_Material});
            BugLight = result.scene; 
        })


/**
 * Load Fonts
 */
let helvetica
let fontLoadPromise = useLoader('/fonts/helvetiker_regular.typeface.json',fontLoader).then(result => { helvetica = result })

//End Loading Hell -----------------------------------------------------------------------------------------------------

/**
 * Handle Loaded Data
 */
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

//gui
const oceanFolder = gui.addFolder("Ocean")
oceanFolder.add(oceanSettings, 'timeModifier').min(0).max(500).step(1)

//Text objects
let greetingText, cityText, cityText1, overViewText
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

//Imported Models
Promise.all([
        DockBuilding_Building_Promise,
        DockBuilding_Surface_Promise,
        DockBuilding_Pylons_Promise,
        DockBuilding_Deco_Promise,
        MaineStatePier_Building_Promise,
        MaineStatePier_Surface_Promise,
        MaineStatePier_Pylons_Promise,
        MaineStatePier_Deco_Promise,
        FortGorges_Promise,
        BugLight_Promise,
        fontLoadPromise,
        Park_Surface_Promise,
        Park_Foliage_Promise,
        Park_Deco_Promise,
        Park_Rocks_Promise
    ]).then(() => {
        //Set Scalce
        DockBuilding_Building.scale.set(0.5, 0.5, 0.5)
        DockBuilding_Surface.scale.set(0.5, 0.5, 0.5)
        DockBuilding_Pylons.scale.set(0.5, 0.5, 0.5)
        DockBuilding_Deco.scale.set(0.5, 0.5, 0.5)
        MaineStatePier_Building.scale.set(0.5, 0.5, 0.5)
        MaineStatePier_Surface.scale.set(0.5, 0.5, 0.5)
        MaineStatePier_Pylons.scale.set(0.5, 0.5, 0.5)
        MaineStatePier_Deco.scale.set(0.5, 0.5, 0.5)
        FortGorges.scale.set(0.5, 0.5, 0.5)
        BugLight.scale.set(0.5, 0.5, 0.5)
        Park_Surface.scale.set(0.5, 0.5, 0.5)
        Park_Foliage.scale.set(0.5, 0.5, 0.5)
        Park_Deco.scale.set(0.5, 0.5, 0.5)
        Park_Rocks.scale.set(0.5, 0.5, 0.5)

        //add model to the scene
        scene.add(DockBuilding_Building)
        scene.add(DockBuilding_Surface)
        scene.add(DockBuilding_Pylons)
        scene.add(DockBuilding_Deco)
        scene.add(MaineStatePier_Building)
        scene.add(MaineStatePier_Surface)
        scene.add(MaineStatePier_Pylons)
        scene.add(MaineStatePier_Deco)
        scene.add(FortGorges)
        scene.add(BugLight)
        scene.add(Park_Surface)
        scene.add(Park_Foliage)
        scene.add(Park_Deco)
        scene.add(Park_Rocks)
        
        //Log Objects
        console.log("promises kept")
        console.log(scene)
        
        //Generate Text and add to scene
        
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
/**
 * Non Loaded Objects
 */
//Floor
// const floor = new THREE.Mesh(
//     new THREE.PlaneGeometry(1000, 1000),
//     new THREE.MeshStandardMaterial({
//         color: '#444444',
//         metalness: 0,
//         roughness: 0.5
//     })
// )
// floor.receiveShadow = true
// floor.rotation.x = - Math.PI * 0.5
// scene.add(floor)

//3d Buttons
const buttonMaterial = new THREE.MeshBasicMaterial({ color: '#ff0000' })
const buttonGeometry = new THREE.SphereGeometry(0.5, 16, 16)

const button1 = new THREE.Mesh(buttonGeometry,buttonMaterial)
button1.position.set(10.7,1.8,6.2)
scene.add(button1)

const button2 = new THREE.Mesh(buttonGeometry,buttonMaterial)
button2.position.set(9.5,2,26)
scene.add(button2)

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
                updateCameraSettings(cameraSettings1)
                break
            case button2:
                console.log('Button2')
                updateCameraSettings(cameraSettings)
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

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(params.fov, sizes.width / sizes.height, 0.1, 1000)
camera.position.set(
    cameraSettings.x,
    cameraSettings.y,
    cameraSettings.z
)

scene.add(camera)

function updateCameraSettings(settings){
    camera.position.set(
        settings.x,
        settings.y,
        settings.z
    )
    camera.lookAt(new THREE.Vector3(
            settings.targetx,
            settings.targety,
            settings.targetz
        ))
    controls.target.set(
            settings.targetx,
            settings.targety,
            settings.targetz
        )
    params.fov = settings.fov
}

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0,2,0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

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
    if(mixer)
    {
        mixer.update(deltaTime)
    }

    //Helper
    if(helper){
        helper.position.set(
            params.helperx,
            params.helpery,
            params.helperz
        )
    }    

    // Update camera
    camera.fov = params.fov
    camera.updateProjectionMatrix();

    //Raycasting from mouse pointer
    raycaster.setFromCamera(mouse, camera)

    const objectsToTest = [button1, button2]
    const intersects = raycaster.intersectObjects(objectsToTest)

    if(intersects.length)
    {
        if(!currentIntersect)
        {
            console.log('mouse enter')
        }

        currentIntersect = intersects[0]
    }
    else
    {
        if(currentIntersect)
        {
            console.log('mouse leave')
        }

        currentIntersect = null
    }

    for(const object of objectsToTest)
    {
        object.material.color.set('#ff0000')
    }
    for(const intersect of intersects)
    {
        intersect.object.material.color.set('#0000ff')
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()