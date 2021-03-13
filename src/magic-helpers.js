// Canvas Color Picker based on https://codepen.io/pizza3/pen/BVzYNP


// ✨ Color Block Magic ✨

// Retreives the RGB values from the point where the user has
// clicked on the color-block.
function getRGBFromBlock(newX, newY){
  return blockCtx.getImageData(newX, newY, 1, 1).data;
}

// Color the color-block with gradients.
function fillGradient(rgbaColor){
  blockCtx.fillStyle = rgbaColor;
  blockCtx.fillRect(0, 0, blockWidth, blockHeight);

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
  // Get hue from rgb
  [hue,,] = RGBToHSV(r,g,b);
  [r,g,b] = HSVToRGB(hue,1,1);
  rgbaColor = `rgba(${r},${g},${b},1)`;
  fillGradient(rgbaColor);
}

// Set color-block color
function changeBlockAccordingToRGB(r, g, b){
  // Get hue from rgb
  [hue,,] = RGBToHSV(r,g,b);
  [r,g,b] = HSVToRGB(hue,1,1);
  rgbaColor = `rgba(${r},${g},${b},1)`;
  fillGradient(rgbaColor);
}


// ✨ Grid Magic ✨

// Ensures that RGB values are within range of 0 and 255
function limitRange(n){
  if (n > 255) { return 255; } 
  else if (n < 0) { return 0; }
  else { return n; }
}

function fancyMath(number, stepSize){
  return limitRange(number + stepSize);
}

function randomMath(number, stepSize,){
  return limitRange(Math.round(number + Math.random() * stepSize - stepSize/2));
}

// Get the exact RGB value and then randomly dither the RGB value by randStep
function getSquareColor(x, y, stepX, stepY, randStep) {
  let newX = fancyMath(x, stepX),
      newY = fancyMath(y, stepY),
      [exactR,exactG,exactB] = getRGBFromBlock(newX, newY),
      randR = randomMath(exactR, randStep),
      randG = randomMath(exactG, randStep),
      randB = randomMath(exactB, randStep);
  return [randR,randG,randB,newX,newY];
}

function isCenterSquare(row, col){
  return rows%2 == 0 && cols%2 == 0 && rows/2 == row && cols/2 == col;
}

function updateSquares(){
  for (let square in allSquares) {
    [r,g,b,,] = allSquares[square];
    $(`#${square}`).css('background-color', `rgba(${r},${g},${b},1)`);
  }
}

function incrementStep(step){
  if (step + stepSize  > stepSize * 2) { return -stepSize * 2; }
  else { return step + stepSize; }
}

// Changes the grid according to the block that the user selects.
function changeGridAccordingToBlock(x, y, r=null, g=null, b=null) {
  const randStep = stepSize/2;
  let stepX = -stepSize*2,
      stepY = -stepSize*2;
  if (!r && !g && !b) { [r,g,b] = getRGBFromBlock(x, y); }
  console.log(`center block: rgba(${r},${g},${b},1)`);
  console.log(`x: ${x}, y: ${y}`);
  for (row=0; row<=rows; row++){
    for(col=0; col<=rows; col++){
      // Assign square color, but don't randomize the center square
      if (isCenterSquare(row, col)) { allSquares[`b${row}${col}`] = [r,g,b,x,y]; }
      else { allSquares[`b${row}${col}`] = getSquareColor(x,y,stepX, stepY,randStep); }
      stepY = incrementStep(stepY);
    }
    stepX = incrementStep(stepX);
  }
  updateSquares();
}

// Changes the grid layout by hiding some squares and other not.
function changeGridLayout(){
  for (row=0; row<5; row++){
    for(col=0; col<5; col++){
      if (row>=0 && row<=rows && col>=0 && col<=cols) { $(`#b${row}${col}`).css('visibility', 'visible'); } 
      else { $(`#b${row}${col}`).css('visibility', 'hidden'); }
    }
  }
}


// ✨ Conversion Magic ✨

// RGB <-> HSV conversions 
// Source: https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
function HSVToRGB(h, s, v) {
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
function RGBToHSV(r, g, b) {
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



// Hex conversions
// Source: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function componentToHex(c) {
  let hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}
function RGBToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}