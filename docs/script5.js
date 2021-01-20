
//import * as THREE from "../../lib/three.min.js";
//import {OBJLoader} from "../../lib/OBJLoader.js";
import * as THREE from "./build/three.module.js";
import {OrbitControls} from "./lib/OrbitControls.js";

let gradPath = "./res/cyl.png";
let p1endPath = "./res/part1.png";
let p2endPath = "./res/part2.png";

//bridgeStuff
let initPos = new THREE.Vector3(4812,150, 2670);
let bridgeCyl = [];
let bridgeRot = [];
let bridgeRotScale = 0.005;
let bridgeLenMult = 3;
let discPaths = ['./res/disc0.0.png', './res/disc0.125.png', './res/disc0.25.png', './res/disc0.375.png', './res/disc0.5.png', './res/disc0.625.png', './res/disc0.75.png', './res/disc0.875.png', './res/disc1.0.png'];

let bridgeLen = datab["data"]["total_len"]*bridgeLenMult;
//-----------------
let lastIntersect;
let zOff = 0;
//let htscale = 1;
let htscale = 4;
let mu = 201;
//let mu = 51;
let overallScale = 0.1;
let bridgeScale = 5 * overallScale;
let base_bpm = 80;
//let bg = 0xf9f9f9;
//let bg = 0x00263f;
let bg = 0xe6e9ff;
let part1Len = data[0]["total_len"];
let rotAmt = 0.001 * Math.PI;
//let bg = 0xffffff;
//let bg = 0x000000;
let qual = 5;
let radSeg = 5;
let lenMult = 6;
let spiralZpos = (3.35*part1Len*lenMult*overallScale*htscale)+(bridgeLen*bridgeScale);
let cylRadSeg = 32;
let rad = 15 * overallScale*htscale;
let cylRadInner = part1Len * 2.5 * lenMult * overallScale;
let cylRadThick = 2000 * overallScale;
let cylDepth = part1Len * lenMult * 3.65 * overallScale*htscale, cylColor = 0xffea00;
const renderer = getRenderer();
let scene = getScene();
let camera = getCamera();
let light = getLight(scene);
let wireframeMat = new THREE.LineBasicMaterial( { color: 0xffffff } );
let controls = initControls(camera);
//let controls = getControls(camera, renderer);
let rayc = new THREE.Raycaster();
//add emissive dictionary for dynamics
let curModelName;
let mouse = new THREE.Vector2();


let emisDict = {"nient": 0x656565, "pppp": 0x5a5a5a, "ppp": 0x505050,
                "pp": 0x464646, "p": 0x3c3c3c, "mp": 0x303030,
                "mf": 0x202020,"f": 0x121212, "ff": 0x090909,
                "fff": 0x000000};


//let emisDict = {"nient": 0x
let radArray = [1, 0.8, 0.6, 0.4, 0.2];
let colorArray = [
                //[0x001DFF, 0x8492FF, 0x0016bd, 0x5e69bd, 0x000b5e, 0x2d3257],
                [0x4000ff, 0xa385ff, 0x2d00b3, 0x6a53ad, 0x1f007a, 0x483875],     
                [0xFE0218, 0xFD8893, 0xba0000, 0xc45e5e, 0x6e0000, 0x663333],
                [0xff9500, 0xffcd86, 0xc27100, 0xb8915c, 0x784600, 0x6e5636],
                [0x00c354, 0x66c38e, 0x008c3d, 0x41875f, 0x005927, 0x2f523e],
                [0x03F1FE, 0xC1FCFF, 0x00B5C0, 0xA4D4D7, 0x00565B, 0xA6A6A6]
                ];

let colorArray2 =   [[0xfc03e8, 0xff85f5, 0xb500a6, 0xad5ea7, 0x730069, 0x6e3d6a],
                     [0xfc4e03, 0xff9d73, 0xa83200, 0xa3684e, 0x6e2100, 0x634437],
                     [0xbafc03, 0xddfc86, 0x729c00, 0x809448, 0x3e5400, 0x49542a],     
                     [0x03fcad, 0x9dfcde, 0x00ba7f, 0x6bc9ab, 0x007550, 0x356656],
                     [0x03bafc, 0xb8ecff, 0x0280ad, 0x97becc, 0x01455e, 0x9b9d9e]
                    ];

let colorArray3 = [[0x036bfc, 0x82b6ff, 0x0050bf, 0x6083b5, 0x003278, 0x324661],
                    [0x031cfc, 0x8a95ff, 0x0011ad, 0x5b64b3, 0x000b73, 0x363a63]
                    ];

