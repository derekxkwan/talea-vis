
//import * as THREE from "../../lib/three.min.js";
//import {OBJLoader} from "../../lib/OBJLoader.js";
import * as THREE from "./build/three.module.js";
import {OrbitControls} from "./lib/OrbitControls.js";

let bg = 0x00263f;
let qual = 5;
let radSeg = 10;
let rad = 15;
let lenMult = 3;
const renderer = getRenderer();
let scene = getScene();
let camera = getCamera();
let light = getLight(scene);
let wireframeMat = new THREE.LineBasicMaterial( { color: 0xffffff } );
let controls = initControls(camera);
//let controls = getControls(camera, renderer);

let colorArray = {"a": {"val": 0xcccccc}, "b": {"val": 0x339acf}, "s": {"val": 0x3322fc}};

let i = 0;
for(let k in colorArray) {
    let curColor = colorArray[k]["val"];
    colorArray[k]["idx"] = i++;
    colorArray[k]["mat"] = new THREE.MeshLambertMaterial( {color: curColor, opacity: 1, wireframe: false, transparent: false});
};

let matArray = Object.keys(colorArray).map((k) => colorArray[k]["mat"]);
let mesh = makeSpiral(data1); 
  render();



//========================================================
function makeSpiral(curDict) {
    let totLen = curDict["total_len"];
    let adjLen = totLen * lenMult;
    //let curve = makeConicalSpiral(201,5,cur_len,5);
    let curve = makeConchospiral(1.065,1.0, 1.1, adjLen);
    let geom = new THREE.TubeBufferGeometry(curve, adjLen * qual, rad, radSeg, false);
    geom.clearGroups();

    let stepSize = qual*radSeg*3*lenMult; // because triangles i guess?
   
    /*
    for(let i = 0; i < (qual*radSeg*adjLen*3); i += stepSize) {
        let idx = Math.floor(i/stepSize);
        geom.addGroup(i, stepSize, idx % colorArray.length);
    };
    */
    /*
     * old forwards way
    curDict["data"].forEach((curSec, i) => {
        let curLen = curSec["qtr_len"];
        let curIdx = curSec["qtr_index"];
        let sprLen = getSpiralLen(curLen);
        let sprIdx = getSpiralIdx(curIdx);
        let curSubdiv = curSec["elt_subdiv"];
        let curSubdivLen = Math.round(stepSize/curSubdiv);
        let runIdx = sprIdx;
        let eltLen = curSec["elts"].length;
        //console.log(curIdx, curSubdivLen);
        curSec["elts"].forEach((elt, j) => {
            let curSublen = elt["len"];
            let curLen2 = curSublen * curSubdivLen;
            //let curSubidx = elt["subidx"];
            let curType = elt["type"];
            let curMat = colorArray[curType]["idx"];
            //let curDir = elt["dir"];
            if(j == (eltLen - 1)) curLen2 = (sprIdx + sprLen) - runIdx;
            console.log(curMat, curLen2);
            geom.addGroup(runIdx, curLen2, curMat);
            runIdx += curLen2;
        });
    });
    */
    // need to go backwards!
    //
     curDict["data"].forEach((curSec, i) => {
        let curLen = curSec["qtr_len"];
        let curIdx = curSec["qtr_index"];
        let adjIdx = totLen - curIdx;
        let sprLen = getSpiralLen(curLen);
        let sprIdx = getSpiralIdx(adjIdx);
        let curSubdiv = curSec["elt_subdiv"];
        let curSubdivLen = Math.round(stepSize/curSubdiv);
        let runIdx = sprIdx;
        let eltLen = curSec["elts"].length;
        //console.log("newsec", totLen, curIdx, sprIdx, curSubdivLen);
        curSec["elts"].forEach((elt, j) => {
            let curSublen = elt["len"];
            if(curSublen > 0) {
                let curLen2 = curSublen * curSubdivLen;
                let curIdx = runIdx - curLen2;
                //let curSubidx = elt["subidx"];
                let curType = elt["type"];
                let curMat = colorArray[curType]["idx"];
                //let curDir = elt["dir"];
                if(j == (eltLen - 1)) {
                    curIdx = sprIdx - sprLen;
                    curLen2 = runIdx - curIdx;
                };
                //console.log("qtrsec", curIdx, curLen2, curMat);
                geom.addGroup(curIdx, curLen2, curMat);
                runIdx = curIdx;
            };
        });
    });

    let mesh = new THREE.Mesh(geom, matArray);
    scene.add(mesh);
    return mesh;
}

function getSpiralLen(len) {
    return (qual*radSeg*3*lenMult * len);
}

function getSpiralIdx(idx) {
    return (qual * radSeg * 3 * lenMult * idx);
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
    var camera = new THREE.PerspectiveCamera(50, aspectRatio, 0.1, 10000);
    //camera.position.set(0, 1, -10);
      //camera.position.set(0, 0, 50);
      camera.position.set(0,50,500);

    return camera;
  }

  function getLight(scene) {
    var light = new THREE.PointLight(0xffffff, 0.5, -100);
    //light.position.set(1, 1,1);
    scene.add(light);

    var ambientLight = new THREE.AmbientLight(0xffffff);
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

function makeConchospiral(mu, a, c, num) {

       let cur_arr = Array.from({length: num}, (x,i) => 
            new THREE.Vector3(... cylToCart(Math.pow(mu, i/10) * a, i/10, Math.pow(mu, i/10) * c))
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

