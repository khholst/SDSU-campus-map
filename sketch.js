/* 
Karl Hendrik Holst
Individual project
GEOG 533 Data Visualization @ SDSU

Interactive campus map based on image manipulation
*/


//Images
let backgroundImg;
let buildingsLookupImg;
let buildingsTable;
let sdsuLogo;
let buildingOutlines;
let buildingAreas;

//Zoom variables
let imgW = 900;
let imgH = 675;
let newWidth = 900;
let newHeight = 675;

//Pan variables
let xOffset = 0;
let yOffset = 0;
let newXOffset = 0;
let newYOffset = 0;


let buildingName = "";
let mouseIsDragged = false;



function preload() {
  backgroundImg = loadImage("data/campus_aerial.png");
  buildingsLookupImg = loadImage("data/buildings_grayscale.png");
  buildingsTable = loadTable("data/building_codes.csv");
  sdsuLogo = loadImage("data/sdsu_logo.png");
  buildingOutlines = loadImage("data/building_outlines.png");
  buildingAreas = loadImage("data/building_footprint.png");
}



function setup() {
  textFont("georgia");
  textStyle("italic");
  textAlign(CENTER);
  createCanvas(900, 675);
}



function draw() {
  manipulateImage();
  getCoords();
  drawImages();
  drawBackgroundEllipses();
  extent()
  mouseIsDragged = false;
}



//MOUSE EVENTS
function mouseWheel(event) {
  if ((mouseX > 0) && (mouseX < width) && (mouseY > 0) && (mouseY < height)) { // If cursor is on sketch

    //Fixed directional zoom amount on every scroll activity
    let zoomChange = 0;
    if (event.delta < 0) zoomChange = 0.25;
    else zoomChange = -0.25;

    //Resize on zoom
    newWidth = int(imgW * (1 + zoomChange));
    newHeight = int(imgH * (1 + zoomChange));

    //Zoom on mouse location
    if (newWidth < 3750) {
      newXOffset = xOffset - (zoomChange * (mouseX - xOffset));
      newYOffset = yOffset - (zoomChange * (mouseY - yOffset));
    }
  }
  return false; //Avoid unexpected behaviour
}



function mousePressed() {
  const mouseXToImgWidth = map(mouseX, 0, imgW, 0, width)
  const mouseYToImgHeight = map(mouseY, 0, imgH, 0, height)
  
  const xOffsetToImgWidth = map(xOffset, 0, imgW, 0, width)
  const yOffsetToImgHeight = map(yOffset, 0, imgH, 0, height)
  
  //Get the gray value of click pixel
  const grayValue = (red(buildingsLookupImg.get(mouseXToImgWidth + (-xOffsetToImgWidth), mouseYToImgHeight + (-yOffsetToImgHeight))))
  buildingName = getBldgName(grayValue, buildingsTable)
}



function mouseDragged() {
  const xChange = mouseX - pmouseX;
  const yChange = mouseY - pmouseY;

  if (Math.abs(xChange) > 1 || Math.abs(yChange) > 1) { //Avoid panning on click
    newXOffset = xOffset + xChange;
    newYOffset = yOffset + yChange;
    mouseIsDragged = true;
  }
  checkPanConstraints();
}



function getBldgName (grayValue, table) {
  let buildingName = ""
  for (let i = 1; i < table.getRowCount(); i++) {
    var code = floor(table.get(i, 1))
    if(code == grayValue) {
      buildingName = table.get(i, 0)
    }
  }
  return buildingName;
}



//MAP FEATURES
function drawImages() {
  image(backgroundImg, xOffset, yOffset, imgW, imgH);
  image(buildingOutlines, xOffset, yOffset, imgW, imgH);
  image(buildingAreas, xOffset, yOffset, imgW, imgH);
  image(sdsuLogo, -50, -35);
}



function manipulateImage() {
  if (newWidth <= 3300 && newHeight <= 3225 && newWidth >= 375) {
    imgW = lerp(imgW, newWidth, 0.1)
    imgH = lerp(imgH, newHeight, 0.1);
    if (imgW > 3000) { imgW = 3000; }
    if (imgH > 2250) { imgH = 2250; }
    if (imgW < width) { imgW = width; }
    if (imgH < height) { imgH = height; }

    if (!mouseIsDragged) {
      xOffset = lerp(xOffset, newXOffset, 0.1);
      yOffset = lerp(yOffset, newYOffset, 0.1);
    }
  }

  if (mouseIsDragged) {
    xOffset = newXOffset;
    yOffset = newYOffset;
  }
  checkConstraints();
}



