//Variables
var mouseX, mouseY, mouseDown = 0, grabbed = false;
var state = "TESTING";
var lastDir = -20, center = {};
var trueCenter = { x: 0, y: 0};
var canvasPos;

canvas = document.getElementsByClassName("wheel-canvas")[0];
canvasContainer = document.getElementsByClassName("wheel")[0];
ctx = canvas.getContext('2d');
ctx.shadowColor = 'black';

// mouse events
document.onmousedown = () => { mouseDown = 1 };
document.onmouseup = () => { mouseDown  = 0 };
document.onmousemove = (e) => {
	mouseX = e.pageX;
	mouseY = e.pageY;
}

//touch events
document.addEventListener('touchstart', handleTouch, false);
document.addEventListener('touchend', handleTouch, false);
document.addEventListener('touchmove', handleTouch, false);

function handleTouch(e){
	if (e.type == 'touchstart'){ mouseDown = 1 };
	if (e.type == 'touchend'){ mouseDown = 0 };

	var evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
	var touch = evt.touches[0] || evt.changedTouches[0];
	mouseX = touch.pageX;
	mouseY = touch.pageY;
}

renderLoop();
function renderLoop(timestamp){
	//adjust the canvas to match viewport
	canvasPos = canvasContainer.getBoundingClientRect();
	canvas.width = canvas.height = canvasPos.width;
	center.x = center.y = canvasPos.width * 0.5;
	trueCenter.x = canvasPos.x + center.x;
	trueCenter.y = canvasPos.y + center.y;

	//obtain variables for later use
	radius = canvasPos.width * 0.37;
	thickness = 0.45 * radius,
	halfThickness = thickness / 2;

	mouseDist = dist(mouseX, mouseY, trueCenter.x, trueCenter.y);
	mouseDir = getDir(mouseX, mouseY, trueCenter.x, trueCenter.y);
	mouseIn = mouseDist < radius + halfThickness && mouseDist > radius - halfThickness;

	//Background and Shadow
	ctx.fillStyle = '#222';
	ctx.shadowColor = 'black';
	ctx.shadowBlur = radius * 0.06;
	ctx.fillRect(0, 0, canvas.width, canvas.height)
	drawShadow();

	//Hue ring
	ctx.shadowBlur = 0;
	drawHueRing();

	//Slider(s)
	ctx.strokeStyle = ctx.fillStyle;
	if(mouseIn){
		inSliderRange = (mouseDir < lastDir + 4 && mouseDir > lastDir - 4) || mouseDir == lastDir;
		if(inSliderRange && mouseDown){ grabbed = true };
		if(!mouseDown){ grabbed = false };
		if(grabbed && state == "TESTING"){ 
			lastDir = mouseDir;
		};
	}else{
		grabbed = false;
	}
	drawSlider(center.x, center.y, radius+halfThickness, radius-halfThickness, lastDir, radius*0.07, '#222', radius*0.06);

	//Color indicator
	ctx.fillStyle = `hsl(${lastDir}, 100%, 50%)`;
	ctx.shadowColor = ctx.fillStyle;
	ctx.shadowBlur = radius * 0.04;
	ctx.beginPath();
	ctx.ellipse(center.x, center.y, (radius-halfThickness)*0.95, (radius-halfThickness)*0.95, 0, 0, 360)
	ctx.fill()
	ctx.closePath();
	
	window.requestAnimationFrame(renderLoop);
}

function drawHueRing(){
	for(var angle=0; angle<=360; angle+=1){

		var startAngle = (angle-2)*Math.PI/180;
		var endAngle = angle * Math.PI/180;

		ctx.beginPath();
		ctx.arc(center.x, center.y, radius+(thickness/radius), startAngle, endAngle, false);
		ctx.lineWidth = thickness;
		ctx.strokeStyle = 'hsl('+(angle)+', 100%, 50%)';
		ctx.stroke();
	}
}

function drawShadow(){
	ctx.beginPath();
	ctx.ellipse(center.x, center.y, radius+halfThickness, radius+halfThickness, 0, 0, 360)
	ctx.closePath();
	ctx.fill()
}

function drawSlider(x, y, len, len1, dir, width, color, r){
	dir *= Math.PI/180;
	let startPos = {
		x: x+Math.cos(dir)*(len - r), 
		y: y+Math.sin(dir)*(len - r),
	}
	let endPos = {
		x: x+Math.cos(dir)*(len1 + r), 
		y: y+Math.sin(dir)*(len1 + r),
	}

	ctx.fillStyle = color;
	ctx.strokeStyle = color;

	ctx.beginPath();
	ctx.lineWidth = width;
	ctx.moveTo(startPos.x, startPos.y);
	ctx.lineTo(endPos.x, endPos.y);
	ctx.closePath()
	ctx.stroke(); 

	ctx.beginPath();
	ctx.ellipse(startPos.x, startPos.y, width/2, width/2, 0, 0, 360)
	ctx.ellipse(endPos.x, endPos.y, width/2, width/2, 0, 0, 360)
	ctx.closePath()
	ctx.fill(); 
}

function dist(x1, y1, x2, y2){
	let x = x1 - x2;
	let y = y1 - y2;
	return Math.sqrt(x * x + y * y);
}

function getDir(ax, ay, bx, by){
	let angleRad = Math.atan2((ay - by), (ax - bx));
	return angleRad/Math.PI*180;
}

function exportSliderDir(){
	return (lastDir+360)%360;
}

function displayResult(){
	state = "RESULT";
}