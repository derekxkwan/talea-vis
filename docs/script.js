
//import * as THREE from "../../lib/three.min.js";
//import {OBJLoader} from "../../lib/OBJLoader.js";
import * as THREE from "./build/three.module.js";
import {OrbitControls} from "./lib/OrbitControls.js";

let bg = 0xf9f9f9;
//let bg = 0x00263f;
let part1Len = 389;
let rotAmt = 0.001 * Math.PI;
//let bg = 0xffffff;
//let bg = 0x000000;
let spiralZpos = 2000;
let qual = 10;
let radSeg = 3;
let lenMult = 6;
let cylRadSeg = 32;
let rad = 30;
let cylRadInner = 389 * lenMult;
let cylRadThick = 100;
let cylDepth = 4500, cylColor = 0xffea00;
const renderer = getRenderer();
let scene = getScene();
let camera = getCamera();
let light = getLight(scene);
let wireframeMat = new THREE.LineBasicMaterial( { color: 0xffffff } );
let controls = initControls(camera);
//let controls = getControls(camera, renderer);

//add emissive dictionary for dynamics
let emisArray = {"ppp": 0x898989, "fff": 0x000000};
let radArray = [1, 0.8, 0.6, 0.4, 0.2];
let colorArray = [[0x001DFF, 0x8492FF],
                [0xFE0218, 0xFD8893, 0xCC0202],
                [0x00C354, 0x66C38E, 0x017031, 0x447559],
                [0xFF9500, 0xFFCD86, 0xDD8100, 0xDCB276, 0x995A00],
                [0x03F1FE, 0xC1FCFF, 0x00B5C0, 0xA4D4D7, 0x00565B, 0xA6A6A6]
                ];

let matDict = {"a": {"shininess": 100, "reflectivity": 1, "opacity": 1, "transparent": false, "colorIdx": 0},
                "b": {"shininess": 100, "reflectivity": 1, "opacity": 1, "transparent": true, "colorIdx": 1},
                "s": {"shininess": 100, "reflectivity": 1, "opacity": 0.2, "transparent": true, "colorIdx": -1},
                "a'": {"shininess": 100, "reflectivity": 1, "opacity": 1, "transparent": false, "colorIdx": 2},
                "b'": {"shininess": 100, "reflectivity": 1, "opacity": 1, "transparent": true, "colorIdx": 3},
                "a''": {"shininess": 100, "reflectivity": 1, "opacity": 1, "transparent": false, "colorIdx": 4},
                "t": {"shininess": 100, "reflectivity": 1, "opacity": 0.2, "transparent": true, "colorIdx": 1},
                "b''": {"shininess": 100, "reflectivity": 1, "opacity": 1, "transparent": true, "colorIdx": 5}
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
            //console.log(i);
            let curColor = 0xf0f0f0;
            if(colIdx >= 0) curColor = clrArr[colIdx];
            let curMat = new THREE.MeshPhongMaterial( {color: curColor, opacity: curElt["opacity"], transparent: curElt["transparent"], wireframe: false, shininess: curElt["shininess"]});
            retArray.push(curMat);
            eltDict[k] = i++;
        };
    }; 
    return [eltDict, retArray];
}   

let spr = Array.from({length: data.length}, (x,i) => makeSpiral(data[i], colorArray[i], radArray[i]));

let cyl1 = makeCyl(cylRadInner, cylDepth);
  render();