let part2clrMap = { "bf": colorArray[0], "af": colorArray[1], "fs": colorArray[2],
                    "e": colorArray[3], "d": colorArray[4],
                    "a": colorArray2[0], "g": colorArray2[1], "f": colorArray2[2],
                    "ef": colorArray2[3], "df": colorArray2[4],
                    "c": colorArray3[0], "b": colorArray3[1]
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


makeDiscs(spiralZpos-(bridgeLen*bridgeLenMult*0), bridgeScale, bridgeLenMult*2);
//makeDiscs(spiralZpos-(bridgeLen*bridgeLenMult*0), 1, bridgeLenMult*2);
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
        //curEmis = 0x000000;
        //curEmis = 0xffffff;
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
    mesh.position.z += spiralZpos+zOff-(bridgeLen*bridgeScale);
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
            makeRing(cylRad-(1.5*cylRadThick),cylRad+cylRadThick, depth/2 + zPos, mat, 0);
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
    let camZtarget = spiralZpos+zOff-(0.5*bridgeLen*bridgeScale);
    let curCtrls = new OrbitControls(camera, renderer.domElement);
    //curCtrls.addEventListener('change', render);
    //curCtrls.target.set(0,20,100);
    curCtrls.target.set(0,0, 0);
    curCtrls.enableKeys = true;
    //curCtrls.minDistance = 10;
      curCtrls.target.set(0,0,camZtarget);
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
    let camZpos = spiralZpos+zOff-(bridgeLen*bridgeScale);
    let aspectRatio = window.innerWidth / window.innerHeight;
    let camera = new THREE.PerspectiveCamera(50, aspectRatio, 1, 999999);
    //camera.position.set(0, 1, -10);
      camera.position.set(initPos.x, initPos.y, initPos.z);
      //camera.lookAt(0,0,spiralZpos);
      //camera.lookAt(0,0,-spiralZpos);
       // camera.position.set(0,0,zOff+(spiralZpos - (3000*overallScale*lenMult)));
    return camera;
  }

  function getLight(scene) {
    let intensity1 = 0.85;
    let intensity2 = 0.5;
    //let intensity1 = 0.85;
    let intensity3 = 0.85;
    //let intensity2 = 0.85;
    let lightDist = 0;
    let zPos1 = spiralZpos + zOff+ (5000*overallScale*lenMult);
    let zPos2 = zOff-1*(spiralZpos + (3000*overallScale*lenMult))
    let light1 = new THREE.PointLight(0xf0f0f0, intensity1, lightDist, 1);
    light1.position.set(0, 3000,zPos1);
    scene.add(light1);
    
    let light1a = new THREE.PointLight(0xf0f0f0, intensity1, lightDist, 1);
    light1a.position.set(0, -3000, zPos1);

    let light2 = new THREE.PointLight(0xf0f0f0, intensity2, lightDist, 1);
    light2.position.set(0, 3000, zPos2);
    scene.add(light2);

    let light2a = new THREE.PointLight(0xf0f0f0, intensity2, lightDist, 1);
    light2a.position.set(0, -3000,zPos2);
    scene.add(light2a);


    let light3 = new THREE.PointLight(0xf0f0f0, intensity3, lightDist, 1);
    light3.position.set(5000, 0,spiralZpos + zOff+ (3000*overallScale*lenMult));
    scene.add(light3);
    
    let light4 = new THREE.PointLight(0xf0f0f0, intensity3, lightDist, 1);
    light4.position.set(-5000, 0,spiralZpos + zOff+ (3000*overallScale*lenMult));
    scene.add(light4);

    let light5 = new THREE.PointLight(0xf0f0f0, intensity3, lightDist, 1);
    light5.position.set(0,5000,spiralZpos + zOff+ (3000*overallScale*lenMult));
    scene.add(light5);
    
    let light6 = new THREE.PointLight(0xf0f0f0, intensity3, lightDist, 1);
    light6.position.set(0,-5000,spiralZpos + zOff+ (3000*overallScale*lenMult));
    scene.add(light6);

    let ambientLight = new THREE.AmbientLight(0x101010);
    scene.add(ambientLight);
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


function formatText(curName) {
    let curStr = "";
    let cur = dataText[curName];
    curStr += "<a href='details.html#" + curName + "' target='_blank'><h1>" + cur["name"] + "</h1></a>";
    curStr += "<h2>Description</h2>";
    curStr += cur["description"];
    if("dir" in cur) {
        curStr += "<h2>Direction</h2>";
        curStr += cur["dir"];
    };
    curStr += "<h2>Features</h2>";
    curStr += "<ul>";
    for(let i=0; i < cur["features"].length; i++) {
        curStr += "<li>" + cur["features"][i] + "</li>";
    };
    if("imag_tools" in cur) {
        curStr += "<li>Imaginary Tools";
        curStr += "<ul>";
        for(let i=0; i < cur["imag_tools"].length; i++) {
            curStr += "<li>" + cur["imag_tools"][i] + "</li>";
        };
        curStr += "</li>";
        curStr += "</ul>";
    };
    curStr += "</ul>";
    return curStr;

}   

function animate()
{
    rayc.setFromCamera( mouse, camera );
    let intersects = rayc.intersectObjects(scene.children, true);

    bridgeAnim();
    if (intersects.length > 0) {
        let intersected = intersects[0].object;
        if(intersected != lastIntersect) {
            let curName = intersected.dataName;
            let curText = formatText(curName);
            let infobox = document.getElementById("infobox");
            infobox.innerHTML = curText;
            curModelName = curName;
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
//BRIDGE STUFF

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
    let curZ = ((splitStage*thickMult+((texidx-1)*thickMult)+disc2Off)*distMult)+(numidx*thickMult);
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
        let curQual = 12;
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
            //console.log(j, curOp);
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


document.addEventListener('keyup', (e) => {
    console.log(e.code);
    if(e.code == "Space" && typeof curModelName !== "undefined") {
        let curUrl = "details.html#" + curModelName;
        window.open(curUrl);
    }
    else if(e.code == "KeyC") {
        console.log(camera.position);
    }
});
