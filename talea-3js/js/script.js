
//import * as THREE from "../../lib/three.min.js";
//import {OBJLoader} from "../../lib/OBJLoader.js";
import * as THREE from "../build/three.module.js";
import {OrbitControls} from "../lib/OrbitControls.js";

let qual = 32;
let radSeg = 5;
let rad = 30;
const renderer = getRenderer();
let scene = getScene();
let camera = getCamera();
let light = getLight(scene);
let wireframeMat = new THREE.LineBasicMaterial( { color: 0xffffff } );
let controls = initControls(camera);
//let controls = getControls(camera, renderer);

let colorArray = [0xcccccc, 0x99448f, 0x9944f8]; 
let matArray = Array.from({length: colorArray.length}, (x,i) => new THREE.MeshLambertMaterial( {color: colorArray[i], opacity: 1, wireframe: false, transparent: false}));

  render();



//========================================================
function makeSpiral(cur_dict) {
    let cur_len = cur_dict["total_len"];
    let curve = makeConicalSpiral(201,5,cur_len,5);
    let geom = new THREE.TubeBufferGeometry(curve, cur_len * qual, rad, radSeg, false);
    geom.clearGroups();
    let stepSize = qual*radSeg*3; // because triangles i guess?

    for(let curSeg in cur_dict["data"]) {

    }

    for(let i = 0; i < (qual*radSeg*cur_len*3); i += stepSize) {
        let idx = Math.floor(i/stepSize);
        geom.addGroup(i, stepSize, idx % colorArray.length);
    };

    let mesh = new THREE.Mesh(geom, matArray);
    scene.add(mesh);
    return mesh;
}

function initControls(camera) {
    let curCtrls = new OrbitControls(camera, renderer.domElement);
    //curCtrls.addEventListener('change', render);
    curCtrls.target.set(0,20,100);
    //curCtrls.minDistance = 10;
    //curCtrls.maxDistance = 100;
    curCtrls.update();
    return curCtrls;
}   

function getScene() {
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdaf1ff);
    return scene;
  }

  function getCamera() {
    var aspectRatio = window.innerWidth / window.innerHeight;
    var camera = new THREE.PerspectiveCamera(50, aspectRatio, 0.1, 10000);
//    camera.position.set(0, 1, -10);
      //camera.position.set(0, 0, 50);
      camera.position.set(0,50,500);

    return camera;
  }

  function getLight(scene) {
    var light = new THREE.PointLight(0xffffff, 0.5, -100);
    //light.position.set(1, 1,1);
    scene.add(light);

    var ambientLight = new THREE.AmbientLight(0xcccccc);
    scene.add(ambientLight);
    return light;
  }

  function getRenderer() {
    var renderer = new THREE.WebGLRenderer({canvas: cnv, antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    //document.body.appendChild(renderer.domElement);
    return renderer;
  }

  function getControls(camera, renderer) {
    var controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.zoomSpeed = 0.4;
    controls.panSpeed = 0.4;
    return controls;
  }

  function cylToCart(radius, theta, z) {
    return [radius * Math.cos(theta), radius * Math.sin(theta), z];
  } 

  function makeConicalSpiral(freq, radius, num, htscale) {

       let cur_arr = Array.from({length: num}, (x,i) => 
            new THREE.Vector3(i * radius * Math.cos(freq * i) , i * radius * Math.sin(freq * i), i*htscale)
    );

      let curve = new THREE.CatmullRomCurve3(cur_arr);
      return curve;
      } 
   
  /**
  * Render!
  **/

  function render() {
    requestAnimationFrame(render);
    controls.update();
    renderer.render(scene, camera);
  };

//--------------------------------------------------------

