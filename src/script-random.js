// Color-Block
var colorBlock = $('#color-block').get(0),
    blockCtx = colorBlock.getContext('2d'),
    blockWidth = colorBlock.width,
    blockHeight = colorBlock.height;

$(colorBlock).mousedown(mousedownBlock);
$(colorBlock).mouseup(mouseupBlock);
$(colorBlock).mousemove(mousemoveBlock);

// Color-Strip
var colorStrip = $('#color-strip').get(0),
    stripCtx = colorStrip.getContext('2d'),
    stripWidth = colorStrip.width,
    stripHeight = colorStrip.height;

$(colorStrip).click(clickStrip)

// Apply Colors to Strip and Block
blockCtx.rect(0, 0, blockWidth, blockHeight);
fillGradient();
stripCtx.rect(0, 0, stripWidth, stripHeight);
var grd1 = stripCtx.createLinearGradient(0, 0, 0, blockHeight);
grd1.addColorStop(1, 'rgba(255, 0, 0, 1)');
grd1.addColorStop(0.85, 'rgba(255, 255, 0, 1)');
grd1.addColorStop(0.68, 'rgba(0, 255, 0, 1)');
grd1.addColorStop(0.51, 'rgba(0, 255, 255, 1)');
grd1.addColorStop(0.34, 'rgba(0, 0, 255, 1)');
grd1.addColorStop(0.17, 'rgba(255, 0, 255, 1)');
grd1.addColorStop(0, 'rgba(255, 0, 0, 1)');
stripCtx.fillStyle = grd1;
stripCtx.fill();

// Our main variables
var drag = false,
    x = blockWidth/2,
    y = blockHeight/2,
    prevX = blockWidth/2,
    prevY = blockHeight/2,
    rgbaColor = '(255, 0, 0, 1)',
    originalStepSize = parseInt($('#stepSize').get(0).value),
    stepChange = parseFloat($('#stepChange').get(0).value),
    stepSize = originalStepSize,
    allSquares = {},
    touchedSquare = false,
    currentSquare = null,
    rowBeginning = 0,
    rowEnd = 4,
    colBeginning = 0,
    colEnd = 4,
    numOfClicks = 0;

// Initial filling of grid
changeGridAccordingToBlock(blockWidth/2, blockHeight/2);


// The step-size numeric input is just for personal use. It's used
// to determine the appropriate step-size
$('#stepSize').change(function(){
  var number = parseInt(this.value)
  if (number > this.max || number < this.min || number % 1 != 0){
    alert("Value must be an integer between 0 and 50 inclusively.");
  } else {
    stepSize = number;
    changeGridAccordingToBlock(x, y);
  }
})

// The step-change numeric input is just for personal use. It's used
// to determine the appropriate change 
$('#stepChange').change(function(){
  var number = parseFloat(this.value)
  if (number >= this.max || number <= this.min){
    alert("Value must be an float between 0 and 1.0 exclusively.");
  } else {
    stepChange = number;
    changeGridAccordingToBlock(x, y);
  }
})

// Changes the grid according to the block that the user selects.
function changeGridAccordingToBlock(x, y, r=null, g=null, b=null) {
  var stepX = -stepSize*2,
      stepY = -stepSize*2,
      randStep = stepSize/2;
  if (!r && !g && !b) {[r,g,b] = getRGB(x, y);}
  console.log(`center block: rgba(${r},${g},${b},1)`);
  for (row=rowBeginning; row<rowEnd+1; row++){
    for(col=colBeginning; col<colEnd+1; col++){
      // Get exact RGB value
      var newX = fancyMath(x, stepX),
          newY = fancyMath(y, stepY),
          [exactR,exactG,exactB] = getRGB(newX, newY);
      // Randomly dither the RGB value
      var randR = randomMath(exactR, randStep),
          randG = randomMath(exactG, randStep),
          randB = randomMath(exactB, randStep);
      // Don't randomize the center square
      if (isCenterSquare(row, col)) { allSquares[`b${row}${col}`] = [r, g, b,newX,newY] }
      else { allSquares[`b${row}${col}`] = [randR,randG,randB,newX,newY] }
      // Increment Y step
      if (stepY + stepSize  > stepSize * 2){ stepY = -stepSize * 2; }
      else { stepY += stepSize; }
    }
    // Increment X step
    if (stepX + stepSize  > stepSize * 2){ stepX = -stepSize * 2; }
    else {stepX += stepSize;}
  }
  updateSquares();
}

