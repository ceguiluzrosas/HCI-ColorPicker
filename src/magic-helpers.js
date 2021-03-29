// Canvas Color Picker (i.e. adobe mode) based on https://codepen.io/pizza3/pen/BVzYNP
function setDisplayMode(display){
  switch (display) {
    case "custom": {
      $(".custom").show();
      $(".not-middle").css('visibility', 'visible'); 
      break;
    }
    case "adobe": {
      $(".custom").hide(); 
      $(".not-middle").css('visibility', 'hidden'); 
      break;
    }
  }
}

// Fisher-Yates (aka Knuth) Shuffle
// Source: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(arr){
  let array = [...arr];
  let currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


// Generate a random color for the target
function randomColors(n){
  let colors = []
  for (let i=0; i<n; i++) {
    colors.push([
      Math.floor(Math.random() * 226), // r
      Math.floor(Math.random() * 226), // g
      Math.floor(Math.random() * 226)  // b
    ]);
  }
  return colors;
}

function setTargetColor(color){
  let [r,g,b] = color;
  $('#targetColor').css('visibility', 'visible');
  $('#targetColor').css('background-color', `rgba(${r},${g},${b},1)`);
  targetColor = [r,g,b];
}

function compareColor(r,g,b){
  $('#userColor').css('visibility', 'visible');
  $('#userColor').css('background-color', `rgba(${r},${g},${b},1)`);
  $('#userColor').css('border', 'black solid thin');
  $('#targetColor').css('border-right', 'none');
  $('#userColor').css('border-left', 'none');
}


// ✨ Color Block Magic ✨

// Retreives the RGB values from the point where the user has
// clicked on the color-block.
function getRGBFromBlock(newX, newY){
  [newX, newY] = boundXY(newX, newY);
  return blockCtx.getImageData(Math.round(newX), Math.round(newY), 1, 1).data;
}

