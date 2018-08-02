const net = require('net');
var readlineSync = require("readline-sync");
const colors = require("colors");
const sha256 = require('crypto-js/sha256')

class block {
	constructor(index, timestamp, data, previoushash) {
		this.index = index;
		this.timestamp = timestamp;
		this.data = data;
		this.previoushash = '';
		this.hash = this.calculatehash();
	}
	calculatehash() {
		return sha256(this.index + this.previoushash + this.timestamp + JSON.stringify(this.data)).toString();
	}
}

class blockchain {
	constructor() {
		this.chain = [this.createGenesisblock()]
	}

	createGenesisblock() {
		return new block(0, "23/7/18", "genesis block", "0");
	}

	getlatestblock() {
		return this.chain[this.chain.length - 1];
	}

	addblock(newblock) {
		newblock.previoushash = this.getlatestblock().hash;
		newblock.hash = newblock.calculatehash();
		this.chain.push(newblock);
	}

	ischainvalid() {
		for (let i = 1; i < this.chain.length; i++) {
			const currentblock = this.chain[i];
			const previousblock = this.chain[i - 1];

			if (currentblock.hash !== currentblock.calculatehash()) {
				return false;
			}

			if (currentblock.previoushash !== previousblock.hash) {
				return false;
			}
		}

		return true;
	}
}

let coin = new blockchain();
let i=1;

var server = net.createServer();

server.on("connection", function (socket) {
	var remoteAddress = socket.remoteAddress + ':' + socket.remotePort;
	console.log("\nNew client at %j", remoteAddress);

	socket.on("data", function (d) {
		let obj =  JSON.parse(d);
		console.log("\n%s messsaged you : %j".yellow, remoteAddress,obj)
		
		coin.addblock(new block(i++,obj.time,obj.data));
		console.log(JSON.stringify(coin,null,4).yellow);
		//var lineread = readlineSync.question("\nEnter reply to send :");
		socket.write(JSON.stringify(coin));
	})

	socket.once("close", function () {
		console.log("connection from %s closed..".green, remoteAddress);
	})

	socket.on("error", function (err) {
		console.log("connection from %s has %s..".red, remoteAddress, err.messsage);
	})
})

server.listen(9000, function () {
	console.log("listening to port :  %j".cyan, server.address())
})
