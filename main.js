(function()
{
	var squaresPosition =
	[
	[0, 0, 0, 0],
	[0, 0, 0, 0],
	[0, 0, 0, 0],
	[0, 0, 0, 0]
	];
	var moved = 0;

	function prepareGame()
	{
		createSquares();

		var allSquaresDiv = document.getElementById("allSquares");
		var allSquaresHover = document.getElementById("allSquaresHover");

		allSquaresHover.style.marginLeft = parseInt(getComputedStyle(allSquaresHover).getPropertyValue("margin-left").split("px")[0]) - 300 + "px";
		allSquaresDiv.style.marginLeft = parseInt(getComputedStyle(allSquaresDiv).getPropertyValue("margin-left").split("px")[0]) - 300 + "px";
	}

	function createSquares()
	{
		var element;

		var i = 0;
		while (i < 16)
		{
			element = document.createElement("div");
			element.className = "eachSquare";

			document.getElementById("allSquares").appendChild(element);
			i += 1;
		}

		generateSquares();
		generateSquares();
	}

	/* Squares creation */

	function placeSquare(element)
	{
		var randomPlace = Math.floor(Math.random() * (17 - 0)) + 0;

		if (randomPlace >= 4)
		{
			var x = randomPlace - 4;
			while (x - 4 > 0)
			{
				x -= 4;
			}

			if (x != 0)
			{
				x -= 1;
			}
		}

		else
		{
			var x = randomPlace;
		}

		var y = Math.ceil(randomPlace / 4) - 1;

		if (y == -1)
		{
			y = 0;
		}

		if (squaresPosition[y][x] != 0)
		{
			placeSquare(element);
			return 1;
		}

		var baseSquareStyle = getComputedStyle(document.getElementsByClassName("eachSquare")[0]);
		var baseSquareSize = parseInt(baseSquareStyle.getPropertyValue("width").split("px")[0])
		var baseSquareMargin = parseInt(baseSquareStyle.getPropertyValue("margin-left").split("px")[0]);
		var nbrOfMargin = [1, 3, 5, 7]

		element.style.marginLeft = (baseSquareSize * x) + nbrOfMargin[x] * baseSquareMargin + "px";
		element.style.marginTop = (baseSquareSize * y) + nbrOfMargin[y] * baseSquareMargin + "px";
		element.style.width = "140px";
		element.style.height = "140px";

		// (function animate(element)
		// {
		// 	var elementSize = parseInt(getComputedStyle(element).getPropertyValue("width").split("px")[0]);

		// 	element.style.width = elementSize + 2 + "px";
		// 	element.style.height = elementSize + 2 + "px";
		// 	elementSize += 2;

		// 	if (elementSize < 140)
		// 	{
		// 		window.setTimeout(function()
		// 		{
		// 			animate(element);
		// 		}, 3);
		// 	}
		// })(element);

		squaresPosition[y][x] = element;
	}

	function generateSquares()
	{
		var randomNbr = Math.floor(Math.random() * (4 - 1)) + 1;

		if (randomNbr == 3)
		{
			randomNbr = 4;
		}

		else
		{
			randomNbr = 2;
		}

		var element = document.createElement("div");
		element.className = "squareNbr square" + randomNbr;
		element.innerHTML = "<p>" + randomNbr + "</p>";

		document.getElementById("allSquaresHover").appendChild(element);
		placeSquare(element);
	}

	/* Squares creation */

	/* Move Squares */

	function refreshView()
	{
		var baseSquareStyle = getComputedStyle(document.getElementsByClassName("eachSquare")[0]);
		var baseSquareSize = parseInt(baseSquareStyle.getPropertyValue("width").split("px")[0])
		var baseSquareMargin = parseInt(baseSquareStyle.getPropertyValue("margin-left").split("px")[0]);
		var nbrOfMargin = [1, 3, 5, 7]

		var i = 0;
		var j = 0;
		while (squaresPosition[i])
		{
			j = 0;
			while (j < squaresPosition[i].length)
			{
				if (squaresPosition[i][j] != 0)
				{
					squaresPosition[i][j].style.marginLeft = (baseSquareSize * j) + nbrOfMargin[j] * baseSquareMargin + "px";
					squaresPosition[i][j].style.marginTop = (baseSquareSize * i) + nbrOfMargin[i] * baseSquareMargin + "px";
					squaresPosition[i][j].fusionned = undefined;
				}
				j += 1;
			}
			i += 1;
		}
	}

	function moveUp()
	{
		var box;
		var value;
		
		var newValue;

		var i = 0;
		var j = 0;
		var k = 0;
		while (k < squaresPosition.length)
		{
			i = 0;
			while (i < squaresPosition.length)
			{
				j = 0;
				while (squaresPosition[j])
				{
					box = squaresPosition[i][j];

					if (i != 0 && squaresPosition[i][j] != 0)
					{
						value = parseInt(box.children[0].innerHTML);

						if (squaresPosition[i - 1][j] == 0)
						{
							squaresPosition[i - 1][j] = box;
							squaresPosition[i][j] = 0;
							moved = 1;
						}

						else if (value == squaresPosition[i - 1][j].children[0].innerHTML && squaresPosition[i - 1][j].fusionned == undefined && box.fusionned == undefined)
						{
							document.getElementById("allSquaresHover").removeChild(squaresPosition[i][j]);
							squaresPosition[i - 1][j].className = "squareNbr square" + value * 2;
							squaresPosition[i - 1][j].innerHTML = "<p>" + value * 2 + "</p>";
							squaresPosition[i - 1][j].fusionned = 1

							squaresPosition[i][j] = 0;
							moved = 1;
						}
					}

					j += 1;
				}
				i += 1;
			}
			k += 1;
		}
	}

	function moveDown()
	{
		var box;
		var value;
		
		var newValue;

		var i = squaresPosition.length - 1;
		var j = 0;
		var k = 0;
		while (k < squaresPosition.length)
		{
			i = squaresPosition.length - 1;
			while (i >= 0)
			{
				j = 0;
				while (squaresPosition[j])
				{
					box = squaresPosition[i][j];

					if (i != squaresPosition.length - 1 && squaresPosition[i][j] != 0)
					{
						value = parseInt(box.children[0].innerHTML);

						if (squaresPosition[i + 1][j] == 0)
						{
							squaresPosition[i + 1][j] = box;
							squaresPosition[i][j] = 0;
							moved = 1;
						}

						else if (value == squaresPosition[i + 1][j].children[0].innerHTML && squaresPosition[i + 1][j].fusionned == undefined && box.fusionned == undefined)
						{
							document.getElementById("allSquaresHover").removeChild(squaresPosition[i][j]);
							squaresPosition[i + 1][j].className = "squareNbr square" + value * 2;
							squaresPosition[i + 1][j].innerHTML = "<p>" + value * 2 + "</p>";
							squaresPosition[i + 1][j].fusionned = 1

							squaresPosition[i][j] = 0;
							moved = 1;
						}
					}

					j += 1;
				}
				i -= 1;
			}
			k += 1;
		}
	}

	function moveRight()
	{
		var k = 0;
		var i = 0;
		var j = squaresPosition.length - 1;

		while (squaresPosition[k])
		{
			i = 0;
			while (squaresPosition[i])
			{
				j = squaresPosition.length - 1;
				while (j >= 0)
				{
					box = squaresPosition[i][j];

					if (j != squaresPosition.length - 1 && squaresPosition[i][j] != 0)
					{
						value = parseInt(box.children[0].innerHTML);

						if (squaresPosition[i][j + 1] == 0)
						{
							squaresPosition[i][j + 1] = box;
							squaresPosition[i][j] = 0;
							moved = 1;
						}

						else if (value == squaresPosition[i][j + 1].children[0].innerHTML && squaresPosition[i][j + 1].fusionned == undefined && box.fusionned == undefined)
						{
							document.getElementById("allSquaresHover").removeChild(squaresPosition[i][j]);
							squaresPosition[i][j + 1].className = "squareNbr square" + value * 2;
							squaresPosition[i][j + 1].innerHTML = "<p>" + value * 2 + "</p>";
							squaresPosition[i][j + 1].fusionned = 1;

							squaresPosition[i][j] = 0;
							moved = 1;
						}
					}

					j -= 1;
				}
				i += 1;
			}
			k += 1;
		}
	}

	function moveLeft()
	{
		var k = 0;
		var i = 0;
		var j = 0;

		while (squaresPosition[k])
		{
			i = 0;
			while (squaresPosition[i])
			{
				j = 0;
				while (j < squaresPosition.length)
				{
					box = squaresPosition[i][j];

					if (j != 0 && squaresPosition[i][j] != 0)
					{
						value = parseInt(box.children[0].innerHTML);

						if (squaresPosition[i][j - 1] == 0)
						{
							squaresPosition[i][j - 1] = box;
							squaresPosition[i][j] = 0;
							moved = 1;
						}

						else if (value == squaresPosition[i][j - 1].children[0].innerHTML && squaresPosition[i][j - 1].fusionned == undefined && box.fusionned == undefined)
						{
							document.getElementById("allSquaresHover").removeChild(squaresPosition[i][j]);
							squaresPosition[i][j - 1].className = "squareNbr square" + value * 2;
							squaresPosition[i][j - 1].innerHTML = "<p>" + value * 2 + "</p>";
							squaresPosition[i][j - 1].fusionned = 1;

							squaresPosition[i][j] = 0;
							moved = 1;
						}
					}

					j += 1;
				}
				i += 1;
			}
			k += 1;
		}
	}

	function moveListener(event)
	{
		if (event.keyCode == 37)
		{
			moveLeft();
		}

		else if (event.keyCode == 38)
		{
			moveUp();
		}

		else if (event.keyCode == 39)
		{
			moveRight();
		}

		else if (event.keyCode == 40)
		{
			moveDown();
		}

		if (moved == 1)
		{
			moved = 0;
			refreshView();
			setTimeout(function()
			{
				generateSquares();
			}, 200);
		}
	}

	/* Move Squares */

	document.addEventListener("DOMContentLoaded", function()
	{
		prepareGame();
		document.addEventListener("keydown", moveListener);
	});

})();