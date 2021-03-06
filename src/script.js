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
    rgbaColor = '',
    originalStepSize = parseInt($('#stepSize').get(0).value),
    stepSize = originalStepSize,
    prevStepSize = originalStepSize,
    allSquares = {},
    touchedSquare = false,
    currentSquare = null,
    rowBeginning = 0,
    rowEnd = 4,
    colBeginning = 0,
    colEnd = 4,
    numOfClicks = 0;

// Initial filling of grid
changeGridAccordingToBlock({'offsetX':blockWidth/2, 'offsetY':blockHeight/2})


// The step-size numeric input is just for personal use. It's used
// to determine the appropriate step-size
$('#stepSize').change(function(){
  var number = parseInt(this.value)
  if (number > this.max || number < this.min || number % 1 != 0){
    alert("Value must be an integer between 0 and 50 inclusively.");
  } else {
    stepSize = number;
    changeGridAccordingToBlock({'offsetX':x, 'offsetY':y})
  }
})

// Changes the grid according to the block that the user selects.
function changeGridAccordingToBlock(e) {
  x = e.offsetX;
  y = e.offsetY;
  var stepX = -stepSize*2;
      stepY = -stepSize*2;
  for (row=rowBeginning; row<rowEnd+1; row++){
    for(col=colBeginning; col<colEnd+1; col++){
      var newX = fancyMath(x,stepX),
          newY = fancyMath(y,stepY),
          [r,g,b] = getRGB(newX, newY);
      allSquares[`b${row}${col}`] = [r,g,b,newX,newY];
      $(`#b${row}${col}`).css('background-color', `rgba(${r},${g},${b},1)`);
      if (stepY + stepSize  > stepSize * 2){ stepY = -stepSize * 2; }
      else {stepY += stepSize;}
    }
    if (stepX + stepSize  > stepSize * 2){ stepX = -stepSize * 2; }
    else {stepX += stepSize;}
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
  console.log(`(${r},${g},${b})`);
  prevStepSize = stepSize;
  stepSize *= 0.75;
  $('#stepSize').val(stepSize);
  changeGridAccordingToBlock({'offsetX':x, 'offsetY':y})
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
function fancyMath(number, stepSize){
  if (number+stepSize > 255) { return 255; } 
  else if (number+stepSize < 0) { return 0; }
  else { return number + stepSize; }
}

// Assuming the user has already touched a square, if they 
// want to revert their decision, they can do so. The step size
// will go revert to the previous stepSize and the button will be 
// disabled again.
$('#goBack').click(function(e){
  if (touchedSquare){
    stepSize = prevStepSize;
    $('#stepSize').val(stepSize);
    x = prevX;
    y = prevY;
    changeGridAccordingToBlock({'offsetX':x, 'offsetY':y})
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
  changeGridAccordingToBlock(e);
}

// If the user is/continues dragging in the color-block, then change the color.
function mousemoveBlock(e) {
  if (drag) {
    changeGridAccordingToBlock(e);
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