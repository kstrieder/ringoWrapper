// Minimal hello-world HTTP server demo

let
    Configuration = require ('./config.js'),
    {Server} = require('ringo/httpserver'),
    serverInstance;

const
    {Application} = require ('./libs/stick/stick.js'),
    res = require("ringo/jsgi/response"),
    app = exports.app = new Application();

// -----------------------------------------------------------------------------------
// define a simple handler for url /test

app.configure("route");

app.get ("/test", function (req) {
    let response = res.setContentType ("text/plain; charset=UTF-8");
    
    response.body.push ("\n");
    response.body.push (Date.now().toString());
    return response;
});

// -----------------------------------------------------------------------------------

serverInstance = new Server({app: app, port: Configuration.HttpServer.listenPort, host: Configuration.HttpServer.listenIp});

serverInstance.start();
