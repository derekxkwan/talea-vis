
//import * as THREE from "../../lib/three.min.js";
//import {OBJLoader} from "../../lib/OBJLoader.js";
import * as THREE from "./build/three.module.js";
import {OrbitControls} from "./lib/OrbitControls.js";

let gradPath = "./res/cyl.png";
let p1endPath = "./res/part1.png";
let p2endPath = "./res/part2.png";

let lastIntersect;
let zOff = 0;
//let htscale = 1;
let htscale = 4;
let mu = 201;
//let mu = 51;
let overallScale = 0.1;
let base_bpm = 80;
//let bg = 0xf9f9f9;
let bg = 0x00263f;
let part1Len = data[0]["total_len"];
let rotAmt = 0.001 * Math.PI;
//let bg = 0xffffff;
//let bg = 0x000000;
let qual = 10;
let radSeg = 4;
let lenMult = 6;
let spiralZpos = (2*part1Len*lenMult*overallScale*htscale);
let cylRadSeg = 32;
let rad = 15 * overallScale*htscale;
let cylRadInner = part1Len * 2 * lenMult * overallScale;
let cylRadThick = 2000 * overallScale;
let cylDepth = part1Len * lenMult * 3 * overallScale*htscale, cylColor = 0xffea00;
const renderer = getRenderer();
let scene = getScene();
let camera = getCamera();
let light = getLight(scene);
let wireframeMat = new THREE.LineBasicMaterial( { color: 0xffffff } );
let controls = initControls(camera);
//let controls = getControls(camera, renderer);
let rayc = new THREE.Raycaster();
//add emissive dictionary for dynamics

let mouse = new THREE.Vector2();


let dataText = {["end1"] : "Cylinder front: representation of part 1 as a contrast to part 2\nChronological direction: clockwise\nBright yellow background color: represents a loud texture and the single fundamental C and its partials, which is the harmonic foundation for part 1. \nFive colored strands: representing the five voices of the polyphonic structure. blue=voice 1, red=voice 2 [etc]\n“Range filter”. The development of the melodic ranges of each voice are depicted in the movement of the lines, with pitch height ascending from the center towards the periphery.\n“Microtonal filter” [to be created] \nRank weeds. Weed-like designs in the surface structure (following voice chronology????)", 
    ["end2"] : "end2",
    ["spr1"] : "spr1",
    ["spr2"] : "spr2",
    ["cyl"] : "cyl"
};


let emisDict = {"nient": 0xbababa, "pppp": 0xa6a6a6, "ppp": 0x8f8f8f,
                "pp": 0x7d7d7d, "p": 0x707070, "mp": 0x5e5e5e,
                "mf": 0x525252,"f": 0x404040, "ff": 0x262626,
                "fff": 0x000000};

let radArray = [1, 0.8, 0.6, 0.4, 0.2];
let colorArray = [[0x001DFF, 0x8492FF],
                [0xFE0218, 0xFD8893, 0xCC0202],
                [0x00c354, 0x66c38e, 0x017031, 0x447559],
                [0xff9500, 0xffcd86, 0xdd8100, 0xdcb276, 0x995a00],
                [0x03F1FE, 0xC1FCFF, 0x00B5C0, 0xA4D4D7, 0x00565B, 0xA6A6A6]
                ];

let colorArray2 =   [[0xfc03e8, 0xfc036b],
                     [0xfc4e03, 0xf77c48, 0xb53802],
                     [0xbafc03, 0xddfc86, 0x5a7a00, 0x7a855b],     
                     [0x03fcad, 0x9dfcde, 0x00ba7f, 0x6bc9ab, 0x588275],
                     [0x03bafc, 0xb8ecff, 0x0280ad, 0x97becc, 0x01455e, 0x9b9d9e]
                    ];

let part2clrMap = { "bf": colorArray[0], "af": colorArray[1], "fs": colorArray[2],
                    "e": colorArray[3], "d": colorArray[4],
                    "a": colorArray2[0], "g": colorArray2[1], "f": colorArray2[2],
                    "ef": colorArray2[3], "df": colorArray2[4]
                    };