function extent() {
  let xOver = width / imgW;
  let yOver = height / imgH; 

  let extentX = map(-xOffset * xOver, 0, 645, 679, 835);
  let extentY = map(-yOffset * yOver, 0, 439, 4, 97.5);

  if (!((mouseX > 664) && (mouseX < width) && (mouseY < 150) && (mouseY > 0))) { //Lose the extent on hover
    //Extent map
    image(backgroundImg, 679, 5, 218, 143);
    stroke(0, 0, 0, 150);
    strokeWeight(7);
    noFill();
    rectMode(CENTER);
    rect(788, 75, 223, 148, 8);
    stroke(255, 255, 255, 200);
    strokeWeight(3);
    rect(788, 75, 221, 146, 8);

    //Extent rectangle
    let transparency = map(imgW, 900, 1000, 0, 200)
    rectMode(CORNER);
    strokeWeight(1);
    stroke(255, 255, 255, transparency)
    rect(extentX, extentY, 219 * xOver, 148 * yOver, 5);
  }
}



function getCoords() {
  let xMin = -117.079214
  let xMax = -117.065711
  let yMin = 32.770637
  let yMax = 32.779144

  let mouseXToExtent = map(mouseX, 0, imgW, xMin, xMax)
  let mouseYToExtent = map(mouseY, 0, imgH, yMin, yMax)
  
  let xOffsetToExtent = map(xOffset, 0, imgW, xMin, xMax)
  let yOffsetToExtent = map(yOffset, 0, imgH, yMin, yMax)
  
  let coordsX = abs(xMin + mouseXToExtent + (-xOffsetToExtent))
  let coordsY = abs((-yMax + mouseYToExtent + (-yOffsetToExtent)))

  let degreesX = Math.floor(coordsX)
  let minutesX = abs(Math.floor((degreesX - coordsX)*60) + 1)
  let secondsX = (abs(((degreesX - coordsX)*60)) - minutesX)*60
  let secXfixed = secondsX.toFixed(2)
  
  let degreesY = Math.floor(coordsY)
  let minutesY = abs(Math.floor((degreesY - coordsY)*60) + 1)
  let secondsY = (abs(((degreesY - coordsY)*60)) - minutesY)*60
  let secYfixed = secondsY.toFixed(2);

  let coordsConcat = degreesY.toString() + "° " + minutesY.toString() + "' " + secYfixed.toString() + "'' " + " N    " + degreesX.toString() + "° " + minutesX.toString() + "' " + 
  secXfixed.toString() + "'' " + " W";

  return(coordsConcat);
}



function drawBackgroundEllipses() {
  stroke(0, 0, 0, 150)
  strokeWeight(5)
  noFill()
  ellipse(width / 2, height - 4, width + 4, 150)
  ellipse(width / 2, 0, width / 2.5 + 7, 117)
  stroke(255, 255, 255, 200)
  strokeWeight(4)
  fill(255, 128, 0, 100)
  ellipse(width / 2, height, width, 150)
  strokeWeight(3)
  ellipse(width / 2, 0, width / 2.5, 110)
  textSize(35)
  strokeWeight(4)
  stroke(0, 0, 0, 200)
  fill(255, 255, 255, 200)

  //Draw building name
  if (buildingName === "") { text("Click on a building to see info", 450, 655); } 
  else { text(buildingName, 450, 655); }

  //Draw coordinates
  strokeWeight(3)
  textSize(18)
  textFont("helvetica")
  text(getCoords(), width / 2, 27);
  textFont("georgia")
}



function checkConstraints() {
  if (xOffset > 0) { xOffset = 0; }
  else if(xOffset < width - imgW) { xOffset = width - imgW; }

  if (yOffset > 0) { yOffset = 0; }
  else if (yOffset < height - imgH) { yOffset = height - imgH; }
}



function checkPanConstraints() {
  if (newXOffset > 0) { newXOffset = 0; }
  else if (newXOffset < width - imgW) {newXOffset = width - imgW;}
  
  if (newYOffset > 0) { newYOffset = 0 }
  else if (newYOffset < height - imgH) { newYOffset = height - imgH;}
}
                  
