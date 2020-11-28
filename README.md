# talea-vis

project with Anne-Sophie Andersen to visualize Gérard Grisey's Talea three-dimensionally principally using anlysis by Jérôme Baillet (so far)

## talea_csvread.py
- convert part 1 csv files to json
- use `part1_conv.sh` to batch convert

## talea _csvread2.py
- convert part 2 csv files to json

## docs
- the main visualizer of talea using three.js
- `model.html` is the model view
- `index.html` is the landing page with directions
- `details.html` is the details page with text by Anne-Sophie
- `script.js` - the main three.js script
    - `script2.js`, `script3.js`, etc. are older versions of the script (2 being the oldest) that I keep around just in case (not the best way of doing version control when I'm using git, I know...)
- the `data` folder has all the data of the spirals converted from csv using my script(s)   
  
## p5js
- generating textures for the cylinder/tube in `docs`
    - `index.html`/`sketch.js` - spirals for the part1 end of the cylinder/tube

## talea_pt2
- generating texture for part 2 end of cylinder/tube using diffusion limited aggregation
- decided to use Processing for this bit since it's a bit faster than JS (I think)

## talea_cyl
- generating texture for cylinder/tube side in `docs`
    - uses diffusion limited aggregation again and A LOT of magic numbers (to make things line up with talea_pt2)

## bridge
- a separate three.js scene for the bridge for now (Anne-Sophie analysis)

## bridge_tex
- generates gradients for bridge textures
