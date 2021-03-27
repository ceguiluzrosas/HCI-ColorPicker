// Initialize constants

const rows = 5,
      cols = 5,
      startColor = '(255, 0, 0, 1)',
      minStepSize = 25,
      rgbRandomness = 0.4,
      hueRandomness = 0.1;

var LOGGER = new Logger(),
    time = null;

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

// Initialize variables
let drag = false,
    x = blockWidth/2,
    y = blockHeight/2,
    prevX = blockWidth/2,
    prevY = blockHeight/2,
    originalStepSize = 50,
    stepSize = originalStepSize,
    stepChange = 0.75,
    ditherType = "rgb",
    allSquares = {},
    touchedSquare = false,
    currentSquare = null,
    stage_number = 1,
    color_number = 0;

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

$('input[type=radio][name=display]').change(function() {
  LOGGER.set_displayMode(this.value);
  switch (this.value) {
    case "custom": {
      $(".custom").show();
      $(".not-middle").css('visibility', 'visible'); 
      break;
    }
    case "adobe": {
      $(".custom").hide(); 
      $(".not-middle").css('visibility', 'hidden'); 
      // $(".not-middle").hide() moves middle-square to top left of grid
      break;
    }
  }
});

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
    LOGGER.clicked_back(); 
  } else {
    alert("You either haven't touched a square yet or the step-size is bigger than the original");
  }
})

// User is finished selecting a color
$('#compare').click(function(e){
  let [r,g,b,,] = allSquares[getCenterSquare()];
  $('#userColor').css('background-color', `rgba(${r},${g},${b},1)`);
  $('#userColor').css('border', 'black solid thin');
  $('#targetColor').css('border-right', 'none');
  $('#userColor').css('border-left', 'none');
})

function disable_buttons(pressedStart){
  $("#start").prop("disabled", pressedStart);
  $("#submit").prop("disabled", !pressedStart);
  $("#compare").prop("disabled", !pressedStart);
}

// User has clicked start
$('#start').click(function(e){
  LOGGER.start_round();
  time = new Date().getTime();
  randomTarget();
  LOGGER.set_targetColor(targetColor);
  disable_buttons(true);
})

// Let user pick new color
$('#submit').click(function(e){
  var time_elapsed = new Date().getTime() - time;
  LOGGER.set_submittedColor(allSquares[getCenterSquare()]);
  LOGGER.set_time(time_elapsed);
  LOGGER.stop_round();
  if (LOGGER.all_done()){
    LOGGER.create_file();
  }   
  $("#color-number").text(++color_number);
  disable_buttons(false);
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
  //console.log([x, y]);
  stepSize *= stepChange;
  // Lower bound the step size
  stepSize = Math.max(stepSize, minStepSize);
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

// Display current stage
$("#stage-number").text(stage_number);
$("#color-number").text(color_number);

// Apply Colors to Strip and Block
blockCtx.rect(0, 0, blockWidth, blockHeight);
fillGradient(startColor);
stripCtx.rect(0, 0, stripWidth, stripHeight);
fillStrip();

// Initialize grid
changeGridAccordingToBlock();

// Pick target color
// randomTarget();