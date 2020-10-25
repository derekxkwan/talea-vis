let cw = 1200
let ch = 1200;
//let clr1 = [252, 186,3];
let clr1 = [255, 250,102];
let clr2 = [252,3,127];

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
}

function draw()
{
    
    background(255);
   drawGradient(clr1, clr2, 0, 0, width, height);
    
}

function drawGradient(color1, color2,startX, startY, endX, endY) {
    strokeWeight(1);
    let stepC = endX - startX;
    let stepR = (color1[0] - color2[0])/stepC;
    let stepG = (color1[1] - color2[1])/stepC;
    let stepB = (color1[2] - color2[2])/stepC;
    for(let i=startY; i < endY; i++)
    {
        let curR = color1[0] - (i*stepR);
        let curG = color1[1] - (i*stepG);
        let curB = color1[2] - (i*stepB);
        stroke(curR, curG, curB);
        line(startX,i, endX, i);

    };
    
}

function windowResized()
{
    resizeCanvas(windowWidth, windowHeight);
    cw = windowWidth;
    ch = windowHeight;
}

function mousePressed()
{
    save('gradient.png');
}
