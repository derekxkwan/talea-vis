
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
let allCones = [];
let conRotDim = [];


let loader = new STLLoader();
loader.load('./res/cutupcyl.stl', function (geom) {
    //geom.computeVertexNormals();
    for(let i=0; i < colorArray.length; i++) {
        let curAngle = Math.PI*2*i/colorArray.length;
        let relCoords = cylToCart(totalRad*bridgeRadMult, curAngle, cylZOff);
        let curCoords = [center[0] + relCoords[0], center[1] + relCoords[1], center[2] + relCoords[2]];
        let curColor = colorArray[i][0];
        let curOp = 1;
        let curTp = false;
        let curMat = new THREE.MeshPhongMaterial( {color: curColor, opacity: curOp, transparent: curTp, wireframe: false});
        //let curMat = new THREE.MeshBasicMaterial( {color: curColor, opacity: curOp, transparent: curTp, wireframe: false        });
        let curMesh = new THREE.Mesh(geom, curMat);
        curMesh.position.x = curCoords[0];
        curMesh.position.y = curCoords[1];
        curMesh.position.z = curCoords[2];
        curMesh.rotation.z = Math.PI*2 * Math.random();
        curMesh.scale.x = cylScale;
        curMesh.scale.y = cylScale;
        curMesh.scale.z = cylScale;
        scene.add(curMesh);
    };
    
        renderConeLayers();

});






  render();



//========================================================

//curCenter = [x,y,z]
function coneCloudLayer(curColor, curOp, curTp, num, curCenter, curRad, zRand, minSz, curRange, organized) {
    let curEmis = 1.0,curShine = 100;
    let curMat = new THREE.MeshPhongMaterial( {color: curColor, opacity: curOp, transparent: curTp, wireframe: false});
    let cones = [];
    let curHRng = 1;
    if(organized == false) {
        for(let i=0; i < num; i++) {
            //let curSize = (Math.random() * curRange) + coneSize;
            //let curHeight = (Math.random() * curHRng) + coneHt;
            let curSize = (Math.random() * curRange) + minSz + (curRange);
            //let curGeom = new THREE.TetrahedronGeometry(coneSize);
            let curGeom = new THREE.SphereGeometry(curSize, 3,2);
            let mesh = new THREE.Mesh(curGeom, curMat);
            mesh.position.x = (Math.random()*2*curRad) + curCenter[0] - curRad;
            mesh.position.y = (Math.random()*2*curRad) + curCenter[1] - curRad;
            mesh.position.z = (Math.random()*2*zRand) + curCenter[2] - zRand;
            mesh.rotation.x = (Math.random() * 2 * Math.PI);
            mesh.rotation.y = (Math.random() * 2 * Math.PI);
            mesh.rotation.z = (Math.random() * 2 * Math.PI);
            cones.push(mesh);
            allCones.push(mesh);
            let curRotDim = Array.from({length: 3}, () => Math.random());
            conRotDim.push(curRotDim);
            scene.add(mesh);
        };
    }
    else {
         for(let i=0; i < num; i++) {
            let curSize = (Math.random() * curRange) + coneSize;
            //let curHeight = (Math.random() * curHRng) + coneHt;
            let curGeom = new THREE.TetrahedronGeometry(coneSize);
            let mesh = new THREE.Mesh(curGeom, curMat);
            mesh.position.x = (Math.random()*2*curRad) + curCenter[0] - curRad;
            mesh.position.y = (Math.random()*2*curRad) + curCenter[1] - curRad;
            mesh.position.z = (Math.random()*2*zRand) + curCenter[2] - zRand;
            //mesh.rotation.x = (Math.random() * 2 * Math.PI);
            //mesh.rotation.y = (Math.random() * 2 * Math.PI);
            //mesh.rotation.z = (Math.random() * 2 * Math.PI);
            cones.push(mesh);
            //allCones.push(mesh);
            let curRotDim = Array.from({length: 3}, () => Math.random());
            conRotDim.push(curRotDim);
            scene.add(mesh);
        };
    };
    return cones;

}

function renderConeLayers() {
    for(let idx =0; idx < bridge["total_len"]*bridgeLenMult; idx++) {
        let i = Math.round(idx/bridgeLenMult);
    //for(let i =0; i < 1; i++) {
        let groupRad = 0;
        let curRad = totalRad*bridgeRadMult;
        let curZ = idx;
        let curOp = 1;
        let curTp = true;
        let minSz = 1;
        let szRng = 0.95;
        let colorOverride = false;
        let organized = false;
        let curNum = 3;
        if(i < bridge["len"][1]) {
            groupRad = (totalRad - i)*bridgeRadMult;
            minSz = minSz*(Math.pow(i/(bridge["len"][1] - 1),0.5));
            szRng = szRng*(Math.pow(i/(bridge["len"][1] - 1),0.5));
            curRad = (i+1)*bridgeRadMult;
            curNum = Math.round((totalRad -1)*bridgeNumMult);
        };
        if (i >= totalRad && i < totalRad + bridge["len"][2]) {
            let curIdx = i - totalRad;
            let curLen = bridge["len"][2];
            curOp = (curLen - curIdx)/curLen;
            curTp = true;
            organized = true;
        }
        else if (i >= totalRad + bridge["len"][2]) {
            let curIdx = i - (totalRad + bridge["len"][2]);
            let curLen = bridge["len"][3];
            curOp = curIdx/curLen;
            curTp = true;
            colorOverride = true;
            organized = true;

        };
        for(let j=0; j < colorArray.length; j++) {
            let curColor = colorArray[j][0];
            let relCenter = cylToCart(groupRad, j*Math.PI*2/colorArray.length, curZ);
            let curCenter = Array.from(relCenter, (e,i) => center[i] + relCenter[i]);
            if(colorOverride == true) {
                curColor = 0x0000ff;
            };
            //console.log(relCenter);
            //console.log(i,j, curNum);
           coneCloudLayer(curColor, curOp, curTp, curNum, curCenter, curRad, 10, minSz, szRng, organized);
        };
    };
}

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
    allCones.forEach((c,i)=> {
        let curRotDim = conRotDim[i];
        c.rotation.x += Math.PI* curRotDim[0] * bridgeRotMult;
        c.rotation.y += Math.PI* curRotDim[1] * bridgeRotMult;
        c.rotation.z += Math.PI* curRotDim[2] * bridgeRotMult;
    });
}
function render() {
    animate();
    requestAnimationFrame(render);
    controls.update();
    renderer.render(scene, camera);
};

//--------------------------------------------------------

