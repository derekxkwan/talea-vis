
//import * as THREE from "../../lib/three.min.js";
//import {OBJLoader} from "../../lib/OBJLoader.js";
import * as THREE from "./build/three.module.js";
import {OrbitControls} from "./lib/OrbitControls.js";
import { PLYLoader } from './lib/PLYLoader.js';
import { STLLoader } from './lib/STLLoader.js';
//import { OBJLoader } from './lib/OBJLoader.js';
let discPaths = ['res/disc0.0.png', 'res/disc0.125.png', 'res/disc0.25.png', 'res/disc0.375.png', 'res/disc0.5.png', 'res/disc0.625.png', 'res/disc0.75.png', 'res/disc0.875.png', 'res/disc1.0.png'];
let bridge = datab["data"];
let bridgeRadMult = 1;
let bridgeRotMult = 0.025;
let coneSize = 4;
let totalRad = bridge["len"][0] + bridge["len"][1];
let center = [0,0,0];
let cylZOff = -10;
let spiralZpos = 0, zOff = 0, overallScale = 1, lenMult = 1;
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
let bridgeCyl = [];
let bridgeRot = [];
let bridgeRotScale = 0.005;
let thickMult = 1;
let distMult = 3;


    makeDiscs(zOff, thickMult, distMult);
  render();
//console.log(rot);
/*
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
*/
//========================================================


//provide mat
function discMaker2(curRad, height, curQual, zPos, curMat, txrRptTimes, rotAmt, curOp) {

    let geom = new THREE.CylinderGeometry(curRad, curRad, height, curQual, 1, true);
    let mesh = new THREE.Mesh(geom, curMat);
    mesh.rotation.x += Math.PI*0.5;
    mesh.position.z = zPos;
    scene.add(mesh);
    mesh.dataName = "bridge";
    bridgeCyl.push(mesh);
    bridgeRot.push(rotAmt);

}


function discMaker(curRad, height, curQual, zPos, img, txrRptTimes, rotAmt, curOp) {

    let curTxr = new THREE.CanvasTexture(img);
    let curTp = curOp < 1;
    curTxr.wrapS = THREE.RepeatWrapping;
    curTxr.repeat.x = txrRptTimes;
    let mat = new THREE.MeshPhongMaterial({color:0xffffff, reflectivity: 0.1, shininess: 100, map: curTxr, transparent: curTp, opacity: curOp});
    mat.side = THREE.DoubleSide;
    let geom = new THREE.CylinderGeometry(curRad, curRad, height, curQual, 1, true);
    let mesh = new THREE.Mesh(geom, mat);
    mesh.rotation.x += Math.PI*0.5;
    mesh.position.z = zPos;
    scene.add(mesh);
    mesh.dataName = "bridge";
    bridgeCyl.push(mesh);
    bridgeRot.push(rotAmt);

}

//curZ, curRpt, curRot
function mergeStageCoords(texidx, numidx, splitStage, mergeStage, thickMult, distMult, disc2Off, disc2rotMult) {
    let curZ = ((splitStage+((texidx-1)*thickMult)+disc2Off)*distMult)+(numidx*thickMult);
    let curRpt = (((texidx-1)*distMult) + numidx)/(mergeStage*4) + 1;
    let curRot = disc2rotMult*Math.PI*2.0*((texidx-1)*distMult+numidx+1)/(mergeStage*distMult*2);
    //let curRot = 0;
    return [curZ, curRpt, curRot];
}


function bridgeAnim() {
    for(let i=0; i < bridgeCyl.length; i++) {
        let curRot = bridgeRot[i];
        let curCyl = bridgeCyl[i];
             curCyl.rotation.y += (curRot * bridgeRotScale);
    };

}


