// Initialize constants

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

// General constants
const rows = 5,
      cols = 5,
      startColor = '(255, 0, 0, 1)',
      minStepSize = 25,
      rgbRandomness = 0.2,
      hueRandomness = 0.1,
      nTests = 10,
      testColors = randomColors(nTests),
      xStart = blockWidth/2,
      yStart = blockHeight/2,
      displayOrder = shuffleArray(["adobe", "custom"]);

// Set up color tests for each display mode
const stages = displayOrder.map((display) => {
  let order = shuffleArray([...Array(nTests).keys()])
  let colors = order.map(i => testColors[i]);
  return {
      "display": display,
      "colors": colors
  };
})

// Data Logger
let LOGGER = new Logger(stages),
    time = null;

// Initialize variables
let drag = false,
    x = xStart,
    y = yStart,
    prevX = blockWidth/2,
    prevY = blockHeight/2,
    originalStepSize = 50,
    stepSize = originalStepSize,
    stepChange = 0.75,
    allSquares = {},
    touchedSquare = false,
    currentSquare = null,
    currentStage = 0,
    currentTest = 0;

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
  LOGGER.clicked_block();
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
  LOGGER.clicked_strip();
  x = e.offsetX;
  y = e.offsetY;
  let imageData = stripCtx.getImageData(x, y, 1, 1).data;
  rgbaColor = 'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',1)';
  //console.log(`strip click: ${rgbaColor}`);
  fillGradient(rgbaColor);
});

// User is finished selecting a color
$('#compare').click(function(e){
  let [r,g,b,,] = allSquares[getCenterSquare()].slice(0,3);
  compareColor(r,g,b);
})

function disable_buttons(pressedStart){
  $("#start").prop("disabled", pressedStart);
  $("#submit").prop("disabled", !pressedStart);
  $("#compare").prop("disabled", !pressedStart);
}

// User has clicked start
$('#start').click(function(e){
  $("#stage-number").text(currentStage+1);
  $("#color-number").text(currentTest+1);
  setDisplayMode(stages[currentStage]["display"]);
  $('#userColor').css('visibility', 'hidden');
  $('#targetColor').css('border-right', '');
  x = xStart;
  y = yStart;
  fillGradient(startColor);
  changeGridAccordingToBlock();

  let color = stages[currentStage]["colors"][currentTest];
  LOGGER.start_round(currentStage, currentTest, color);
  setTargetColor(color);
  disable_buttons(true);
  time = new Date().getTime();
})

// Let user pick new color
$('#submit').click(function(e){
  let time_elapsed = new Date().getTime() - time;
  disable_buttons(false);
  let [r,g,b,,] = allSquares[getCenterSquare()].slice(0,3);
  compareColor(r,g,b);
  LOGGER.set_submittedColor(allSquares[getCenterSquare()]);
  LOGGER.set_time(time_elapsed);
  LOGGER.stop_round();
  if (currentTest == nTests-1){
    if (currentStage == stages.length-1){
      LOGGER.create_file();
      $("button").prop("disabled", true);
    }
    else {
      currentTest = 0;
      currentStage++;
    }
  }
  else {
    currentTest++;
  }
  if (currentTest == 0){ $('#start').text("Start Test") }
  else { $('#start').text("Next Test") }
})

// If the user clicks a square, adjust the stepsize, and update the grid. 
// Also keep track of the previous values. 
$('.square').click(function(e){
  LOGGER.clicked_grid();
  touchedSquare = true;
  let [r,g,b,,] = allSquares[e.target.id];
  changeBlockAccordingToRGB(r, g, b);
  prevX = x;
  prevY = y;
  [x, y] = getXYFromRGB([r,g,b]);
  stepSize *= stepChange;
  // Lower bound the step size
  stepSize = Math.max(stepSize, minStepSize);
  $('#stepSize').val(stepSize);
  changeGridAccordingToBlock(r, g, b);
});

// As the user hovers over the squares, keep watch of which one
// they are currently hovering over.
$('.square').hover(function(e){
  currentSquare = e.target.id;
})


// Initialize UI
$("#total-test-number").text(testColors.length);

// Display current stage
$("#stage-number").text(currentStage+1);
$("#color-number").text(currentTest+1);
setDisplayMode(stages[currentStage]["display"]);

// Apply Colors to Strip and Block
blockCtx.rect(0, 0, blockWidth, blockHeight);
fillGradient(startColor);
stripCtx.rect(0, 0, stripWidth, stripHeight);
fillStrip();

// Initialize grid
fillGradient(startColor);
changeGridAccordingToBlock();

// Create sample JSON download link for testing
let sampleJSON = {
  "sample": "download"
};
let encodedUri = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sampleJSON));
$("#sample").attr("href", encodedUri);