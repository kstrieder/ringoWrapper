// Minimal hello-world HTTP server demo

let
    Configuration = require('./config.js'),
    {HttpServer} = require('ringo/httpserver'),
    serverInstance;

// -----------------------------------------------------------------------------------
// define a simple handler for url /test


function handleRequest(req) {
    return {
        "status": 200,
        "headers": {
            "Content-Type": "text/plain; charset=UTF-8"
        },
        "body": [
            "Hello World.\n",
            "current date in seconds ",
            Date.now().toString(),
            "\n"
        ]
    };
}

// -----------------------------------------------------------------------------------

// Switch to new HttpServer module from Ringo 
//    server = new HttpServer();
//    server.serveApplication("/", handleRequest);
//    server.createHttpListener(config);


serverInstance = new HttpServer();
serverInstance.serveApplication("/test", handleRequest);
serverInstance.createHttpListener(
    {
        port: Configuration.HttpServer.listenPort,
        host: Configuration.HttpServer.listenIp
    });

serverInstance.start();
