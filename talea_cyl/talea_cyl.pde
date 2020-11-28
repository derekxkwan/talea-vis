int num = 5000;
float sticky = 0.75;
float [][] lines;
DLA dla;
float initW = 23.5;
float drawScale = 2;
float curDiv = 4.0*drawScale;
int drawSpacing = 1;
boolean drawLines = false;
//int[] clr2 = {252,3,127};
//int[] clr = {255, 250,102};
int[] clr1 = {255, 250,102};
int[] clr2 = {252,3,127};

int[] colorArray = {#4000ff,#fc03e8,
                      #FE0218,#fc4e03, 
                      #ff9500, #bafc03,     
                      #00c354,#03fcad,
                      #03F1FE,#03bafc
                        };


int[] lastColors = {#03bafc, 0x036bfc,0x031cfc, #4000ff, #fc03e8};
int lastColorMult = 3;



int[] hexToRgb(int curHex) {
    int[] rgb = {0,0,0};
    int r = (curHex & 0xFF0000) >> 16;
    int g = (curHex & 0xFF00) >> 8;
    int b = (curHex & 0xFF);
    rgb[0] = r;
    rgb[1] = g;
    rgb[2] = b;
    return rgb;
}


void drawVoiceCurves() {
  int cw = int(initW*6);
  float ctr = width/2.0;
  float ctl0X0 = ctr;
  float ctl0Y0 = height/4.0;
  float ctl0X1 = ctr;
  float ctl0Y1 = 3*height/4.0;
  float ctl1X0 = ctr;
  float ctl1Y0 = height/4.0;
  float ctl1X1 = ctr;
  float ctl1Y1 = 3*height/4.0;
  int spacingH = 230;
  int sCompH = 40;
  int[] fromCtrArr = {141, 246, 320, 384, 446, 506, 566, 625, 691, 771};
  int[] drawTimesArr = {1,2,4, 7, 7, 8, 13, 24, 40, 63};
  noFill();
  for(int i=0; i < colorArray.length; i++) {
    float idx = pow(i+1,1.1);
    //int drawTimes = max(1,int(drawScale*idx*(idx+1.0)/6.0));
    int drawTimes = drawTimesArr[i];
    int strokeWt = (i+1)*2;
    //float curAlpha = min(255, 255.0/(drawTimes));
    float baseAlpha = min(255, 255.0/(drawTimes * 0.5));
    int[] baseColor = hexToRgb(colorArray[i]);
    //int fromCtr = cw + ((i*spacingH) - max(0,4*(i))*sCompH);
    int fromCtr = fromCtrArr[i];
    float curX0 = ctr + fromCtr;
    float curX1 = ctr - fromCtr;
    float randBand = (i*2);
    float randAlpha = (i*2);
    int lastColorStart = drawTimes - (lastColors.length*lastColorMult);
    println(fromCtr, drawTimes);
    strokeWeight(strokeWt);
    for(int j=0; j <drawTimes; j++) {
      int[] curBaseColor = baseColor;
      int[] curColor = {0,0,0};
      int offset = int(j*drawSpacing);
      float curAlpha = 0;
      if (i == colorArray.length-1 && j >= lastColorStart) {
        int lastColorIdx = int((j - lastColorStart)/lastColorMult);
        curBaseColor = hexToRgb(lastColors[lastColorIdx]);
        println(lastColors[lastColorIdx]);
      };
      if(j > 0) {
          float rA = (randAlpha*2.0* float((3+j)*31 % 59)/59) - randAlpha;
          curAlpha = int(max(0, min(255, baseAlpha + rA)));
          for(int k=0; k < curBaseColor.length; k++) {
            float curRand = (randBand*2.0* float((k+j)*31 % 59)/59) - randBand;
            curColor[k] = int(max(0, min(255, curBaseColor[k] + curRand)));
          };
      }
      else {
        for(int k=0; k < curBaseColor.length; k++) {
          curColor[k] = curBaseColor[k];
          curAlpha = baseAlpha;
        };
      };
      stroke(curColor[0], curColor[1], curColor[2], curAlpha);
      bezier(ctr, 0, ctl0X0, ctl0Y0, ctl0X1, ctl0Y1,curX0+offset, height);
      bezier(ctr, 0, ctl1X0, ctl1Y0, ctl1X1, ctl1Y1,curX1-offset, height);
    };


  };
}
  /*
void drawVoiceLines() {
  int ch = initW;
  int spacingV = int((height-(initH*2))/(colorArray.length));
  for(int i=0;i<colorArray.length;i++) {
    float idx = pow(i+1,1.1);
    int drawTimes = int(idx*(idx+1.0)/2.0);
    int strokeWt = (i+1)*2;
    float curAlpha = min(255, 255.0/(drawTimes * 0.5));
    //println(curAlpha);
    stroke(colorArray[i], curAlpha);
    strokeWeight(strokeWt);
    //println(colorArray[i], ch, drawTimes);
    for(int j=0; j < drawTimes; j++) {
      int offset = int(j*drawSpacing);
      line(0, ch+offset, width, ch+offset);
    };
    ch += spacingV;
  };
}
*/

void drawGradient(int[] color1,int[] color2, int startX, int startY, int endX, int endY) {
    strokeWeight(1);
    int stepC = endX - startX;
    float stepR = float(color1[0] - color2[0])/float(stepC);
    float stepG = float(color1[1] - color2[1])/float(stepC);
    float stepB = float(color1[2] - color2[2])/float(stepC);
    for(int i=startY; i < endY; i++)
    {
        int curR = color1[0] - int(i*stepR);
        int curG = color1[1] - int(i*stepG);
        int curB = color1[2] - int(i*stepB);
        stroke(curR, curG, curB);
        line(startX,i, endX, i);

    };
    
}

int[] getColor(int[] color1, int[] color2, int startX, int endX, float y0, float y1) {
    int stepC = endX - startX;
    float stepR = float(color1[0] - color2[0])/float(stepC);
    float stepG = float(color1[1] - color2[1])/float(stepC);
    float stepB = float(color1[2] - color2[2])/float(stepC);
    float i = ((y0+y1)/2.0);
    int curR = color1[0] - int(i*stepR);
    int curG = color1[1] - int(i*stepG);
    int curB = color1[2] - int(i*stepB);
    int[] retColor = {curR, curG, curB};
    return retColor;
}

void setup () {
  size(2000,2000);
  hint(ENABLE_STROKE_PURE);
  dla = new DLA(int(width/curDiv), int(height/curDiv), num, sticky, int(width/(curDiv*2)), 0);
  background(clr2[0], clr2[1], clr2[2]);
  lines = dla.generate(curDiv);
  drawLines = true;
  drawGradient(clr1, clr2, 0, 0, width, height);
  drawVoiceCurves();
}

void draw () {

 if(drawLines) {
      strokeWeight(2*drawScale);
      for(int i=0; i < lines.length; i++){
        float x0 = lines[i][0];
        float y0 = lines[i][1];
        float x1 = lines[i][2];
        float y1 = lines[i][3];
        int[] clr = getColor(clr2, clr1, 0, width, y0, y1);
        stroke(clr[0],clr[1],clr[2]);
        line(x0*drawScale,y0*drawScale,x1*drawScale,y1*drawScale);
      };
      drawLines = false;
  };
  
}

void mousePressed() {
  save("cyl.png"); 
}
