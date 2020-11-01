class Walker {
  public int x;
  public int y;
  public int w;
  public int h;
  public boolean active;
  public float sticky;

  public Walker (int x, int y, int w, int h, float sticky) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.sticky = sticky;
    this.active = true;
  }

  public void move() {
    float rand = int(random(4));
    if(rand == 0 && this.y > 0) {
          this.y -= 1;
    }
    else if (rand == 1 && this.y < (this.h  - 1)) {
        this.y += 1;
    }
    else if(rand == 2 && this.x > 0 ) {
        this.x -= 1;
    }
    else if(rand == 3 && this.x < (this.w - 1)) {
        this.x += 1;
    };
  }

  public boolean willStick() {
    float rand = random(1.0);
    if(rand < this.sticky) {
      return true;
    }
    else {
      return false;
    }
  }

  public int[] stickSim(int[][] stateArray) {
    int curx = this.x;
    int cury = this.y;
    int curw = this.w;
    int curh = this.h;
    boolean active = this.active;
    int[] curStick = {-1, -1};
    if(stateArray[curx][cury] != 1 && active) {
      int[][] neighbors = { {curx-1, cury}, {curx+1, cury},
                            {curx, cury-1}, {curx, cury+1},
                            {curx-1, cury-1}, {curx-1, cury+1},
                            {curx+1, cury-1}, {curx+1, cury+1}
                          };
      for(int i = 0; i < neighbors.length; i++) {
        int x = neighbors[i][0];
        int y = neighbors[i][1];
        if( x >=0 && x < curw && y >= 0 && y < curh) {
          if(stateArray[x][y] == 1) {
            boolean willStick = this.willStick();
            if(willStick) {
              curStick[0] = x;
              curStick[1] = y;
              this.active = false;
              break;
            };
          };
        };
      };
    };
    return curStick;
  }
}
