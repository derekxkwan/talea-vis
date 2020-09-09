
//import * as THREE from "../../lib/three.min.js";
//import {OBJLoader} from "../../lib/OBJLoader.js";
import * as THREE from "./build/three.module.js";
import {OrbitControls} from "./lib/OrbitControls.js";

let bg = 0xffffff;
//let bg = 0x00263f;
//let bg = 0xffffff;
let qual = 10;
let radSeg = 5;
let cylRadSeg = 32;
let rad = 10;
let cylRadInner = 500;
let cylRadThick = 10;
let cylDepth = 1000, cylColor = 0x010101;
let lenMult = 3;
const renderer = getRenderer();
let scene = getScene();
let camera = getCamera();
let light = getLight(scene);
let wireframeMat = new THREE.LineBasicMaterial( { color: 0xffffff } );
let controls = initControls(camera);
//let controls = getControls(camera, renderer);


let colorArray = [[0x001DFF, 0x8492FF],
                [0xFE0218, 0xFD8893, 0xCC0202],
                [0x00C354, 0x66C38E, 0x017031, 0x447559],
                [0xFF9500, 0xFFCD86, 0xDD8100, 0xDCB276, 0x995A00],
                [0x03F1FE, 0xC1FCFF, 0x00B5C0, 0xA4D4D7, 0x00565B, 0xA6A6A6]
                ];

let matDict = {"a": {"shininess": 150, "reflectivity": 1, "opacity": 1, "transparent": false, "colorIdx": 0},
                "b": {"shininess": 30, "reflectivity": 0.1, "opacity": 0.8, "transparent": true, "colorIdx": 1},
                "s": {"shininess": 150, "reflectivity": 1, "opacity": 0.2, "transparent": true, "colorIdx": 0},
                "a'": {"shininess": 150, "reflectivity": 1, "opacity": 1, "transparent": false, "colorIdx": 2},
                "b'": {"shininess": 30, "reflectivity": 0.1, "opacity": 0.8, "transparent": true, "colorIdx": 3},
                "a''": {"shininess": 150, "reflectivity": 1, "opacity": 1, "transparent": false, "colorIdx": 4},
                "t": {"shininess": 150, "reflectivity": 1, "opacity": 0.2, "transparent": true, "colorIdx": 1},
                "b''": {"shininess": 30, "reflectivity": 0.1, "opacity": 0.8, "transparent": true, "colorIdx": 5}
};

function makeMatArray(clrArr)
{
    let retArray = [];
    let eltDict = {};
    let curLen = clrArr.length;
    let i = 0;
    for(let k in matDict) {
        let curElt = matDict[k];
        let colIdx = curElt["colorIdx"];
        if(colIdx < curLen)
        {
            console.log(i);
            let curMat = new THREE.MeshPhongMaterial( {color: clrArr[colIdx], opacity: curElt["opacity"], transparent: curElt["transparent"], wireframe: false, shininess: curElt["shininess"]});
            retArray.push(curMat);
            eltDict[k] = i++;
        };
    }; 
    return [eltDict, retArray];
}   

let spr1 = makeSpiral(data1, colorArray[0], 1); 
let spr2 = makeSpiral(data1, colorArray[1], 0.95); 
let cyl1 = makeCyl(cylRadInner, cylDepth);
  render();



//========================================================
function makeSpiral(curDict, clrArr, param) {
    let totLen = curDict["total_len"];
    let adjLen = totLen * lenMult;
    let curve = makeConicalSpiral(201,param,adjLen,1);
    //let curve = makeConchospiral(1.065, 0.5, 1.1, adjLen);
    //let curve = makeConchospiral(1.065,0.5, 1.3, adjLen);
    let geom = new THREE.TubeBufferGeometry(curve, adjLen * qual, rad, radSeg, false);
    geom.clearGroups();

    let stepSize = qual*radSeg*3*lenMult; // because triangles i guess?
    let [eltDict, matArray] = makeMatArray(clrArr);
    console.log(eltDict, matArray); 
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
                let matIdx = eltDict[curType];
                //let curDir = elt["dir"];
                if(j == (eltLen - 1)) {
                    curIdx = sprIdx - sprLen;
                    curLen2 = runIdx - curIdx;
                };
                //console.log("qtrsec", curIdx, curLen2, curMat);
                geom.addGroup(curIdx, curLen2, matIdx);
                runIdx = curIdx;
            };
        });
    });

    let mesh = new THREE.Mesh(geom, matArray);
    scene.add(mesh);
    return mesh;
}

function makeCyl(cylRad, depth) {
    let cylOuter = new THREE.Shape();
    cylOuter.absarc(0,0, cylRad + cylRadThick, 0, Math.PI * 2, false); //last arg: clockwise
    let cylInner = new THREE.Path();
    cylInner.absarc(0,0, cylRad, 0, Math.PI * 2, true);
    cylOuter.holes.push(cylInner);
    let geom = new THREE.ExtrudeBufferGeometry(cylOuter, {depth: depth, curveSegments: cylRadSeg});

    let mat =  new THREE.MeshPhongMaterial( {color: cylColor, opacity: 0.1, reflectivity: 1, transparent: true, wireframe: false, shininess: 300});
    let mesh = new THREE.Mesh(geom,mat);
    //mesh.rotation.x += Math.PI*0.5;
    scene.add(mesh);
    return mesh;
    
}

function getSpiralLen(len) {
    //return (qual*radSeg*3*lenMult * len);
    return (qual*radSeg*3*lenMult * len);
}

function getSpiralIdx(idx) {
    //return (qual * radSeg * 3 * lenMult * idx);
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
    var light = new THREE.PointLight(0xffffff, 0.5, 0, 2);
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

