// Canvas Color Picker based on https://codepen.io/pizza3/pen/BVzYNP


// Generate a random color for the target
function randomTarget(){
  var r = Math.floor(Math.random() * 226),
      g = Math.floor(Math.random() * 226),
      b = Math.floor(Math.random() * 226);
  $('#targetColor').css('background-color', `rgba(${r},${g},${b},1)`);
  targetColor = [r,g,b];
}


// ✨ Color Block Magic ✨

// Retreives the RGB values from the point where the user has
// clicked on the color-block.
function getRGBFromBlock(newX, newY){
  return blockCtx.getImageData(Math.round(newX), Math.round(newY), 1, 1).data;
}

// L2 norm
function getRGBDiff(rgb1, rgb2) {
  [r1,g1,b1] = rgb1;
  [r2,g2,b2] = rgb2;
  return Math.sqrt((r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2)
}

function argMin([k1, v1], [k2, v2]){
  if (v1 < v2) { return k1; }
  else { return k2; }
}

function argMax([k1, v1], [k2, v2]){
  if (v1 > v2) { return k1; }
  else { return k2; }
}

let iterations = 0;

// Partition into four quadrants based on boundary (2D recursive binary search)
function getXYFromRGB(rgb, minX=0, minY=0, maxX=blockWidth-1, maxY=blockHeight-1){
  // console.log(`minX: ${minX}, minY: ${minY}, maxX: ${maxX}, maxY: ${maxY}`);
  iterations++;
  let newMinX = minX, 
      newMinY = minY, 
      newMaxX = maxX, 
      newMaxY = maxY;
  // Check for exact match if window is smaller than 4x4. 
  if ((maxX - minX) < 30 && (maxY - minY) < 30) {
    // Increase the window by one on each side in case of rounding error.
    newMinX = Math.max(0, minX - 1);
    newMaxX = Math.min(blockWidth-1, maxX + 1);
    newMinY = Math.max(0, minY - 1);
    newMaxY = Math.min(blockHeight-1, maxY + 1);
    console.log(`newMinX: ${newMinX}, newMinY: ${newMinY}, newMaxX: ${newMaxX}, newMaxY: ${newMaxY}`);
    // Check each coordinate and keep track of best match in case
    // an exact match isn't found.
    let bestXY, bestDiff;
    for (let _x = newMinX; _x <= newMaxX; _x++) {
      for (let _y = newMinY; _y <= newMaxY; _y++) {
        let color = getRGBFromBlock(_x, _y);
        let diff = getRGBDiff(color, rgb);
        if (diff == 0) { return [_x, _y] };
        if (!bestDiff) {
          bestXY = [_x, _y];
          bestDiff = diff;
        }
        if (diff < bestDiff) { 
          bestXY = [_x, _y];
          bestDiff = diff;
        }
      }
    }
    return bestXY;
  }
  // Find next boundary
  let lt = [minX, Math.round((minY+maxY)/2)],
      rt = [maxX, Math.round((minY+maxY)/2)],
      tp = [Math.round((minX+maxX)/2), minY],
      bm = [Math.round((minX+maxX)/2), maxY],
      ltColor = getRGBFromBlock(...lt),
      rtColor = getRGBFromBlock(...rt),
      tpColor = getRGBFromBlock(...tp),
      bmColor = getRGBFromBlock(...bm),
      ltDiff = getRGBDiff(ltColor, rgb),
      rtDiff = getRGBDiff(rtColor, rgb),
      tpDiff = getRGBDiff(tpColor, rgb),
      bmDiff = getRGBDiff(bmColor, rgb);
  // console.log(`lt: ${lt}, rt: ${rt}, tp: ${tp}, bm: ${bm}`);
  console.log(`(${Math.round((minX+maxX)/2)},${Math.round((minY+maxY)/2)}) = rgba(${getRGBFromBlock(Math.round((minX+maxX)/2),Math.round((minY+maxY)/2))})`);
  if (ltDiff <= rtDiff) { newMaxX = Math.round((minX+maxX)/2)+1; console.log("Going left ...")}
  if (ltDiff >= rtDiff) { newMinX = Math.round((minX+maxX)/2)-1; console.log("Going right ...")}
  if (tpDiff <= bmDiff) { newMaxY = Math.round((minY+maxY)/2)+1; console.log("Going up ...")}
  if (tpDiff >= bmDiff) { newMinY = Math.round((minY+maxY)/2)-1; console.log("Going down ...")}
  // console.log(`newMinX: ${newMinX}, newMinY: ${newMinY}, newMaxX: ${newMaxX}, newMaxY: ${newMaxY}`);
  if (iterations < 10)
  return getXYFromRGB(rgb, newMinX, newMinY, newMaxX, newMaxY);
  else return [x,y];
}

// Color the color-block with gradients.
function fillGradient(rgbaColor){
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
  // Get hue from rgb
  [hue,,] = RGBToHSV(r,g,b);
  [r,g,b] = HSVToRGB(hue,1,1);
  rgbaColor = `rgba(${r},${g},${b},1)`;
  fillGradient(rgbaColor);
}


// ✨ Color Strip Magic ✨

function fillStrip(){
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

// function changeStripPointers(){
//   stripLeftCtx.fillStyle = "rgba(255,255,255,1)";
//   stripLeftCtx.fillRect(x, y, stripLeftWidth, 1);
//   stripRightCtx.fillStyle = "rgba(255,255,255,1)";
//   stripRightCtx.fillRect(x, y, stripRighttWidth, 1);
// }


// ✨ Grid Magic ✨

function boundXY(){
  x = Math.min(Math.max(x, 0), blockWidth-1);
  y = Math.min(Math.max(y, 0), blockHeight-1);
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

function randomMath(number, stepSize){
  return boundColor(Math.round(number + Math.random() * stepSize - stepSize/2));
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
function changeGridAccordingToBlock(r=null, g=null, b=null) {
  const randStep = stepSize*randomness;
  let stepX = -stepSize*2,
      stepY = -stepSize*2;
  // Make sure we aren't out of bounds
  boundXY();
  if (!r && !g && !b) { [r,g,b] = getRGBFromBlock(x, y); }
  // Debugging
  console.log(`visible center block: rgba(${r},${g},${b},1)`);
  console.log(`x: ${x}, y: ${y}`);
  let imageData = blockCtx.getImageData(x, y, 1, 1).data;
  rgbaColor = 'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',1)';
  console.log(`actual center block: ${rgbaColor}`);
  // Assign grid colors
  for (let row=0; row<=rows; row++){
    for (let col=0; col<=rows; col++){
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
  for (let row=0; row<5; row++){
    for (let col=0; col<5; col++){
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
// function componentToHex(c) {
//   let hex = c.toString(16);
//   return hex.length == 1 ? "0" + hex : hex;
// }
// function RGBToHex(r, g, b) {
//   return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
// }

// [RGBA -> HEX] Source: https://stackoverflow.com/questions/49974145/how-to-convert-rgba-to-hex-color-code-using-javascript
function RGBToHex(r, g, b) {
  var hex = ( r | 1 << 8).toString(16).slice(1) +
            ( g | 1 << 8).toString(16).slice(1) +
            ( b | 1 << 8).toString(16).slice(1);
  a = 1
  // multiply before convert to HEX
  a = ((a * 255) | 1 << 8).toString(16).slice(1)
  hex = hex + a;
  return "#" + hex;
}