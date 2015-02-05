
$(document).ready(function(){

	var canvas = document.getElementById("myCanvas"); //save canvas
	var context = canvas.getContext("2d"); //get context from canvas
	canvas.width  = 600;
	canvas.height = 400;
	var fontSize = 13;
	// var adjThreshold = threshold + fontSize;
	context.font= fontSize+"px Sans Serif";


	var greenRadio = $("input#green"); //cache green radio
	var redRadio = $("input#red"); //cache red radio
	var post = $("span#rectangleInfo"); //cache span

	var rectangleObj = { //Save rectangle objects in dictionary for iteration 
		green : new rectangle(0,0,0,0,"green"),
		red : new rectangle(0,0,0,0,"red")
	};

	var greenPts;
	var redPts;

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

				greenPts = rectangleObj.green.getCoord();
				redPts = rectangleObj.red.getCoord();
				
				drawRectangles(); //Draws all the rectangles
				drawCoordinates();
				postResults(); //posts results to HTML page			
			});

			$(this).mouseup(function(){ //when the mouse is unclicked
				$(this).off(); //Stops rectangle from tracing when user releases mouse button
				updateRectangle(); //recursivly calls itself to listen for new input
			});
		});
	}


	function drawRectangles(){ //Draws each rectangle

		$.each(rectangleObj, function(index, value) {
			context.beginPath();
			context.lineWidth="1";
			context.strokeStyle= value.color;
			context.rect(value.posX,value.posY,value.recLength,value.recHeight);
			context.stroke();
	
		});		
	}

	
	function drawCoordinates(){
		
		context.fillText("("+greenPts.topL.x+", "+(canvas.height - greenPts.topL.y)+")",greenPts.topL.x, greenPts.topL.y);//top left point
		context.fillText("("+greenPts.bottomR.x+", "+(canvas.height - greenPts.topL.y)+")",greenPts.bottomR.x, greenPts.topL.y);//top right point
		context.fillText("("+greenPts.topL.x+", "+(canvas.height - greenPts.bottomR.y)+")",greenPts.topL.x, greenPts.bottomR.y);//bottom left point
		context.fillText("("+greenPts.bottomR.x+", "+(canvas.height-greenPts.bottomR.y)+")",greenPts.bottomR.x, greenPts.bottomR.y);//bottom right point
		context.fillText("("+redPts.topL.x+", "+(canvas.height - redPts.topL.y)+")",redPts.topL.x, redPts.topL.y);//top left point
		context.fillText("("+redPts.bottomR.x+", "+(canvas.height - redPts.topL.y)+")",redPts.bottomR.x, redPts.topL.y);//top right point
		context.fillText("("+redPts.topL.x+", "+(canvas.height - redPts.bottomR.y)+")",redPts.topL.x, redPts.bottomR.y);//bottom left point
		context.fillText("("+redPts.bottomR.x+", "+(canvas.height - redPts.bottomR.y)+")",redPts.bottomR.x, redPts.bottomR.y);//bottom right point
	}

	rectangle.prototype.getCoord = function(){ // Get coordinates of object rectangle and returns it in a dictionary
		var x1 = this.posX;
		var y1 = this.posY;
		var x2 = this.posX + this.recLength;
		var y2 = this.posY  + this.recHeight;

		var coord = {'topL': {'x' : x1 , 'y' : y1} , 'bottomR': {'x': x2 ,'y' : y2} };
		return  coord;
	}


	function intersectExists(){ //returns true if two rectangles intersect

		/*
		var doesIntersect = 
			greenPts.bottomR.x > redPts.topL.x &&
			redPts.bottomR.x > greenPts.topL.x &&
			greenPts.bottomR.y > redPts.topL.y &&
			redPts.bottomR.y > greenPts.topL.y;
		*/


		var xTop = Math.max(greenPts.topL.x, redPts.topL.x);
		var yTop = Math.max(greenPts.topL.y, redPts.topL.y);
		var xBottom = Math.min(greenPts.bottomR.x, redPts.bottomR.x);
		var yBottom = Math.min(greenPts.bottomR.y,redPts.bottomR.y);

		var doesIntersect = xTop < xBottom && yTop < yBottom;

		if(doesIntersect){
			context.fillText("("+xBottom+", "+(canvas.height - yTop)+")",xBottom, yTop);//bottom right point
			context.fillText("("+xTop+", "+(canvas.height - yBottom)+")",xTop, yBottom);//
			context.fillText("("+xBottom+", "+(canvas.height - yBottom)+")",xBottom, yBottom);//bottom right point
			context.fillText("("+xTop+", "+(canvas.height - yTop)+")",xTop, yTop);//
		}

		return doesIntersect;
	}


	function containmentExists(){ // returns true if a rectangle is contained in another

		var isContain1 =
		greenPts.topL.x < redPts.topL.x &&
		greenPts.bottomR.x > redPts.bottomR.x &&
		greenPts.topL.y < redPts.topL.y &&
		greenPts.bottomR.y > redPts.bottomR.y;

		var isContain2 =
		greenPts.topL.x > redPts.topL.x &&
		greenPts.bottomR.x < redPts.bottomR.x &&
		greenPts.topL.y > redPts.topL.y &&
		greenPts.bottomR.y < redPts.bottomR.y;

		return isContain1 || isContain2;
	}

	function adjacentExists(){//Returns true if rectangles are adjacent
		var threshold = -1;

		var isAdj = 
			(greenPts.bottomR.y - redPts.topL.y <= 0 && greenPts.bottomR.y - redPts.topL.y >= threshold) ||
			(greenPts.bottomR.x - redPts.topL.x <= 0 && greenPts.bottomR.x - redPts.topL.x >= threshold) ||
			(redPts.bottomR.y - greenPts.topL.y <= 0 && redPts.bottomR.y - greenPts.topL.y >= threshold) ||
			(redPts.bottomR.x - greenPts.topL.x <= 0 && redPts.bottomR.x - greenPts.topL.x >= threshold);

		var isWithinSide = 
			(greenPts.topL.x <= redPts.topL.x && greenPts.bottomR.x >= redPts.bottomR.x) ||
			(greenPts.topL.y <= redPts.topL.y && greenPts.bottomR.y >= redPts.bottomR.y) ||
			(redPts.topL.x <= greenPts.topL.x && redPts.bottomR.x >= greenPts.bottomR.x) ||
			(redPts.topL.y <= greenPts.topL.y && redPts.bottomR.y >= greenPts.bottomR.y);

		return(isWithinSide && isAdj);

	}


	function postResults(){ //Writes results to span #post in html page

		var isIntersects = intersectExists();
		var isContains = containmentExists();
		var isAdjacent = adjacentExists();

		if(isIntersects && isContains)
			post.text("Contains");
		else if(isAdjacent)
			post.text("Is Adjacent");
		else if(isIntersects)
			post.text("Intersects");
		else
			post.text("Nothing Happening");
	}





	updateRectangle();// begins listening to user changes.

	$("button#reset").on("click",function(){ // Resets all rectangles when reset button is clicked and changes radio back to green
		
		resetAll();
		drawRectangles();
		context.clearRect (0, 0, canvas.width, canvas.height);
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




