var canvas = document.getElementById("myCanvas"); //save canvas
var context = canvas.getContext("2d"); //get context from canvas
canvas.width  = 600;
canvas.height = 400;

var greenRadio = $("input#green"); //cache green radio
var redRadio = $("input#red"); //cache red radio
var post = $("span#rectangleInfo"); //cache span

var rectangleObj = { //Save rectangle objects in dictionary for iteration 
	green : new rectangle(0,0,0,0,"green"),
	red : new rectangle(0,0,0,0,"red")
};

// var green = rectangleObj.green; //save objects in variables for easier programming
// var red = rectangleObj.red;

function rectangle(posX,posY,recLength,recHeight,color){ //set rectangle properties
	this.posX = posX;
	this.posY = posY;
	this.recLength = recLength;
	this.recHeight = recHeight;
	this.color = color;
}

rectangle.prototype.resetRectangle = function(){ //set rectangle properties to 0 (except for color)
	this.posX = 0;
	this.posY = 0;
	this.recLength = 0;
	this.recHeight = 0;
}


function resetAll(){ //resets all rectangle object properties to 0 (except for color)
	for(key in rectangleObj){
		rectangleObj[key].resetRectangle();
	}
}

function getCurrentRectangleFromRadio(){ //returns rectanlge object according to radio selected
	var check;
	if(greenRadio.is(':checked'))
		check = rectangleObj.green;
	else if(redRadio.is(':checked'))
		check = rectangleObj.red;

	return check;
}


/*
This updates the position and dimensions of the current rectangle selected in the radio.
It measures the position of the mouse and the position of the canvas to calculate where to
position the corner of the rectangle. It clears the canvas and repaints the canvas after each
change. Once called, this function will recursivly stay active, listening for whenever the user
updates which ever rectangle. 
*/
function updateRectangle(){
	var currentRectangle;
	$(canvas).on("mousedown", function(downEvent){ //When the mouse is clicked
		currentRectangle = getCurrentRectangleFromRadio();
		
		$(this).on("mousemove", function(moveEvent){ //When the mouse is moving
			//gets the starting X and Y  coordinates(Top left corner)
			currentRectangle.posX = downEvent.pageX - canvas.offsetLeft; 
			currentRectangle.posY = downEvent.pageY - canvas.offsetTop;

			//gets the ending X and Y coordinates (Bottom right cornder)
			currentRectangle.recLength = moveEvent.pageX - currentRectangle.posX - canvas.offsetLeft; 
			currentRectangle.recHeight = moveEvent.pageY - currentRectangle.posY - canvas.offsetTop;

			if(currentRectangle.recLength < 0){ //Reverses starting X coordinate to prevent negative values
				currentRectangle.recLength = currentRectangle.posX - currentRectangle.recLength - downEvent.pageX + canvas.offsetLeft;
				currentRectangle.posX = moveEvent.pageX - canvas.offsetLeft;
			}
			if( currentRectangle.recHeight < 0){ //Reverses the starting Y coordinate to prevent negative values
				currentRectangle.recHeight = currentRectangle.posY - currentRectangle.recHeight - downEvent.pageY + canvas.offsetTop;
				currentRectangle.posY = moveEvent.pageY - canvas.offsetTop;
			}

			context.clearRect (0, 0, canvas.width, canvas.height);// Clears canvas
			postResults(rectangleObj.green, rectangleObj.red); //posts results to HTML page
			drawRectangles(); //Draws all the rectangles			
		});

		$(this).mouseup(function(){ //when the mouse is unclicked
			$(this).off(); //Stops rectangle from tracing when user releases mouse button
			updateRectangle(); //recursivly calls itself to listen for new input
		});
	});
}


drawRectangles = function(){ //Draws each rectangle
	$.each(rectangleObj, function(index, value) {
		context.beginPath();
		context.lineWidth="1";
		context.strokeStyle= value.color;
		context.rect(value.posX,value.posY,value.recLength,value.recHeight); 
		context.stroke();
	});
}

rectangle.prototype.getCoord = function(){ // Get coordinates of object rectangle and returns it in a dictionary
	var x1 = this.posX;
	var y1 = this.posY;
	var x2 = this.posX + this.recLength;
	var y2 = this.posY  + this.recHeight;

	var coord = {'topL': {'x' : x1 , 'y' : y1} , 'bottomR': {'x': x2 ,'y' : y2} };
	return  coord;
}