//64: 14(five colors) 11(merging) 18(merged -> transparent) 21(transparent to blue)
function makeDiscs(bridgeZOff, thickMult, distMult) {
        let disc2Off = 0;
        let disc3Off = 0;
        let disc4Off = 0;
        let curQual = 20;
        let curRad = 30*thickMult;
        let tpPow = 3;
        let curDir = -1;
        let disc2rotMult = 0.75;
        let disc3rotMult = 0.75;
        let splitStage = datab["data"]["len"][0];
        let mergeStage = datab["data"]["len"][1];
        let fadeStage = datab["data"]["len"][2];
        let blueStage = datab["data"]["len"][3];
        let discLoader = new THREE.ImageLoader();
        let idxMultStart = 1;
        let idxMultEnd = 4;
        distMult *= thickMult;
        disc2Off *= thickMult;
        disc3Off *= thickMult;
    for(let i=0; i < discPaths.length; i++) {
        discLoader.setCrossOrigin('*').load( discPaths[i],
        function (img) {
            //let rotAmt = (Math.random()*2.0)-1.0;
            if(i == 0) {
                //let rotAmt = (Math.random()*2.0)-1.0;
                let idx = 1;
                let curTxr = new THREE.CanvasTexture(img);
                curTxr.wrapS = THREE.RepeatWrapping;
                curTxr.repeat.x = 1;
                let mat = new THREE.MeshPhongMaterial({color:0xffffff, reflectivity: 0.1, shininess: 100, map: curTxr});
                mat.side = THREE.DoubleSide;
                let j = 0;
                //let rotAmt = 0;
                let rotAmt = disc2rotMult*Math.PI*2.0*((idx-1)*distMult+j+1)/(mergeStage*distMult*2);
                //let rotAmt = disc2rotMult*Math.PI*2.0*((idx-1)*distMult+j)/(mergeStage*distMult*2);
                for(let j=0; j < splitStage*distMult; j++) {
                    //let rotAmt = Math.PI*(i*distMult+j)/(splitStage*distMult);
                    discMaker2(curRad, thickMult, curQual, bridgeZOff+(curDir*j*thickMult), mat, 1, rotAmt, 1);
                };
            }
            else {
               if (i <=7) {
                   let idxMult = 1;
                   if(i >= idxMultStart && i < idxMultEnd) {
                        idxMult = 2;
                   };
                    for(let j=0; j < 1*distMult*idxMult; j++) {
                        let curCoords = mergeStageCoords(i,j, splitStage, mergeStage, thickMult, distMult, disc2Off, disc2rotMult);
                        let curZ = curCoords[0]*curDir;
                        let curRpt = curCoords[1];
                        let curRot = curCoords[2];
                        discMaker(curRad, thickMult, curQual, curZ+bridgeZOff, img, curRpt, curRot,1);
                        //console.log(curRot, curRpt, "merge");
                    };
                }
                else {
                    for(let j=0; j < (mergeStage-(7 + (idxMultEnd - idxMultStart)))*distMult; j++) {
                        let curCoords = mergeStageCoords(i,j, splitStage, mergeStage, thickMult, distMult, disc2Off, disc2rotMult);
                        let curZ = curCoords[0]*curDir;
                        let curRpt = curCoords[1];
                        let curRot = curCoords[2];
                        discMaker(curRad, thickMult, curQual, curZ+bridgeZOff, img, curRpt, curRot,1);
                        //console.log(curRot, curRpt, "merge");
                    };
                    for(let j=0; j < fadeStage*distMult; j++) {
                        let curZ = (((splitStage+mergeStage-3)*thickMult+disc3Off)*distMult) + (j*thickMult);
                        //let curRpt = (i+mergeStage-3)*distMult;
                        let curRpt = (((i-1)*distMult) + (mergeStage-(7 + (idxMultEnd - idxMultStart))*distMult + j))/(mergeStage*4) + 1;
                        let curIterRev = (fadeStage*distMult-j)/(fadeStage*distMult);
                        //let curRot = disc3rotMult*Math.PI*2.0*curIterRev;
                        let curRot = disc2rotMult*Math.PI*2.0*((i-1)*distMult+(mergeStage-(7+(idxMultEnd-idxMultStart)))*distMult+j+1)/(mergeStage*distMult*2);
                        let curOp = Math.pow(curIterRev,tpPow);
                        discMaker(curRad, thickMult, curQual, (curDir*curZ)+bridgeZOff, img, curRpt, curRot,curOp);
                        //console.log(curRot, curRpt, curOp);

                    };
                };
            };
            });

        for(let j=0; j < blueStage*distMult; j++) {
            let curZ = (((splitStage+mergeStage+fadeStage-3)*thickMult+disc4Off)*distMult) + (j*thickMult);
            let curOp = Math.pow(j/(blueStage*distMult-1),tpPow);
            let geom = new THREE.CylinderGeometry(curRad, curRad, thickMult, curQual, 1, true);
            let curColor = colorArray[0][0];
            let mat = new THREE.MeshPhongMaterial({color:curColor, reflectivity: 0.1, shininess: 100, transparent: true, opacity: curOp});
            let mesh = new THREE.Mesh(geom, mat);
            let rotAmt = 0;
            mat.side = THREE.DoubleSide;
            mesh.rotation.x += Math.PI*0.5;
            mesh.position.z = (curDir*curZ)+bridgeZOff;
            scene.add(mesh);
            mesh.dataName = "bridge";
            bridgeCyl.push(mesh);
            bridgeRot.push(rotAmt);

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
      camera.position.set(100,50,100);

    return camera;
  }

  function getLight(scene) {
   let light = new THREE.PointLight(0xf0f0f0, 1, 0, 1);
    light.position.set(0, 0,spiralZpos + zOff+ (3000*overallScale*lenMult));
    scene.add(light);
    
    let light2 = new THREE.PointLight(0xf0f0f0, 1, 0, 1);
    light2.position.set(0, 0,zOff-1*(spiralZpos + (3000*overallScale*lenMult)));
    scene.add(light2);

    let light3 = new THREE.PointLight(0xf0f0f0, 1, 0, 1);
    light3.position.set(5000, 0,spiralZpos + zOff+ (3000*overallScale*lenMult));
    scene.add(light3);
    
    let light4 = new THREE.PointLight(0xf0f0f0, 1, 0, 1);
    light4.position.set(-5000, 0,spiralZpos + zOff+ (3000*overallScale*lenMult));
    scene.add(light4);

    let light5 = new THREE.PointLight(0xf0f0f0, 1, 0, 1);
    light5.position.set(0,5000,spiralZpos + zOff+ (3000*overallScale*lenMult));
    scene.add(light5);
    
    let light6 = new THREE.PointLight(0xf0f0f0, 1, 0, 1);
    light6.position.set(0,-5000,spiralZpos + zOff+ (3000*overallScale*lenMult));
    scene.add(light6);

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
    bridgeAnim();
    }
function render() {
    animate();
    requestAnimationFrame(render);
    controls.update();
    renderer.render(scene, camera);
};

//--------------------------------------------------------

