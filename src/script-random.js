// Initialize constants

// Color Block
const colorBlock = $('#color-block').get(0),
      blockCtx = colorBlock.getContext('2d'),
      blockWidth = colorBlock.width,
      blockHeight = colorBlock.height,
      colorBlockCursor = $('#color-block-cursor').get(0),
      cursorCtx = colorBlockCursor.getContext('2d');

// Color Strip
const colorStrip = $('#color-strip').get(0),
      stripCtx = colorStrip.getContext('2d'),
      stripWidth = colorStrip.width,
      stripHeight = colorStrip.height,
      colorStripLeft = $('#color-strip-left').get(0),
      leftCtx = colorStripLeft.getContext('2d'),
      colorStripRight = $('#color-strip-right').get(0),
      rightCtx = colorStripRight.getContext('2d'),
      stripCursorWidth = colorStripLeft.width,
      stripCursorHeight = colorStripLeft.height;

// General constants
const rows = 5,
      cols = 5,
      startColor = '(255, 0, 0, 1)',
      minStepSize = 5,
      rgbRandomness = 0,
      hueRandomness = 0,
      nTests = 10,
      testColors = randomColors(nTests),
      xStart = blockWidth/2,
      yStart = blockHeight/2,
      cursorSize = 5,
      cursorThreshold = 0.7;

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
let blockDrag = false,
    stripDrag = false,
    x = xStart,
    y = yStart,
    xStrip = stripWidth/2,
    yStrip = stripHeight/2,
    prevX = x,
    prevY = y,
    originalStepSize = 40,
    stepSize = originalStepSize,
    stepChange = 0.75,
    allSquares = {},
    currentStage = 0,
    currentTest = 0;

// If the user clicks somewhere in the color-block, then enable drag and
// change the color.
$(colorBlock).mousedown(function(e){
  // Clear any existing cursor
  clearBlockCursor();
  blockDrag = true;
  stepSize = originalStepSize;
  $('#stepSize').val(stepSize);
  x = e.offsetX;
  y = e.offsetY;
});

// If the user is/continues dragging in the color-block, then change the color.
$(colorBlock).mouseup(function(e){
  changeGridAccordingToBlock(LOGGER); 
  LOGGER.clicked_block();
  blockDrag = false;
  // Draw new cursor
  drawBlockCursor(x,y);
});

$(colorBlock).mousemove(function(e){
  if (blockDrag) { 
    x = e.offsetX;
    y = e.offsetY;
    changeGridAccordingToBlock(); 
  }
});

// If the user clicks somewhere in the color strip, then enable drag and
// change the color block.
$(colorStrip).mousedown(function(e){
  stripDrag = true;
  xStrip = e.offsetX;
  yStrip = Math.min(stripHeight-1, Math.max(0, e.offsetY));
  // Draw new cursor
  clearStripCursor();
  drawStripCursor(yStrip);
});

// If the user is/continues dragging in the color strip, then change the color block.
$(colorStrip).mouseup(function(e){
  LOGGER.clicked_strip();
  let [r,g,b] = stripCtx.getImageData(xStrip, yStrip, 1, 1).data;
  rgbaColor = `rgba(${r},${g},${b},1)`;
  fillGradient(rgbaColor);
  stripDrag = false;
  changeGridAccordingToBlock(LOGGER);
  // Draw new cursor
  clearStripCursor();
  drawStripCursor(yStrip);
});

$(colorStrip).mousemove(function(e){
  if (stripDrag) { 
    xStrip = e.offsetX;
    yStrip = Math.min(stripHeight-1, Math.max(0, e.offsetY));
    let [r,g,b] = stripCtx.getImageData(xStrip, yStrip, 1, 1).data;
    rgbaColor = `rgba(${r},${g},${b},1)`;
    fillGradient(rgbaColor);
    // Draw new cursor
    clearStripCursor();
    drawStripCursor(yStrip);
  }
});

// User is comparing the selected color to the target color
$('#compare').click(function(e){
  LOGGER.clicked_compare();
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
  stepSize = originalStepSize;
  fillGradient(startColor);
  changeGridAccordingToBlock();
  clearStripCursor();
  clearBlockCursor();
  drawBlockCursor(x,y);

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
      setTimeout(function (){
        $('#targetColor').css('visibility', 'hidden');
        $('#userColor').css('visibility', 'hidden');
        currentTest = 0;
        currentStage++;
        setDisplayMode(stages[currentStage]["display"]);
        $("#stage-number").text(currentStage+1);
        $("#color-number").text(currentTest+1);
      }, 1000);
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
  if (stages[currentStage]["display"] == "custom") {
    LOGGER.clicked_grid();
    let [r,g,b,,] = allSquares[e.target.id];
    changeBlockAccordingToRGB(r, g, b);
    prevX = x;
    prevY = y;
    [x, y] = getXYFromRGB([r,g,b]);

    // Draw new cursors
    yStrip = getYFromRGB([r,g,b]);
    clearStripCursor();
    drawStripCursor(yStrip);
    clearBlockCursor();
    drawBlockCursor(x,y);

    stepSize *= stepChange;
    // Lower bound the step size
    stepSize = Math.max(stepSize, minStepSize);
    $('#stepSize').val(stepSize);
    changeGridAccordingToBlock(LOGGER, r, g, b);
  }
});

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

// Draw cursor
drawBlockCursor(x,y);

// Create sample JSON download link for testing
let sampleJSON = {
  "sample": "download"
};
let encodedUri = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sampleJSON));
$("#sample").attr("href", encodedUri);