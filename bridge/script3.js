
//import * as THREE from "../../lib/three.min.js";
//import {OBJLoader} from "../../lib/OBJLoader.js";
import * as THREE from "./build/three.module.js";
import {OrbitControls} from "./lib/OrbitControls.js";
import { PLYLoader } from './lib/PLYLoader.js';
import { STLLoader } from './lib/STLLoader.js';
//import { OBJLoader } from './lib/OBJLoader.js';
let bridge = datab["data"];
let bridgeRadMult = 1;
let bridgeRotMult = 0.025;
let coneSize = 4;
let totalRad = bridge["len"][0] + bridge["len"][1];
let center = [0,0,0];
let cylZOff = -10;
let cylScale = 7;
let rotScale = 0.1;
let bridgeLenMult = 2;
let bridgeNumMult = (1/14);
let colorArray = [[0x001DFF, 0x8492FF],
                [0xFE0218, 0xFD8893, 0xCC0202],
                [0x00c354, 0x66c38e, 0x017031, 0x447559],
                [0xff9500, 0xffcd86, 0xdd8100, 0xdcb276, 0x995a00],
                [0x03F1FE, 0xC1FCFF, 0x00B5C0, 0xA4D4D7, 0x00565B, 0xA6A6A6]
                ];

let bg = 0xffffff;
const renderer = getRenderer();
let scene = getScene();
let camera = getCamera();
let light = getLight(scene);
let controls = initControls(camera);
let cyl = [];
let rot = [];





  render();

for(let subdiv = 1; subdiv <= 10; subdiv++){
    let n  = 5;
    let subdivMult = 1;
    let curArr = [];
    let rotAmt = (Math.random()*2.0)-1.0;
    rot.push(rotAmt);
    for(let i = 0;  i  < (n * subdiv * subdivMult); i++) {
        let curLen = (Math.PI*2.0)/(n*subdiv * subdivMult);
        let curRot = (Math.PI*2.0) * (i/n)/(subdiv * subdivMult);
        let curRad = 5;
        //let curCoords = cylToCart(curRad*2, curRot, 0);
        let curColor = colorArray[i % n][0];
        let geom = new THREE.CylinderGeometry(curRad, curRad, 1, 5, 1, false, curRot, curLen);
        let mat = new THREE.MeshPhongMaterial( {color: curColor});
        let mesh = new THREE.Mesh(geom, mat);
        curArr.push(mesh);
        mesh.position.y = (subdiv*2);
        scene.add(mesh);
    };
    cyl.push(curArr);
};
//========================================================

function initControls(camera) {
    let curCtrls = new OrbitControls(camera, renderer.domElement);
    //curCtrls.addEventListener('change', render);
    //curCtrls.target.set(0,20,100);
    curCtrls.target.set(0,0, 0);
    //curCtrls.minDistance = 10;
    //curCtrls.maxDistance = 100;
    curCtrls.update();
    return curCtrls;
}  

function getScene() {
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(bg);
    return scene;
  }

  function getCamera() {
    var aspectRatio = window.innerWidth / window.innerHeight;
    var camera = new THREE.PerspectiveCamera(50, aspectRatio, 0.1, 90000);
    //camera.position.set(0, 1, -10);
      //camera.position.set(0, 0, 50);
      camera.position.set(0,50,100);

    return camera;
  }

  function getLight(scene) {
    let light = new THREE.PointLight(0xf0f0f0, 1, 0, 1.5);
    light.position.set(0, 0,1000);
    //light.position.set(0, 0,0);
    scene.add(light);
    
    let light2 = new THREE.PointLight(0xf0f0f0, 1, 0, 1.5);
    light2.position.set(0, 0,-1000);
    //light2.position.set(0, 0,0);
    scene.add(light2);

    let ambientLight = new THREE.AmbientLight(0x101010);
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

  /**
  * Render!
  **/

function animate()
{
    for(let i=0; i < cyl.length; i++) {
        let curRot = rot[i];
        for(let j=0; j<cyl[i].length; j++) {
            let curCyl = cyl[i][j];
             curCyl.rotation.y += (curRot * rotScale);
        };
    };
}
function render() {
    animate();
    requestAnimationFrame(render);
    controls.update();
    renderer.render(scene, camera);
};

//--------------------------------------------------------