function getIntersectPoints(rec1, rec2){ //did not complete this
	var points1 = rec1.getCoord();
	var points2 = rec2.getCoord();

	var xTop = Math.max(points1.topL.x, points2.topL.x);
	var yTop = Math.max(points1.topL.y, points2.topL.y);
	var xBottom = Math.min(points1.bottomR.x, points2.bottomR.x);
	var yBottom = Math.min(points1.bottomR.y,points2.bottomR.y);

	return {'topL':[xTop, yTop], 'bottomR':[xBottom, yBottom]};
}

function intersectExists(rec1,rec2){ //returns true if two rectangles intersect
	var points1 =  rec1.getCoord();
	var points2 = rec2.getCoord();

	var doesIntersect = 
		points1.bottomR.x > points2.topL.x &&
		points2.bottomR.x > points1.topL.x &&
		points1.bottomR.y > points2.topL.y &&
		points2.bottomR.y > points1.topL.y;

		// console.log(points1.bottomR.x);
		console.log("X:"+points1.bottomR.x+"  Y: "+(canvas.height - points1.bottomR.y));

	return doesIntersect;
}


function containmentExists(rec1, rec2){ // returns true if a rectangle is contained in another
	var points1 = rec1.getCoord();
	var points2 = rec2.getCoord();

	var isContain1 =
	points1.topL.x < points2.topL.x &&
	points1.bottomR.x > points2.bottomR.x &&
	points1.topL.y < points2.topL.y &&
	points1.bottomR.y > points2.bottomR.y;

	var isContain2 =
	points1.topL.x > points2.topL.x &&
	points1.bottomR.x < points2.bottomR.x &&
	points1.topL.y > points2.topL.y &&
	points1.bottomR.y < points2.bottomR.y;

	return isContain1 || isContain2;
}

function adjacentExists(rec1, rec2){// Did not start this

	var pts1 = rec1.getCoord();
	var pts2 = rec2.getCoord();

	var threshold = -1;

	var isAdj = 
		(pts1.bottomR.y - pts2.topL.y <= 0 && pts1.bottomR.y - pts2.topL.y >= threshold) ||
		(pts1.bottomR.x - pts2.topL.x <= 0 && pts1.bottomR.x - pts2.topL.x >= threshold) ||
		(pts2.bottomR.y - pts1.topL.y <= 0 && pts2.bottomR.y - pts1.topL.y >= threshold) ||
		(pts2.bottomR.x - pts1.topL.x <= 0 && pts2.bottomR.x - pts1.topL.x >= threshold);

	var isWithinSide = 
		(pts1.topL.x <= pts2.topL.x && pts1.bottomR.x >= pts2.bottomR.x) ||
		(pts1.topL.y <= pts2.topL.y && pts1.bottomR.y >= pts2.bottomR.y) ||
		(pts2.topL.x <= pts1.topL.x && pts2.bottomR.x >= pts1.bottomR.x) ||
		(pts2.topL.y <= pts1.topL.y && pts2.bottomR.y >= pts1.bottomR.y);

	return(isWithinSide && isAdj);

}


function postResults(rec1, rec2){ //Writes results to span #post in html page
	var isIntersects = intersectExists(rec1,rec2);
	var isContains = containmentExists(rec1,rec2);
	var isAdjacent = adjacentExists(rec1,rec2);

	if(isIntersects && isContains)
		post.text("Contains");
	else if(isAdjacent)
		post.text("Is Adjacent");
	else if(isIntersects)
		post.text("Intersects");
	else
		post.text("Nothing Happening");
}


$(document).ready(function(){
	updateRectangle();// begins listening to user changes.

	$("button#reset").on("click",function(){ // Resets all rectangles when reset button is clicked and changes radio back to green
		context.clearRect (0, 0, canvas.width, canvas.height);
		resetAll();
		drawRectangles();
		greenRadio.prop("checked", true);
		redRadio.prop("checked", false);
	});

	$("input:radio").on("change",function(){//Toggles radio

		if($(this).attr('id') == "red")
			greenRadio.prop("checked", false);
		else if($(this).attr('id') == "green")
			redRadio.prop("checked", false);
	});

});




