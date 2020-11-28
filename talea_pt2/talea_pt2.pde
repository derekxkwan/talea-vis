float curDiv = 4.0;
int num = 5000;
float sticky = 0.75;
float [][] lines;
DLA dla;
int initH = 50;
int drawSpacing = 1;
int maxDisplaceX;
boolean drawLines = false;
int[] clr2 = {252,3,127};
int[] clr = {255, 250,102};
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

int[][] displaceMult = {{1,0,0}, {0,1,0}, {0,1,1}, {0,1,1}, {1,0,1}, {0,1,1}, {0,1,1}, {1, 0,0}, {1, 0, 0}, {1,0,0}}; 

void drawVoiceLines() {
  int ch = initH;
  int spacingV = int((height-(initH*2))/(colorArray.length));
  for(int i=0;i<colorArray.length;i++) {
    float idx = pow(i+1,1.1);
    int drawTimes = int(idx*(idx+1.0)/2.0);
    int sWeight = (i+1)*2;
    float baseAlpha = min(255, 255.0/(drawTimes * 0.5));
    int[] baseColor = hexToRgb(colorArray[i]);
    float randBand = (i*2);
    float randAlpha = (i*2);
    float displaceAmt = (i*30);
    float displaceX = maxDisplaceX*float(i)/colorArray.length;
    //println(curAlpha);
    //println(colorArray[i], ch, drawTimes);
    int lastColorStart = drawTimes - (lastColors.length*lastColorMult);
    for(int j=0; j < drawTimes; j++) {
      int[] curBaseColor = baseColor;
      int[] curColor = {0,0,0};
      int[] distColor = {0,0,0};
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
        for(int k=0; k < baseColor.length; k++) {
          curColor[k] = curBaseColor[k];
          curAlpha = baseAlpha;
        };
      };
      if(displaceX > 0) {
        int curX1 = int(width/2 - random(displaceX));
        int curX2 = int(width/2 + random(displaceX));
        float displaceAlpha = random(25, baseAlpha);
        float curStroke = random(1, sWeight);
        float curRand = displaceAmt;
        for(int k=0; k < curBaseColor.length; k++) {
            distColor[k] = int(max(0, min(255, curBaseColor[k] + (displaceMult[i][k]*curRand))));
            
        };
        strokeWeight(curStroke);
        stroke(distColor[0], distColor[1], distColor[2], displaceAlpha);
        line(curX1, ch+offset, curX2, ch+offset);
        strokeWeight(sWeight);
        stroke(curColor[0], curColor[1], curColor[2], curAlpha);
        line(0, ch+offset, curX1, ch+offset);
        line(curX2, ch+offset, width, ch+offset);
      }
      else {
        strokeWeight(sWeight);
        stroke(curColor[0], curColor[1], curColor[2], curAlpha);
        line(0, ch+offset, width, ch+offset);
      };
    };
    ch += spacingV;
  };
}


void setup () {
  size(1000,1000);
  hint(ENABLE_STROKE_PURE);
  maxDisplaceX = int(width/2);
  dla = new DLA(int(width/curDiv), int(height/curDiv), num, sticky, int(width/(curDiv*2)), 0);
  background(clr2[0], clr2[1], clr2[2]);
  lines = dla.generate(curDiv);
  drawLines = true;
  drawVoiceLines();
}

void draw () {

 if(drawLines) {
      strokeWeight(1);
      for(int i=0; i < lines.length; i++){
        stroke(clr[0],clr[1],clr[2]);
        line(lines[i][0], lines[i][1], lines[i][2], lines[i][3]);
      };
      drawLines = false;
  };
}

void mousePressed() {
  save("part2.png"); 
}
