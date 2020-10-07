let cw = 1200
let ch = 1200;
let part1Len = 389;
let div = 100.0;
let n = -0.2;
let radMult = 300;
let lenMult = 0.2;
let rangeScl = 0.005;
let clr1 = [252, 186,3];
let colorArray = ["#001DFF", "#FE0218", "#00c354", "#ff9500", "#03F1FE"];


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
    //background(clr1[0], clr1[1], clr1[2]);
    background(255);
    translate(cw/2, ch/2);
    for(let i = 0; i < data.length; i++) {
        makeSpiral(n, div, lenMult, radMult, data[i], colorArray[i]);
    };
      
}

function getEltDisp(plo, phi, dir) {
    let goodDir = ["up", "down"];
    if(isNote(plo) && isNote(phi) && goodDir.includes(dir)) {
        let curLo = stringToMidi(plo);
        let curHi = stringToMidi(phi);
        let curDir = 0;
        if(dir == "up") {
            curDir = 1;
        } else {
            curDir = -1;   
        };

        let retRange = Math.abs(curHi - curLo) * curDir * rangeScl;
        return retRange;
    } else { return 0 };
    
}

function makeSpiral(_n, _div, _lenmult, _radmult, curData, curColor) {
    
    let curLen = curData["total_len"];
    let dataPts = curData["data"]; 
    let curOffset = (part1Len - curLen)*_lenmult;
    let totalLen = part1Len * _lenmult;
    stroke(curColor);
    let prev = [0,0];
    let totalDisp = 0;
    let dataIdx = -1;
    let eltDisp = 0;
    let eltLen = 0;
    let dataLen = 0;
    let eltIdx = 0;
    let eltSubDiv = 0;
    let eltLenSoFar = 0; //length seen so far in cur data idx
    let curDataPt = 0;
    let curDataLoc = 0;
    let eltRunIdx = 0;
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
            totalDisp += eltDisp;
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
            //console.log(dataLen, curDataLoc, eltLenSoFar, eltLen, curDataPt["elts"].length, eltIdx);
            console.log(eltDisp,totalDisp);  
        }; 
        let multiplier = 1;
        let idx = totalLen - (1/div) - i;
        if(letDraw) {
            let curDisp = eltDisp*(eltRunIdx/eltLen);
            //console.log(eltRunIdx/eltLen);
            eltRunIdx += (1/div);
            let overallDisp = totalDisp + curDisp;
            multiplier = (overallDisp + Math.pow(idx,_n)) * _radmult;
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
}
