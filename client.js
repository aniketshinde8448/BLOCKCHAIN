var readlineSync = require("readline-sync");
const colors = require("colors");
var net = require("net");
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
        return sha256(this.index+ this.previoushash+ this.timestamp+JSON.stringify(this.data)).toString();
    }
}

class blockchain {
    constructor() {
        this.chain=[this.createGenesisblock()]
    }

    createGenesisblock() {
        return new block(0, "23,7,18", "genesis block", "0");
    }

    getlatestblock(){
    return this.chain[this.chain.length-1];
    }

    addblock(newblock){
        newblock.previoushash=this.getlatestblock().hash;
        newblock.hash=newblock.calculatehash();
    this.chain.push(newblock);
    }

    ischainvalid(){
        for( let i=1;i<this.chain.length;i++){
            const currentblock = this.chain[i];
            const previousblock = this.chain[i-1];

            if(currentblock.hash !== currentblock.calculatehash()){
                return false ;
            }

            if(currentblock.previoushash !== previousblock.hash){
                return false;
            }
        }

        return true;
    }
}

var HOST = "192.168.1.9" ;
var port = 9000;

var client = null;

function OpenConnection(){
    if(client){
        console.log("Connection is already open");
        setTimeout(function() {
            menu();
        }, 0);
        return;
    }

    client = new net.Socket();

    client.on("error", function(err){
        client.destroy();
        client = null;
        console.log("ERROR: Connection could not be opened. Msg: %s".red);
        setTimeout(function() {
            menu();
        }, 0);
    });

    client.on("data", function(data){
        obj = JSON.parse(data);
       console.log(JSON.stringify(obj,null,4).yellow)
        // console.log("Received: %o".yellow,data);
        setTimeout(function() {
            menu();
        }, 0);
    });

    client.connect(port, HOST, function() {
        console.log("Connection opened successfully !!".bgCyan);
        setTimeout(function() {
            menu();
        }, 0);
    });
    
}

function sendData(){
    if(!client) {
        console.log("Connection is not open or closed");
        setTimeout(function() {
            menu();
        }, 0);
    }

    var time = readlineSync.question("\nEnter Timestamp :".magenta);
    var data = readlineSync.question("\nEnter data :".magenta)
    client.write(JSON.stringify({time,data}));
}

function CloseConnection() {
    if(!client) {
        console.log("Connection is not open or closed");
        setTimeout(function() {
            menu();
        }, 0);
        return;
    }

    client.destroy();
    client = null;
    console.log("Connection has been closed");
    setTimeout(function() {
            menu();
        }, 0);
    
}

function menu(){
    var lineread = readlineSync.question("\n\nEnter option (1.Open , 2.Send, 3.Close, 4.Quit):".green);

    switch(lineread){
        case "1":
        OpenConnection();
        break;

        case "2":
        sendData();
        break;
        
        case "3":
        CloseConnection();
        break;

        case "4":
        return;
        break;

        default:
        setTimeout(function(){
            menu();
        },0);
        break;
    }
}


setTimeout(function(){
            menu();
        },0);
