let cw = 1200
let ch = 1200;
let part1Len = 389;
let div = 100.0;
let n = -0.2;
let radMult = 300;
let lenMult = 0.025;
let rangeScl = 0.0075;
//let clr1 = [252, 186,3];
let clr1 = [255, 250,102];
let colorArray = ["#001DFF", "#FE0218", "#00c354", "#ff9500", "#03F1FE"];
let cPitch = stringToMidi("ef4");

function polarToCart(radius, theta) {
    return [radius * Math.cos(theta), radius * Math.sin(theta)];
} 



function preload()
{

    //noStroke();
}

function setup()
{
    //console.log("bob");
    frameRate(24);
    createCanvas(cw,ch);
    console.log(data[0]);
    drawSpirals();   
}

function drawSpirals() {
     background(clr1[0], clr1[1], clr1[2]);
    // background(255);
    translate(cw/2, ch/2);
    rotate(3*PI/2);
    for(let i = 0; i < data.length; i++) {
        makeSpiral(n, div, lenMult, radMult, data[i], colorArray[i]);
    };
      
}
//returns start,end (rel to cPitch) and dir sign * range
function getEltDisp(plo, phi, dir) {
    let goodDir = ["up", "down"];
    if(isNote(plo) && isNote(phi) && goodDir.includes(dir)) {
        let pitch0, pitch1;
        let curDir = 0;
        if(dir == "up") {
            pitch0 = stringToMidi(plo) - cPitch;
            pitch1 = stringToMidi(phi) - cPitch;
            curDir = 1;
        } else {
            pitch1 = stringToMidi(plo) - cPitch;
            pitch0 = stringToMidi(phi) - cPitch;
            curDir = -1;   
        };
        let pRange = Math.abs(pitch0 - pitch1)*curDir*rangeScl;
        return [pitch0*rangeScl, pitch1*rangeScl, pRange];
    } else { return ["none", "none", "none"] };
    
}

function makeSpiral(_n, _div, _lenmult, _radmult, curData, curColor) {
    
    let curLen = curData["total_len"];
    let dataPts = curData["data"]; 
    let curOffset = (part1Len - curLen)*_lenmult;
    let totalLen = part1Len * _lenmult;
    stroke(curColor);
    let prev = [0,0];
    let dataIdx = -1;
    let eltLen = 0;
    let dataLen = 0;
    let eltIdx = 0;
    let eltSubDiv = 0;
    let eltLenSoFar = 0; //length seen so far in cur data idx
    let curDataPt = 0;
    let curDataLoc = 0;
    let eltRunIdx = 0;
    let lastDisp = [0,0,0], eltDisp = [0,0,0];
    let drawRange = false;
    for(let i=0; i < totalLen; i += (1.0/div)) {
        let letDraw = i >= curOffset;
        if(letDraw && i >= (dataLen + curDataLoc) && dataIdx < dataPts.length - 1){
            dataIdx += 1;
            curDataPt = dataPts[dataIdx];
            //console.log(curDataPt);
            eltIdx = -1;
            eltLenSoFar = 0;
            eltLen = 0;
            dataLen = curDataPt["qtr_len"] * _lenmult;
            eltSubDiv = curDataPt["elt_subdiv"];
            curDataLoc = curDataPt["qtr_index"] * _lenmult;
        };
        if(letDraw && i >= (curDataLoc + eltLenSoFar+eltLen) && eltIdx < curDataPt["elts"].length - 1) {
            if(eltDisp[0] != "none") {
                lastDisp = eltDisp;
            };
            eltLenSoFar += eltLen;
            eltIdx += 1;
            eltRunIdx = 0;
            let curElt = curDataPt["elts"][eltIdx];
            //console.log(curElt);
            let curPlo = curElt["plo"];
            let curPhi = curElt["phi"];
            let curDir = curElt["dir"];
            eltLen = (curElt["len"]/eltSubDiv) * _lenmult;
            eltDisp = getEltDisp(curPlo, curPhi, curDir);
            if(eltDisp[0] != "none") {
                drawRange = true;
            }
            else {
                drawRange = false;
            };
            //console.log(dataLen, curDataLoc, eltLenSoFar, eltLen, curDataPt["elts"].length, eltIdx);
        }; 
        let multiplier = 1;
        let idx = totalLen - (1/div) - i;
        if(letDraw) {
            if(drawRange == true) {
                let curDisp = eltDisp[0]+(eltDisp[2]*eltRunIdx/eltLen);
            //console.log(eltRunIdx/eltLen);
                eltRunIdx += (1/div);
                multiplier = (curDisp + Math.pow(idx,_n)) * _radmult;
            }
            else {
                multiplier = (lastDisp[1] + Math.pow(idx,_n)) * _radmult;
            };
        }
        else {
                multiplier = (Math.pow(idx,_n)) * _radmult;
        };
        let pt = [multiplier*Math.cos(idx), multiplier*Math.sin(idx)];
        if(letDraw && i > 0) {
            line(prev[0], prev[1], pt[0], pt[1]);
        };
        prev = pt;
    };

}

function draw()
{
    
     
}


function windowResized()
{
    resizeCanvas(windowWidth, windowHeight);
    cw = windowWidth;
    ch = windowHeight;
    drawSpirals();
}
