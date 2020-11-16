int n = 5;
int clrW;
float blendAmt = 1.0;
int blendW;
int [][] colorArray = {{0x001DFF, 0x8492FF},
                {0xFE0218, 0xFD8893, 0xCC0202},
                {0x00c354, 0x66c38e, 0x017031, 0x447559},
                {0xff9500, 0xffcd86, 0xdd8100, 0xdcb276, 0x995a00},
                {0x03F1FE, 0xC1FCFF, 0x00B5C0, 0xA4D4D7, 0x00565B, 0xA6A6A6}
                };

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

void setup () {
  float blendStart = 1.0 - blendAmt;
  size(750,750);
  clrW = int(width/n);
  strokeWeight(1);
  for(int x=0; x < width; x++) {
    int[] curColor = new int[3];
    int realx = x;
    if(blendAmt < 0.01) {
      curColor = hexToRgb(colorArray[int(x/clrW) % n][0]);
    }
    else {
      float curStep = x/float(clrW);
      float blendPos = curStep - int(curStep);
      int idx1 = int(curStep) % n;
      float offset = (blendAmt * 0.75 * width/n);
      realx = int(x + width + offset) % width;
      if(blendPos > blendStart) {
        float curBlend = (blendPos - blendStart)/blendAmt;
        int idx2 = (idx1+1) % n;
        int[] rgb1 = hexToRgb(colorArray[idx1][0]);
        int[] rgb2 = hexToRgb(colorArray[idx2][0]);
        //println(curBlend);
        for(int c = 0; c < 3; c++) {
          float curDiff = (rgb2[c] - rgb1[c]) * curBlend;
          rgb1[c] = int(rgb1[c] + curDiff);
        };
        curColor = rgb1;
      }
      else {
        curColor = hexToRgb(colorArray[idx1][0]);
        //curColor[0] = 0;
        //curColor[1] = 0;
        //curColor[2] = 0;
      };
    };
    stroke(curColor[0], curColor[1], curColor[2]);
    line(realx,0,realx,height);
  };
}

void draw () {

}


void mousePressed() {
  String saveStr = "disc" + str(blendAmt) + ".png";
  save(saveStr); 
}
