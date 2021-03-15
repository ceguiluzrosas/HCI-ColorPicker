// Initialize constants

const rows = 4,
cols = 4,
startColor = '(255, 0, 0, 1)';

// Color Block
const colorBlock = $('#color-block').get(0),
      blockCtx = colorBlock.getContext('2d'),
      blockWidth = colorBlock.width,
      blockHeight = colorBlock.height;

// Color Strip
const colorStrip = $('#color-strip').get(0),
      stripCtx = colorStrip.getContext('2d'),
      stripWidth = colorStrip.width,
      stripHeight = colorStrip.height;

// Color Strip Pointers
// const colorStripLeft = $('#color-strip-left').get(0),
//       stripLeftCtx = colorStrip.getContext('2d'),
//       stripLeftWidth = colorStrip.width,
//       stripLeftHeight = colorStrip.height,
//       colorStripRight = $('#color-strip-right').get(0),
//       stripRightCtx = colorStrip.getContext('2d'),
//       stripRightWidth = colorStrip.width,
//       stripRightHeight = colorStrip.height;


// Initialize variables
let drag = false,
    x = blockWidth/2,
    y = blockHeight/2,
    prevX = blockWidth/2,
    prevY = blockHeight/2,
    originalStepSize = parseInt($('#stepSize').get(0).value),
    stepSize = originalStepSize,
    stepChange = parseFloat($('#stepChange').get(0).value),
    randomness = parseFloat($('#randomness').get(0).value),
    allSquares = {},
    touchedSquare = false,
    currentSquare = null;


// Attach event handlers

// If the user clicks somewhere in the color-block, then enable drag and
// change the color.
$(colorBlock).mousedown(function(e){
  drag = true;
  stepSize = originalStepSize;
  $('#stepSize').val(stepSize);
  x = e.offsetX;
  y = e.offsetY;
  changeGridAccordingToBlock(); 
});

// If the user is/continues dragging in the color-block, then change the color.
$(colorBlock).mouseup(function(){
  drag = false;
});
$(colorBlock).mousemove(function(e){
  if (drag) { 
    x = e.offsetX;
    y = e.offsetY;
    changeGridAccordingToBlock(); 
  }
});

// If the user clicks on the color strip, then change the color block.
$(colorStrip).click(function(e){
  x = e.offsetX;
  y = e.offsetY;
  let imageData = stripCtx.getImageData(x, y, 1, 1).data;
  rgbaColor = 'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',1)';
  console.log(`strip click: ${rgbaColor}`);
  fillGradient(rgbaColor);
});

// The step-size numeric input is just for personal use. It's used
// to determine the appropriate step-size
$('#stepSize').change(function(){
  let number = parseInt(this.value)
  if (number > this.max || number < this.min || number % 1 != 0){
    alert("Value must be an integer between 0 and 50 inclusively.");
  } else {
    originalStepSize = number;
    stepSize = originalStepSize;
    changeGridAccordingToBlock(); 
  }
})

// The step-change numeric input is just for personal use. It's used
// to determine the appropriate change 
$('#stepChange').change(function(){
  let number = parseFloat(this.value)
  if (number >= this.max || number <= this.min){
    alert("Value must be an float between 0 and 1.0 exclusively.");
  } else {
    stepChange = number;
    changeGridAccordingToBlock(); 
  }
})

// The randomness numeric input is just for personal use. It's used
// to determine the amount of randomness
$('#randomness').change(function(){
  let number = parseFloat(this.value)
  if (number > this.max || number < this.min){
    alert("Value must be an float between 0 and 1.0 inclusively.");
  } else {
    randomness = number;
    changeGridAccordingToBlock(); 
  }
})

// Assuming the user has already touched a square, if they 
// want to revert their decision, they can do so. The step size
// will go revert to the previous stepSize and the button will be 
// disabled again.
$('#goBack').click(function(e){
  if (touchedSquare && stepSize * 1/stepChange <= originalStepSize){
    stepSize *= 1/stepChange;
    $('#stepSize').val(stepSize);
    x = prevX;
    y = prevY;
    changeGridAccordingToBlock(); 
  } else {
    alert("You either haven't touched a square yet or the step-size is bigger than the original");
  }
})

// If the user clicks a square, adjust the stepsize, and update the grid. 
// Also keep track of the previous values. 
$('.square').click(function(e){
  touchedSquare = true;
  let [r,g,b] = allSquares[e.target.id];
  changeBlockAccordingToRGB(r, g, b);
  prevX = x;
  prevY = y;
  [x, y] = getXYFromRGB([r,g,b]);
  console.log([x, y]);
  stepSize *= stepChange;
  // Lower bound the step size
  stepSize = Math.max(stepSize, 25);
  $('#stepSize').val(stepSize);
  changeGridAccordingToBlock(r, g, b);
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
    let [r,g,b,,] = allSquares[currentSquare],
        [r_t, g_t, b_t] = targetColor;

    let string = `[Chose] R:${r}, G:${g}, B:${b} --> Hex: ${RGBToHex(r,g,b)}\n`
    string += `[Target] R:${r_t}, G:${g_t}, B:${b_t} --> Hex: ${RGBToHex(r,g,b)}`
    alert(string);
  }
})


// Initialize UI

// Apply Colors to Strip and Block
blockCtx.rect(0, 0, blockWidth, blockHeight);
fillGradient(startColor);
stripCtx.rect(0, 0, stripWidth, stripHeight);
fillStrip();

// Initialize grid
changeGridAccordingToBlock();

// Pick target color
randomTarget();

// changeStripPointers();
