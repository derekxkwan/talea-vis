float curDiv = 4.0;
int num = 5000;
float sticky = 0.75;
float [][] lines;
DLA dla;
int initH = 50;
int drawSpacing = 1;
boolean drawLines = false;
int[] clr2 = {252,3,127};
int[] clr = {255, 250,102};
int[] colorArray = {#001dff,#fc03e8,
                      #FE0218,#fc4e03, 
                      #00c354, #bafc03,     
                      #ff9500,#03fcad,
                      #03F1FE,#03bafc
                        };


void drawVoiceLines() {
  int ch = initH;
  int spacingV = int((height-(initH*2))/(colorArray.length));
  for(int i=0;i<colorArray.length;i++) {
    float idx = pow(i+1,1.1);
    int drawTimes = int(idx*(idx+1.0)/2.0);
    int strokeWeight = (i+1)*2;
    float curAlpha = min(255, 255.0/(drawTimes * 0.5));
    //println(curAlpha);
    stroke(colorArray[i], curAlpha);
    strokeWeight(strokeWeight);
    //println(colorArray[i], ch, drawTimes);
    for(int j=0; j < drawTimes; j++) {
      int offset = int(j*drawSpacing);
      line(0, ch+offset, width, ch+offset);
    };
    ch += spacingV;
  };
}


void setup () {
  size(1000,1000);
  hint(ENABLE_STROKE_PURE);
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