// L2 norm
function getRGBDiff(rgb1, rgb2){
  [r1,g1,b1] = rgb1;
  [r2,g2,b2] = rgb2;
  return Math.sqrt((r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2)
}

// Find [x,y] location on canvas given [r,g,b], ASSUMING THAT hue of canvas is set correctly.
function getXYFromRGB(rgb){
  if (rgb == [0,0,0]) { return [0, blockHeight-1]; }
  let [,s,v] = RGBToHSV(...rgb);
  // Estimate x,y location using s,v values
  est_x = Math.round((s) * (blockWidth-1));
  est_y = Math.round((1-v) * (blockHeight-1));
  // Check x +/- 1 , y +/- 1 because of rounding 
  let bestXY, bestDiff;
  for (let _x = est_x-1; _x <= est_x+1; _x++) {
    for (let _y = est_y-1; _y <= est_y+1; _y++) {
      let color = getRGBFromBlock(_x, _y);
      let diff = getRGBDiff(color, rgb);
      if (diff == 0) { return boundXY(_x, _y) };
      if (!bestDiff) {
        bestXY = boundXY(_x, _y);
        bestDiff = diff;
      }
      if (diff < bestDiff) { 
        bestXY = boundXY(_x, _y);
        bestDiff = diff;
      }
    }
  }
  return bestXY;
}

// Color the color-block with gradients.
function fillGradient(rgbaColor){
  blockCtx.clearRect(0, 0, blockWidth, blockHeight);
  blockCtx.fillStyle = rgbaColor;
  blockCtx.fillRect(0, 0, blockWidth, blockHeight);

  // Make sure the corner is white
  blockCtx.fillStyle = 'rgba(255,255,255,1)';
  blockCtx.fillRect(0, 0, 1, 1);

  let grdWhite = stripCtx.createLinearGradient(0, 0, blockWidth, 0);
  grdWhite.addColorStop(0, 'rgba(255,255,255,1)');
  grdWhite.addColorStop(1, 'rgba(255,255,255,0)');
  blockCtx.fillStyle = grdWhite;
  blockCtx.fillRect(0, 0, blockWidth, blockHeight);

  let grdBlack = stripCtx.createLinearGradient(0, 0, 0, blockHeight);
  grdBlack.addColorStop(0, 'rgba(0,0,0,0)');
  grdBlack.addColorStop(1, 'rgba(0,0,0,1)');
  blockCtx.fillStyle = grdBlack;
  blockCtx.fillRect(0, 0, blockWidth, blockHeight);
}

// Set color-block color by extracting hue
function changeBlockAccordingToRGB(r, g, b){
  // Get hue and saturation from rgb
  let [h,s,] = RGBToHSV(r,g,b);
  if (s == 0) { [r,g,b] = [0,0,0]; }
  else { [r,g,b] = HSVToRGB(h,1,1); }
  rgbaColor = `rgba(${r},${g},${b},1)`;
  fillGradient(rgbaColor);
}


// ✨ Color Strip Magic ✨

function fillStrip(){
  stripCtx.clearRect(0, 0, stripWidth, stripHeight);
  let gradient = stripCtx.createLinearGradient(0, 0, 0, blockHeight);
  gradient.addColorStop(1, 'rgba(255, 0, 0, 1)');
  gradient.addColorStop(0.85, 'rgba(255, 255, 0, 1)');
  gradient.addColorStop(0.68, 'rgba(0, 255, 0, 1)');
  gradient.addColorStop(0.51, 'rgba(0, 255, 255, 1)');
  gradient.addColorStop(0.34, 'rgba(0, 0, 255, 1)');
  gradient.addColorStop(0.17, 'rgba(255, 0, 255, 1)');
  gradient.addColorStop(0, 'rgba(255, 0, 0, 1)');
  stripCtx.fillStyle = gradient;
  stripCtx.fill();
}

// ✨ Grid Magic ✨

function boundXY(_x,_y){
  return [Math.min(Math.max(_x, 0), blockWidth-1), Math.min(Math.max(_y, 0), blockHeight-1)];
}

// Ensures that RGB values are within range of 0 and 255
function boundColor(n){
  if (n > 255) { return 255; } 
  else if (n < 0) { return 0; }
  else { return n; }
}

function fancyMath(number, stepSize){
  return boundColor(number + stepSize);
}

function randomMath(number, randomness){
  let randStep = stepSize * randomness;
  return boundColor(Math.round(number + Math.random() * randStep - randStep/2));
}

// RGB input and output
function rgbDither(rgb){
  let [r,g,b] = rgb,
      randomness = rgbRandomness;
  return [
    randomMath(r, randomness),
    randomMath(g, randomness),
    randomMath(b, randomness)
  ];
}

// RGB input and output
function hueDither(rgb){
  let [h,s,v] = RGBToHSV(...rgb),
      randomness = hueRandomness * s;
  let _h = h + (Math.random() * randomness - randomness/2);
  if (_h < 0) { _h++; }
  return HSVToRGB(_h,s,v);
}

// First randomly dither the color's rgb value
// Then, based on saturation, dither the color's hue 
// (higher saturation colors have more hue dithering)
function dither(rgb){
  return hueDither(rgbDither(rgb));
}

// Get the exact RGB value and then randomly dither the hue
function getSquareColor(x, y, stepX, stepY){
  let _x = fancyMath(x, stepX),
      _y = fancyMath(y, stepY),
      [_r,_g,_b] = getRGBFromBlock(_x,_y);
  let [r,g,b] = dither([_r,_g,_b]);
  return [r,g,b,_x,_y];
}

function getCenterSquare(){
  return `b${(rows-1)/2}${(cols-1)/2}`;
}

function isCenterSquare(row, col){
  return rows%2 == 1 && cols%2 == 1 && `b${row}${col}` == getCenterSquare();
}

function updateSquares(){
  for (let square in allSquares) {
    let [r,g,b,,] = allSquares[square];
    $(`#${square}`).css('background-color', `rgba(${r},${g},${b},1)`);
  }
}

function incrementStep(step){
  if (step + stepSize  > stepSize * 2) { return -stepSize * 2; }
  else { return step + stepSize; }
}

// Changes the grid according to the block that the user selects.
function changeGridAccordingToBlock(r=null, g=null, b=null){
  // Make sure we aren't out of bounds
  [x,y] = boundXY(x,y);
  if (!r && !g && !b) { [r,g,b] = getRGBFromBlock(x, y); }
  let stepX = -stepSize*2,
      stepY = -stepSize*2;
  // Assign grid colors
  for (let row=0; row<rows; row++){
    for (let col=0; col<cols; col++){
      // Assign square color, but don't randomize the center square
      if (isCenterSquare(row, col)) { allSquares[`b${row}${col}`] = [r,g,b,x,y]; }
      else { allSquares[`b${row}${col}`] = getSquareColor(x,y,stepX, stepY); }
      stepY = incrementStep(stepY);
    }
    stepX = incrementStep(stepX);
  }
  updateSquares();
}

// Changes the grid layout by hiding some squares and other not.
function changeGridLayout(){
  for (let row=0; row<5; row++){
    for (let col=0; col<5; col++){
      if (row>=0 && row<rows && col>=0 && col<cols) { $(`#b${row}${col}`).css('visibility', 'visible'); } 
      else { $(`#b${row}${col}`).css('visibility', 'hidden'); }
    }
  }
}


// ✨ Conversion Magic ✨

// RGB <-> HSV conversions 
// Source: https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
// 0 <= h, s, v <= 1
function HSVToRGB(h, s, v){
  let r, g, b, i, f, p, q, t;
  if (arguments.length === 1) { s = h.s, v = h.v, h = h.h; }
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  r = Math.round(r * 255);
  g = Math.round(g * 255);
  b = Math.round(b * 255);
  return [r,g,b];
}
function RGBToHSV(r, g, b){
  if (arguments.length === 1) { g = r.g, b = r.b, r = r.r; }
  let max = Math.max(r, g, b), 
      min = Math.min(r, g, b),
      d = max - min,
      h,
      s = (max === 0 ? 0 : d / max),
      v = max / 255;
  switch (max) {
    case min: h = 0; break;
    case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
    case g: h = (b - r) + d * 2; h /= 6 * d; break;
    case b: h = (r - g) + d * 4; h /= 6 * d; break;
  }
  return [h,s,v];
}

// [RGBA -> HEX] Source: https://stackoverflow.com/questions/49974145/how-to-convert-rgba-to-hex-color-code-using-javascript
function RGBToHex(r, g, b){
  var hex = ( r | 1 << 8).toString(16).slice(1) +
            ( g | 1 << 8).toString(16).slice(1) +
            ( b | 1 << 8).toString(16).slice(1);
  a = 1
  // multiply before convert to HEX
  a = ((a * 255) | 1 << 8).toString(16).slice(1)
  hex = hex + a;
  return "#" + hex;
}