let matDict = {"a": {"shininess": 100, "reflectivity": 1, "opacity": 1, "transparent": false, "colorIdx": 0},
                "b": {"shininess": 100, "reflectivity": 1, "opacity": 1, "transparent": true, "colorIdx": 1},
                "s": {"shininess": 100, "reflectivity": 1, "opacity": 0.2, "transparent": true, "colorIdx": -1},
                "a'": {"shininess": 100, "reflectivity": 1, "opacity": 1, "transparent": false, "colorIdx": 2},
                "b'": {"shininess": 100, "reflectivity": 1, "opacity": 1, "transparent": true, "colorIdx": 3},
                "a''": {"shininess": 100, "reflectivity": 1, "opacity": 1, "transparent": false, "colorIdx": 4},
                "t": {"shininess": 20, "reflectivity": 0.25, "opacity": 0.65, "transparent": true, "colorIdx": -2},
                "b''": {"shininess": 100, "reflectivity": 1, "opacity": 1, "transparent": true, "colorIdx": 5}
};

document.addEventListener( 'mousemove', onDocumentMouseMove, false );


let spr = Array.from({length: data.length}, (x,i) => makeSpiral(data[i], colorArray[i], radArray[i]));

//parsePart2Data(1);
//console.log(data2["tot_dur"]*lenMult);
let spr2 = makeSpiral2(1.0);
//let spr = makeSpiral(data[0], colorArray[0], radArray[0]);
let cyl1 = makeTube(cylRadInner, cylDepth, spiralZpos*0.75+zOff);
  render();



//========================================================
function onDocumentMouseMove( event ) 
{
	// the following line would stop any other event handler from firing
	// (such as the mouse's TrackballControls)
	// event.preventDefault();
	
	// update the mouse variable
    //
    mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

}


function makeMat(eltType, clrArr, curDyn) {
    let curEmis = 0x000000;
    let curElt = matDict[eltType];
    let colIdx = curElt["colorIdx"];
    let curColor = 0xf0f0f0;
    if(colIdx >= 0) {
        curColor = clrArr[colIdx];
    }
    else if(colIdx == -2) {
        curColor = 0x6e6f70;
    };
    if(Object.keys(emisDict).includes(curDyn)) {
        curEmis = emisDict[curDyn];
    };
    curElt["emissive"] = curEmis;
    let curMat = new THREE.MeshPhongMaterial( {color: curColor, emissive: curEmis, opacity: curElt["opacity"], transparent: curElt["transparent"], wireframe: false, shininess: curElt["shininess"]});

    return curMat;
}

function makeMatArray(clrArr)
{
    let retArray = [];
    let eltDict = {};
    let curLen = clrArr.length;
    let i = 0;
    for(let k in matDict) {
            //console.log(i);
           
            let curMat = makeMat(k, clrArr, "none"); 
            retArray.push(curMat);
            eltDict[k] = i++;
        
    }; 
    return [eltDict, retArray];
}   



function makeSpiral(curDict, clrArr, param) {
    let totLen = curDict["total_len"];
    let adjLen = totLen * lenMult;
    let tubLen = adjLen * qual;
    let curve = makeConicalSpiral(mu,param,adjLen,htscale);
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
    let matArray = [];
    let curMatIdx = 0;
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
        let lastDyn = "";
        curSec["elts"].forEach((elt, j) => {
            let curSublen = elt["len"];
            let curType = elt["type"];
            if(curSublen > 0 && curType != "none") {
                let curLen2 = Math.round(curSublen * curSubdivLen);
                let curIdx = runIdx - curLen2;
                //let curSubidx = elt["subidx"];
                let curDyn = elt["dyn"];
                if(curDyn == "-") {
                    curDyn = lastDyn;
                };
                let curMat = makeMat(curType, clrArr, curDyn); 
                //let matIdx = eltDict[curType];
                //let curDir = elt["dir"];
                if(j == (eltLen - 1)) {
                    curIdx = sprIdx - sprLen;
                    curLen2 = runIdx - curIdx;
                };
                //console.log("qtrsec", curIdx, curLen2, curMat);
                //console.log(curIdx, curLen2);
                geom.addGroup(curIdx, curLen2, curMatIdx);
                matArray.push(curMat);
                curMatIdx += 1;
                lastDyn = curDyn;
                //geom.addGroup(curIdx, curLen2, 0);
                runIdx = curIdx;
            };
        });
    });
    //console.log(geom.vertices);
    //console.log(geom.parameters);
    //tubularsegments = totlen * lenmult * radial segments * radius
    let mesh = new THREE.Mesh(geom, matArray);
    mesh.position.z += spiralZpos + zOff;
    mesh.dataName = "spr1";
    scene.add(mesh);
    return mesh;
}

