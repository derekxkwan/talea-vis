class DLA {
  public int w;
  public int h;
  public int num;
  public float sticky;
  public int startx;
  public int starty;
  public Walker[] walkers;
  public int[][] state;

  public DLA(int w, int h, int num, float sticky, int startx, int starty) {
    this.w = w;
    this.h = h;
    this.num = num;
    this.sticky = sticky;
    this.startx = startx;
    this.starty = starty;
    this.state = new int[w][h];
    for(int i = 0; i < w; i++) {
      for(int j = 0; j < h; j++) {
          this.state[i][j] = 0;
      };
    };

    this.walkers = new Walker[num];
    for(int i = 0; i < num; i++) {
      int curx = int(random(w));
      int cury = int(random(h));
      this.walkers[i] = new Walker(curx, cury, w, h, sticky); 
    };
  }

  public float[][] generate(float curMult){
    this.state[this.startx][this.starty] = 1;
    float [][] lineCoords = {};
    int numActive = this.num;
    while(numActive > 0) {
      for(int i =0; i < this.walkers.length; i++) {
        Walker curWalker = this.walkers[i];
        boolean active = curWalker.active;
        if(active){
          int[] stickSim = curWalker.stickSim(this.state);
          if(stickSim[0] >= 0) {
              int wx = curWalker.x;
              int wy = curWalker.y;
              int nx = stickSim[0];
              int ny = stickSim[1];
              float[] curCoord = {nx*curMult, ny*curMult, wx*curMult, wy*curMult};
              this.state[wx][wy] = 1;
              lineCoords = (float[][])append(lineCoords, curCoord);
              numActive--;
          }
          else {
            curWalker.move();
          };
        };
      };
    };
    return lineCoords;
  }
}
