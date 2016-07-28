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

	socket.moved = 0;
	socket.squareToDelete = [];
	socket.squaresPosition = squaresPosition;
	socket.clientNbr = clients.length;
	socket.searchingOpponent = 1;
	socket.opponent = null;

	clients.push(socket);

	(function searchOpponent()
	{
		if (socket.searchingOpponent == 1)
		{
			var i = 0;
			while (clients[i])
			{
				if (i != socket.clientNbr)
				{
					if (clients[i].searchingOpponent == 1 && socket.searchingOpponent == 1)
					{
						socket.searchingOpponent = 0;
						socket.opponent = i;

						clients[i].searchingOpponent = 0;
						clients[i].opponent = socket.clientNbr;
					}
				}

				else
				{
					if (clients[i].searchingOpponent == 0)
					{
						socket.searchingOpponent = 0;
						socket.opponent = clients[i].opponent;
					}
				}

				if (socket.searchingOpponent == 0)
				{
					break;
				}
				i += 1;
			}

			setTimeout(function()
			{
				searchOpponent()
			}, 1);
		}

		else
		{
			launchGame();
		}
	})();

	function generateSquare()
	{
		var randomNbr = Math.floor(Math.random() * (4 - 1)) + 1;
		var malus = 0;

		if (randomNbr == 3)
		{
			randomNbr = 4;
		}

		else
		{
			malus = Math.floor(Math.random() * (4 - 1)) + 1;

			if (malus == 3)
			{
				malus = 1;
			}

			else
			{
				malus = 0;
			}

			randomNbr = 2;
		}
		
		socket.emit("generateClientSquare", randomNbr, "square" + squareNbr, malus);
		
		squareNbr += 1;
	}

	function placeSquare(squareId, value, className, html, malus)
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
			if (socket.squaresPosition[y][x].deleted == undefined)
			{
				placeSquare(squareId, value, className, html, malus);
				return 1;
			}
		}

		socket.squaresPosition[y][x] = { id: squareId, value: value, className: className, innerHTML: html, malus: malus };
		socket.emit("placeClientSquare", squareId, x, y);
		io.to(clients[socket.opponent].id).emit("generateOpponentSquare", socket.squaresPosition[y][x], x, y, malus);
	}

	function refreshView()
	{
		if (socket.moved == 1)
		{
			generateSquare();
		}

		socket.moved = 0;

		socket.emit("refreshView", socket.squaresPosition, socket.squareToDelete);
		io.to(clients[socket.opponent].id).emit("refreshView", socket.squaresPosition, socket.squareToDelete, 1);
		socket.squareToDelete = [];

		var j = 0;
		var i = 0;
		while (socket.squaresPosition[i])
		{
			j = 0;
			while (j < socket.squaresPosition[i].length)
			{
				if (socket.squaresPosition[i][j].fusionned != undefined)
				{
					delete socket.squaresPosition[i][j].fusionned;
				}

				if (socket.squaresPosition[i][j].deleted != undefined)
				{
					socket.squaresPosition[i][j] = 0;
				}

				j += 1;
			}
			i += 1;
		}

		clients[socket.clientNbr] = socket;
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

					if (i != 0 && box != 0 && box.deleted == undefined)
					{
						value = parseInt(box.value);

						if (socket.squaresPosition[i - 1][j] == 0 || socket.squaresPosition[i - 1][j].deleted != undefined)
						{
							socket.squaresPosition[i - 1][j] = box;
							socket.squaresPosition[i][j] = 0;
							socket.moved = 1;
						}

						else if (value == socket.squaresPosition[i - 1][j].value && socket.squaresPosition[i - 1][j].fusionned == undefined && box.fusionned == undefined && socket.squaresPosition[i - 1][j].deleted == undefined && box.deleted == undefined)
						{
							socket.squaresPosition[i][j].deleted = 1;
							socket.squareToDelete.push(socket.squaresPosition[i][j]);

							socket.squaresPosition[i - 1][j].value = value * 2;
							socket.squaresPosition[i - 1][j].className = "squareNbr square" + value * 2;
							socket.squaresPosition[i - 1][j].innerHTML = "<p>" + value * 2 + "</p>";
							socket.squaresPosition[i - 1][j].fusionned = 1;
							socket.moved = 1;
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

					if (i != socket.squaresPosition.length - 1 && box != 0 && box.deleted == undefined)
					{
						value = parseInt(box.value);

						if (socket.squaresPosition[i + 1][j] == 0 || socket.squaresPosition[i + 1][j].deleted != undefined)
						{
							socket.squaresPosition[i + 1][j] = box;
							socket.squaresPosition[i][j] = 0;
							socket.moved = 1;
						}

						else if (value == socket.squaresPosition[i + 1][j].value && socket.squaresPosition[i + 1][j].fusionned == undefined && box.fusionned == undefined && socket.squaresPosition[i + 1][j].deleted == undefined && box.deleted == undefined)
						{
							socket.squaresPosition[i][j].deleted = 1;
							socket.squareToDelete.push(socket.squaresPosition[i][j]);

							socket.squaresPosition[i + 1][j].value = value * 2;
							socket.squaresPosition[i + 1][j].className = "squareNbr square" + value * 2;
							socket.squaresPosition[i + 1][j].innerHTML = "<p>" + value * 2 + "</p>";
							socket.squaresPosition[i + 1][j].fusionned = 1;
							socket.moved = 1;
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

					if (j != socket.squaresPosition.length - 1 && box != 0 && box.deleted == undefined)
					{
						value = parseInt(box.value);

						if (socket.squaresPosition[i][j + 1] == 0 || socket.squaresPosition[i][j + 1].deleted != undefined)
						{
							socket.squaresPosition[i][j + 1] = box;
							socket.squaresPosition[i][j] = 0;
							socket.moved = 1;
						}

						else if (value == socket.squaresPosition[i][j + 1].value && socket.squaresPosition[i][j + 1].fusionned == undefined && box.fusionned == undefined && socket.squaresPosition[i][j + 1].deleted == undefined && box.deleted == undefined)
						{
							socket.squaresPosition[i][j].deleted = 1;
							socket.squareToDelete.push(socket.squaresPosition[i][j]);

							socket.squaresPosition[i][j + 1].value = value * 2;
							socket.squaresPosition[i][j + 1].className = "squareNbr square" + value * 2;
							socket.squaresPosition[i][j + 1].innerHTML = "<p>" + value * 2 + "</p>";
							socket.squaresPosition[i][j + 1].fusionned = 1;
							socket.moved = 1;
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

					if (j != 0 && box != 0 && box.deleted == undefined)
					{
						value = parseInt(box.value);

						if (socket.squaresPosition[i][j - 1] == 0 || socket.squaresPosition[i][j - 1].deleted != undefined)
						{
							socket.squaresPosition[i][j - 1] = box;
							socket.squaresPosition[i][j] = 0;
							socket.moved = 1;
						}

						else if (value == socket.squaresPosition[i][j - 1].value && socket.squaresPosition[i][j - 1].fusionned == undefined && box.fusionned == undefined && socket.squaresPosition[i][j - 1].deleted == undefined && box.deleted == undefined)
						{
							socket.squaresPosition[i][j].deleted = 1;
							socket.squareToDelete.push(socket.squaresPosition[i][j]);

							socket.squaresPosition[i][j - 1].value = value * 2;
							socket.squaresPosition[i][j - 1].className = "squareNbr square" + value * 2;
							socket.squaresPosition[i][j - 1].innerHTML = "<p>" + value * 2 + "</p>";
							socket.squaresPosition[i][j - 1].fusionned = 1;
							socket.moved = 1;
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

	function launchGame()
	{
		socket.emit("launchGameClient");
	}

	socket.on("placeSquare", placeSquare);
	socket.on("generateSquare", generateSquare);

	socket.on("up", upMovement);
	socket.on("right", rightMovement);
	socket.on("down", downMovement);
	socket.on("left", leftMovement);

	socket.on("disconnect", function()
	{
		clients[socket.clientNbr] = "";
	});
});
server.listen(8080);