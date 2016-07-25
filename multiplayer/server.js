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

	function placeSquare(squareId)
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

		socket.squaresPosition[y][x] = "square" + squareId;
		socket.emit("placeClientSquare", squareId, x, y);
	}

	socket.on("placeSquare", placeSquare);
	socket.on("generateSquare", generateSquare);
	// socket.on("left", )
});
server.listen(8080);