function makeSpiral2(curRadius) {
    parsePart2Data();
    let cur = data2["data"];
    let totLen = data2["tot_dur"];
    let adjLen = totLen;
    console.log(totLen);
    let tubLen = adjLen * qual;
    let curve = makeConicalSpiral(mu,curRadius, adjLen,htscale);
    //let curve = makeConchospiral(1.065, 0.5, 1.1, adjLen);
    //let curve = makeConchospiral(1.065,0.5, 1.3, adjLen);
    let geom = new THREE.TubeBufferGeometry(curve, tubLen, rad, radSeg, false);
    //geom.index = true;
    //console.log(geom.index);
    geom.clearGroups();
    //let stepSize = qual*radSeg*3*lenMult; // because triangles i guess?
    let stepSize = qual*(radSeg*6); // because triangles i guess?
    //console.log(stepSize,stepSize * totLen);
    let matArray = [];
    let curIdx = 0;
    let pastFund = "";
    let clrArr = [];
    for(let i =0; i < cur.length; i++) {
        let curFund = cur[i]["fund"];
        let curEltType = cur[i]["elt_type"];
        let curDyn = cur[i]["dyn"];
        //console.log(curFund);
        if(curFund != pastFund) {
            clrArr = part2clrMap[curFund];
        };
        pastFund = curFund;
        let curMat = makeMat(curEltType, clrArr, curDyn);
        let curDur = cur[i]["scaled_dur"];
        let curLen = Math.round(getSpiralLen(stepSize,curDur));
        //let curSprIdx = Math.round(getSpiralIdx(stepSize,curIdx));
        matArray.push(curMat);
        if(i == (cur.length - 1)) {
            //curSprIdx = getSpiralLen(stepSize,totLen) - curLen;
            curIdx = Math.round(getSpiralLen(stepSize,totLen)) - curLen;
        };
        
        //console.log(curSprIdx, curLen, matIdx, matArray.length);
        //geom.addGroup(curSprIdx, curLen, matIdx);
        geom.addGroup(curIdx, curLen,i);
        //curIdx += curDur;
        curIdx += curLen;
    };
    //console.log(geom.vertices);
    //console.log(geom.parameters);
    //tubularsegments = totlen * lenmult * radial segments * radius
    //console.log(matArray);
    let mesh = new THREE.Mesh(geom, matArray);
    mesh.rotation.x += Math.PI;
    mesh.position.z += spiralZpos+zOff;
    scene.add(mesh);
    mesh.dataName = "spr2";
    return mesh;
}

function makeCyl(cylRad, depth, zPos, mat) {
    let geom = new THREE.CylinderGeometry(cylRad, cylRad, depth, cylRadSeg, 1, true);
    //let mat =  new THREE.MeshPhongMaterial( {color: 0xfafafa, opacity: 0.1, reflectivity: 1, transparent: true, wireframe: false, shininess: 300}); 
    let mesh = new THREE.Mesh(geom,mat);
    scene.add(mesh);
    mesh.rotation.x += Math.PI*0.5;
    mesh.position.z = zPos;
    mesh.dataName = "cyl";
    return mesh;
}