//========================================================
function makeSpiral(curDict, clrArr, param) {
    let totLen = curDict["total_len"];
    let adjLen = totLen * lenMult;
    let tubLen = adjLen * qual;
    let curve = makeConicalSpiral(201,param,adjLen,1);
    let secIdxAdj = part1Len - totLen //because i coded qtr_index against overall part 1 length so I need to adjust
    //let curve = makeConchospiral(1.065, 0.5, 1.1, adjLen);
    //let curve = makeConchospiral(1.065,0.5, 1.3, adjLen);
    let geom = new THREE.TubeBufferGeometry(curve, tubLen, rad, radSeg, false);
    //geom.index = true;
    //console.log(geom.index);
    geom.clearGroups();
    //let stepSize = qual*radSeg*3*lenMult; // because triangles i guess?
    let stepSize = lenMult*qual*(radSeg*6); // because triangles i guess?
    //console.log(stepSize,stepSize * totLen);
    let [eltDict, matArray] = makeMatArray(clrArr);
    //console.log(eltDict, matArray); 
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
        let curIdx = curSec["qtr_index"] - secIdxAdj;
        let adjIdx = totLen - curIdx;
        let sprLen = getSpiralLen(stepSize,curLen);
        let sprIdx = getSpiralIdx(stepSize,adjIdx);
        let curSubdiv = curSec["elt_subdiv"];
        //let curSubdivLen = Math.round(stepSize/curSubdiv);
        let curSubdivLen = stepSize/curSubdiv;
        let runIdx = sprIdx;
        let eltLen = curSec["elts"].length;
        //console.log("newsec", totLen, curIdx, sprIdx, curSubdivLen);
        curSec["elts"].forEach((elt, j) => {
            let curSublen = elt["len"];
            if(curSublen > 0) {
                let curLen2 = Math.round(curSublen * curSubdivLen);
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
                //console.log(curIdx, curLen2);
                geom.addGroup(curIdx, curLen2, matIdx);
                //geom.addGroup(curIdx, curLen2, 0);
                runIdx = curIdx;
            };
        });
    });
    //console.log(geom.vertices);
    //console.log(geom.parameters);
    //tubularsegments = totlen * lenmult * radial segments * radius
    let mesh = new THREE.Mesh(geom, matArray);
    mesh.position.z += spiralZpos;
    scene.add(mesh);
    return mesh;
}

function makeCyl(cylRad, depth) {

    //part 1 edge yellow
    // part 2 edge purple
    // side transparent or fade
    let cylOuter = new THREE.Shape();
    cylOuter.absarc(0,0, cylRad + cylRadThick, 0, Math.PI * 2, false); //last arg: clockwise
    let cylInner = new THREE.Path();
    cylInner.absarc(0,0, cylRad, 0, Math.PI * 2, true);
    cylOuter.holes.push(cylInner);
    let geom = new THREE.ExtrudeBufferGeometry(cylOuter, {depth: depth, curveSegments: cylRadSeg});
    console.log(geom);
    //geom.clearGroups();
    let mat =  new THREE.MeshPhongMaterial( {color: cylColor, opacity: 1, reflectivity: 1, transparent: true, wireframe: false, shininess: 300});
    let mat2 =  new THREE.MeshPhongMaterial( {color: 0xfafafa, opacity: 0.1, reflectivity: 1, transparent: true, wireframe: false, shininess: 300});
    let mat3 =  new THREE.MeshPhongMaterial( {color: 0x00ff00, opacity: 1, reflectivity: 1, transparent: true, wireframe: false, shininess: 300});
    //geom.addGroup(0, 198, 0);
    //geom.addGroup(198, 396, 2);
    //geom.addGroup(396, 2772, 1);
    let mesh = new THREE.Mesh(geom,[mat,mat2]);
    console.log(geom.groups);
    //mesh.rotation.x += Math.PI*0.5;
    scene.add(mesh);
    return mesh;
    
}

function getSpiralLen(stepSize,len) {
    //return (qual*radSeg*3*lenMult * len);
    return (stepSize*len);
    //return (qual*radSeg*3*len);
}

function getSpiralIdx(stepSize,idx) {
    //return (qual * radSeg * 3 * lenMult * idx);
    return (stepSize * idx);
    //return (qual * radSeg * 3 * idx);
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
      camera.position.set(0,50,spiralZpos + (1750*lenMult));

    return camera;
  }

  function getLight(scene) {
    let light = new THREE.PointLight(0xf0f0f0, 1, 0, 1.5);
    light.position.set(0, 0,spiralZpos + (1000*lenMult));
    scene.add(light);
    
    let light2 = new THREE.PointLight(0xf0f0f0, 1, 0, 1.5);
    light2.position.set(0, 0,-1*(spiralZpos + (1000*lenMult)));
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

  function makeConicalSpiral(freq, radius, num, htscale) {

       let cur_arr = Array.from({length: num}, (x,i) => 
            new THREE.Vector3(i * radius * Math.cos(freq * i) , i * radius * Math.sin(freq * i), i*htscale)
    );

      let curve = new THREE.CatmullRomCurve3(cur_arr);
      //console.log(curve.points.length/lenMult);
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

function animate()
{
    if(spr.length >= 5) {
        for(let i in spr) {
            //console.log(s);
            spr[i].rotation.z += rotAmt;
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

