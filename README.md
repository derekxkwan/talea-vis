# talea-vis

project with Anne-Sophie Andersen to visualize Gérard Grisey's Talea three-dimensionally principally using anlysis by Jérôme Baillet (so far)

## talea_csvread.py
- convert part 1 csv files to json
- use `part1_conv.sh` to batch convert

## talea _csvread2.py
- convert part 2 csv files to json

## docs
- the main visualizer of talea using three.js
- `script.js` - the main three.js script
    - `script2.js`, `script3.js`, etc. are older versions of the script (2 being the oldest) that I keep around just in case (not the best way of doing version control when I'm using git, I know...)
- the `data` folder has all the data of the spirals converted from csv using my script(s)   
  
## p5js
- generating textures for the cylinder/tube in `docs` (haven't figured out the texturing yet) using p5js
    - `index.html`/`sketch.js` - spirals for the part1 end of the cylinder/tube
    - `index2.html`/`sketch2.js` - gradient for the side of the cylinder/tube
