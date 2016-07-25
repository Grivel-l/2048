var http = require("http");
var jwt = require("jsonwebtoken");
var clients = [];

var server = http.createServer(function(request, response)
{
	response.writeHead(200);
}).listen(8080);

var io = require("socket.io")(server);

io.on("connection", function(socket)
{
	var squaresPosition =
	[
	[0, 0, 0, 0],
	[0, 0, 0, 0],
	[0, 0, 0, 0],
	[0, 0, 0, 0]
	];

	var squareNbr = 0;

	socket.squaresPosition = squaresPosition;
	socket.clientNbr = clients.length;
	clients.push(socket);

	function generateSquare()
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
		
		socket.emit("generateClientSquare", randomNbr, "square" + squareNbr);
		squareNbr += 1;
	}

	function placeSquare(squareId, value, className, html)
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

		if (socket.squaresPosition[y][x] != 0)
		{
			placeSquare(squareId);
			return 1;
		}

		socket.squaresPosition[y][x] = { id: squareId, value: value, className: className, innerHTML: html};
		socket.emit("placeClientSquare", squareId, x, y);
	}

	function refreshView()
	{
		generateSquare();

		var j = 0;
		var i = 0;
		while (socket.squaresPosition[i])
		{
			j = 0;
			while (j < socket.squaresPosition[i].length)
			{
				socket.squaresPosition[i].fusionned = undefined;
				j += 1;
			}
			i += 1;
		}

		socket.emit("refreshView", socket.squaresPosition);
	}

	function upMovement()
	{
		var box;
		var value;
		
		var i = 0;
		var j = 0;
		var k = 0;
		while (k < socket.squaresPosition.length)
		{
			i = 0;
			while (i < socket.squaresPosition.length)
			{
				j = 0;
				while (socket.squaresPosition[j])
				{
					box = socket.squaresPosition[i][j];

					if (i != 0 && socket.squaresPosition[i][j] != 0)
					{
						value = box.value;

						if (socket.squaresPosition[i - 1][j] == 0)
						{
							socket.squaresPosition[i - 1][j] = box;
							socket.squaresPosition[i][j] = 0;
							moved = 1;
						}

						else if (value == socket.squaresPosition[i - 1][j].value && socket.squaresPosition[i - 1][j].fusionned == undefined && box.fusionned == undefined)
						{
							socket.squaresPosition[i][j].deleted = 1;
							socket.squaresPosition[i][j] = 0;

							socket.squaresPosition[i - 1][j].className = "squareNbr square" + value * 2;
							socket.squaresPosition[i - 1][j].innerHTML = "<p>" + value * 2 + "</p>";
							socket.squaresPosition[i - 1][j].fusionned = 1
							moved = 1;
						}
					}

					j += 1;
				}
				i += 1;
			}
			k += 1;
		}

		refreshView();
	}

	function downMovement()
	{
		var box;
		var value;

		var i = socket.squaresPosition.length - 1;
		var j = 0;
		var k = 0;
		while (k < socket.squaresPosition.length)
		{
			i = socket.squaresPosition.length - 1;
			while (i >= 0)
			{
				j = 0;
				while (socket.squaresPosition[j])
				{
					box = socket.squaresPosition[i][j];

					if (i != socket.squaresPosition.length - 1 && socket.squaresPosition[i][j] != 0)
					{
						value = box.value;

						if (socket.squaresPosition[i + 1][j] == 0)
						{
							socket.squaresPosition[i + 1][j] = box;
							socket.squaresPosition[i][j] = 0;
							moved = 1;
						}

						else if (value == socket.squaresPosition[i + 1][j].value && socket.squaresPosition[i + 1][j].fusionned == undefined && box.fusionned == undefined)
						{
							socket.squaresPosition[i][j].deleted = 1;
							socket.squaresPosition[i][j] = 0;

							socket.squaresPosition[i + 1][j].className = "squareNbr square" + value * 2;
							socket.squaresPosition[i + 1][j].innerHTML = "<p>" + value * 2 + "</p>";
							socket.squaresPosition[i + 1][j].fusionned = 1
							moved = 1;
						}
					}

					j += 1;
				}
				i -= 1;
			}
			k += 1;
		}

		refreshView();
	}

	function rightMovement()
	{
		var k = 0;
		var i = 0;
		var j = socket.squaresPosition.length - 1;

		while (socket.squaresPosition[k])
		{
			i = 0;
			while (socket.squaresPosition[i])
			{
				j = socket.squaresPosition.length - 1;
				while (j >= 0)
				{
					box = socket.squaresPosition[i][j];

					if (j != socket.squaresPosition.length - 1 && socket.squaresPosition[i][j] != 0)
					{
						value = box.value;

						if (socket.squaresPosition[i][j + 1] == 0)
						{
							socket.squaresPosition[i][j + 1] = box;
							socket.squaresPosition[i][j] = 0;
							moved = 1;
						}

						else if (value == socket.squaresPosition[i][j + 1].value && socket.squaresPosition[i][j + 1].fusionned == undefined && box.fusionned == undefined)
						{
							socket.squaresPosition[i][j].deleted = 1;
							socket.squaresPosition[i][j] = 0;

							socket.squaresPosition[i][j + 1].className = "squareNbr square" + value * 2;
							socket.squaresPosition[i][j + 1].innerHTML = "<p>" + value * 2 + "</p>";
							socket.squaresPosition[i][j + 1].fusionned = 1;
							moved = 1;
						}
					}

					j -= 1;
				}
				i += 1;
			}
			k += 1;
		}

		refreshView();
	}

	function leftMovement()
	{
		var k = 0;
		var i = 0;
		var j = 0;

		while (socket.squaresPosition[k])
		{
			i = 0;
			while (socket.squaresPosition[i])
			{
				j = 0;
				while (j < socket.squaresPosition.length)
				{
					box = socket.squaresPosition[i][j];

					if (j != 0 && socket.squaresPosition[i][j] != 0)
					{
						value = box.value;

						if (socket.squaresPosition[i][j - 1] == 0)
						{
							socket.squaresPosition[i][j - 1] = box;
							socket.squaresPosition[i][j] = 0;
							moved = 1;
						}

						else if (value == socket.squaresPosition[i][j - 1].value && socket.squaresPosition[i][j - 1].fusionned == undefined && box.fusionned == undefined)
						{
							socket.squaresPosition[i][j].deleted = 1;
							socket.squaresPosition[i][j] = 0;

							socket.squaresPosition[i][j - 1].className = "squareNbr square" + value * 2;
							socket.squaresPosition[i][j - 1].innerHTML = "<p>" + value * 2 + "</p>";
							socket.squaresPosition[i][j - 1].fusionned = 1;
							moved = 1;
						}
					}

					j += 1;
				}
				i += 1;
			}
			k += 1;
		}

		refreshView();
	}

	socket.on("placeSquare", placeSquare);
	socket.on("generateSquare", generateSquare);

	socket.on("up", upMovement);
	socket.on("right", rightMovement);
	socket.on("down", downMovement);
	socket.on("left", leftMovement);
});
server.listen(8080);