function isCenterSquare(row, col){
  return rowEnd%2 == 0 && colEnd%2 == 0 && rowEnd/2 == row && colEnd/2 == col;
}

function updateSquares(){
  for (let square in allSquares) {
    [r,g,b,_,_] = allSquares[square];
    $(`#${square}`).css('background-color', `rgba(${r},${g},${b},1)`);
  }
}

// Changes the grid layout by hiding some squares and other not.
function ChangeGridLayout(){
  for (row=0; row<5; row++){
    for(col=0; col<5; col++){
      if (row >= rowBeginning && row <= rowEnd && col >= colBeginning && col <= colEnd){
        $(`#b${row}${col}`).css('visibility', 'visible');
      } else {
        $(`#b${row}${col}`).css('visibility', 'hidden');
      }
    }
  }
}

// If the user clicks a square, adjust the stepsize, and update the grid. 
// Also keep track of the previous values. 
$('.square').click(function(e){
  touchedSquare = true;
  var [r,g,b,oldX,oldY] = allSquares[e.target.id];
  prevX = x;
  prevY = y;
  x = oldX;
  y = oldY;
  // Use r,g,b for collecting data
  console.log(`square click: (${r},${g},${b})`);
  stepSize *= stepChange;
  $('#stepSize').val(stepSize);
  changeGridAccordingToBlock(x, y, r, g, b);
});

// As the user hovers over the squares, keep watch of which one
// they are currenlty hovering over.
$('.square').hover(function(e){
  currentSquare = e.target.id;
})

// If the presses the spacebar, alert them of the RGB + hex-code values
// of the currently selected square.
$('body').keyup(function(e){
  if(e.keyCode == 32){
    // user has pressed space
    var [r,g,b,_,_] = allSquares[currentSquare];
    alert(`R:${r}, G:${g}, B:${b} --> Hex: ${rgbToHex(r,g,b)}`);
  }
})

// Retreives the RGB values from the point where the user has
// clicked on the color-block.
function getRGB(newX, newY){
  return blockCtx.getImageData(newX, newY, 1, 1).data;
}

// Ensures that RGB values are within range of 0 and 255
function limitRange(n) {
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

// Assuming the user has already touched a square, if they 
// want to revert their decision, they can do so. The step size
// will go revert to the previous stepSize and the button will be 
// disabled again.
$('#goBack').click(function(e){
  if (touchedSquare && stepSize * 1/stepChange <= originalStepSize){
    stepSize *= 1/stepChange;
    $('#stepSize').val(stepSize);
    changeGridAccordingToBlock(prevX, prevY);
  } else {
    alert("You either haven't touched a square yet or the step-size is bigger than the original");
  }
})

// Source: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// If the user clicks somewhere in the color-block, then enable drag and
// change the color.
function mousedownBlock(e) {
  drag = true;
  stepSize = originalStepSize;
  $('#stepSize').val(stepSize);
  changeGridAccordingToBlock(e.offsetX, e.offsetY);
}

// If the user is/continues dragging in the color-block, then change the color.
function mousemoveBlock(e) {
  if (drag) {
    changeGridAccordingToBlock(e.offsetX, e.offsetY);
  }
}

// If the user stops dragging in the color-block and lets go off their
// mouse, then disable drag.
function mouseupBlock(e) {
  drag = false;
}

// If the user clicks on the color strip, then change the color block.
function clickStrip(e) {
  x = e.offsetX;
  y = e.offsetY;
  var imageData = stripCtx.getImageData(x, y, 1, 1).data;
  rgbaColor = 'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',1)';
  console.log(`strip click: ${rgbaColor}`);
  fillGradient();
}

// Color the color-block with gradients.
function fillGradient() {
  blockCtx.fillStyle = rgbaColor;
  blockCtx.fillRect(0, 0, blockWidth, blockHeight);

  var grdWhite = stripCtx.createLinearGradient(0, 0, blockWidth, 0);
  grdWhite.addColorStop(0, 'rgba(255,255,255,1)');
  grdWhite.addColorStop(1, 'rgba(255,255,255,0)');
  blockCtx.fillStyle = grdWhite;
  blockCtx.fillRect(0, 0, blockWidth, blockHeight);

  var grdBlack = stripCtx.createLinearGradient(0, 0, 0, blockHeight);
  grdBlack.addColorStop(0, 'rgba(0,0,0,0)');
  grdBlack.addColorStop(1, 'rgba(0,0,0,1)');
  blockCtx.fillStyle = grdBlack;
  blockCtx.fillRect(0, 0, blockWidth, blockHeight);
}