function makeRing(radInner, radOuter, zPos, mat, part) {
    let geom = new THREE.RingGeometry(radInner, radOuter, cylRadSeg);
    //let mat =  new THREE.MeshPhongMaterial( {color: cylColor, opacity: 1, reflectivity: 1, transparent: true, wireframe: false, shininess: 300});
    let mesh = new THREE.Mesh(geom,mat);
    scene.add(mesh);
    mesh.position.z = zPos;
    if(part > 0) {
        mesh.rotation.y += Math.PI;
        mesh.dataName = "end2";
    }
    else {
        mesh.dataName = "end1";
    };
    return mesh;

}

function makeTube(cylRad, depth, zPos) {
    let gradLoader = new THREE.ImageLoader();
    gradLoader.setCrossOrigin('*').load(gradPath,
        function (img) {
            let texture = new THREE.CanvasTexture(img);
            let mat = new THREE.MeshPhongMaterial({color:0xffffff, reflectivity: 0.1, shininess: 100, map: texture, transparent: true, opacity: 0.75});
            mat.side = THREE.DoubleSide;
            makeCyl(cylRad+cylRadThick, depth, zPos, mat);
        });
    let p1endLoader = new THREE.ImageLoader();
    p1endLoader.setCrossOrigin('*').load(p1endPath,
        function (img) {
            let texture = new THREE.CanvasTexture(img);
            let mat = new THREE.MeshPhongMaterial({color:0xffffff,  map: texture, transparent: true, opacity: 0.75});
            mat.side = THREE.DoubleSide;
            makeRing(cylRad-cylRadThick,cylRad+cylRadThick, depth/2 + zPos, mat, 0);
        });
    let p2endLoader = new THREE.ImageLoader();
    p2endLoader.setCrossOrigin('*').load(p2endPath,
        function (img) {
            let texture = new THREE.CanvasTexture(img);
            let mat = new THREE.MeshPhongMaterial({color:0xffffff, map: texture, transparent: true, opacity: 0.75, shininess:  1, reflectivity: 0.1});
            mat.side = THREE.DoubleSide;
            makeRing(cylRad, cylRad+cylRadThick, -depth/2 + zPos, mat, 1);
        });


}
function makeExtTube(cylRad, depth) {

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
    var camera = new THREE.PerspectiveCamera(50, aspectRatio, 1, 999999);
    //camera.position.set(0, 1, -10);
      //camera.position.set(0, 0, 50);
      camera.position.set(0,50,spiralZpos + (100*lenMult));

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

  function makeConicalSpiral(freq, radius, num, htscale) {

       let cur_arr = Array.from({length: num}, (x,i) => 
            new THREE.Vector3(i * radius * Math.cos(freq * i) * overallScale, i * radius * Math.sin(freq * i) * overallScale, i*htscale * overallScale)
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

function parsePart2Data() {
    let cur = data2["data"];
    let cml_dur = 0;
    for(let i = 0; i < cur.length; i++) {
        let cur_bpm = cur[i]["bpm"];
        let scaled_bpm = cur_bpm/base_bpm;
        let cur_dur = cur[i]["qtr_dur"];
        let scaled_dur = Math.round((1.0/scaled_bpm)*cur_dur*lenMult);
        data2["data"][i]["scaled_bpm"] = scaled_bpm;
        data2["data"][i]["scaled_dur"] = scaled_dur;
        console.log(scaled_dur, cml_dur);
        cml_dur += scaled_dur;
    };
    data2["tot_dur"] = cml_dur;
}

  /**
  * Render!
  **/

function animate()
{
    rayc.setFromCamera( mouse, camera );
    let intersects = rayc.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        let intersected = intersects[0].object;
        if(intersected != lastIntersect) {
            let curName = intersected.dataName;
            let curText = dataText[curName]
            let infobox = document.getElementById("infobox");
            infobox.innerHTML = curText;
        };
        lastIntersect = intersected;
    };

    if(spr.length >= 5) {
        for(let i in spr) {
            //console.log(s);
            spr[i].rotation.z += rotAmt;
        };
    };
    if(spr2 != null) spr2.rotation.z -= rotAmt;


}
function render() {
    animate();
    requestAnimationFrame(render);
    controls.update();
    renderer.render(scene, camera);
};


//--------------------------------------------------------

