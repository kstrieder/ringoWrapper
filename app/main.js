global.appPath = (function (path) {
        if (typeof(path) !=="string") {
            path = module.resolve ("");
        }

        return function (mPath) {
            return [path, mPath].join (mPath.charAt(0) === "/" ? "" : "/");
        };

    } (module.resolve (""))
);

const
    {HttpServer} = require('ringo/httpserver/index.js'),
    log = require("ringo/logging").getLogger(module.id),
    Configuration = require(appPath ('config.js'))();

let
    serverInstance, staticContext,
    handler={}, key;

// -----------------------------------------------------------------------------------
// define a simple handler for url

for (key in Configuration.handler) {
    log.info("Registering handler " + key);
    handler[key] = require (appPath(Configuration.handler[key]));
}

function handleRequest(req) {
    let uriElements = req.pathInfo.split ("/").splice(1),
        op = uriElements.length >= 0 ? uriElements[0] : "default";


    // if the requested resource is defined in rootLevelMappings, we redirect here:
    if(typeof (Configuration.HttpServer.rootLevelMappings[req.pathInfo]) === "string") {
        return {
            "status": 302,
            "headers": {
                "Location": [Configuration.HttpServer.baseUrl, Configuration.HttpServer.rootLevelMappings[req.pathInfo]].join(""),
                "Cache-Control" : "Max-Age=0"
            },
            "body": ["Location: ", Configuration.HttpServer.baseUrl, Configuration.HttpServer.rootLevelMappings[req.pathInfo], "\n"]
        };
    }

    if (uriElements.length === 0 || uriElements[0] === "") {
        return {
            "status": 302,
            "headers": {
                "Location": [Configuration.HttpServer.baseUrl, Configuration.HttpServer.indexPage].join("/"),
                "Cache-Control": "no-cache"
            },
            "body": ["Location: ", Configuration.HttpServer.baseUrl, "/", Configuration.HttpServer.indexPage, "\n"]
        };
    }

    if (typeof (handler[op]) !== "undefined") {
        uriElements.shift();
        switch (typeof (handler[op])) {
            case "function" : return handler[op] (req, uriElements);
            case "object" : return handler[op];
        }
    } else {
        log.info ("Fallback to default handler for " + op);
        return handler["default"](req, uriElements);
    }
}

// -----------------------------------------------------------------------------------
// Switch to new HttpServer module from Ringo 
//    server = new HttpServer();
//    server.serveApplication("/", handleRequest);
//    server.createHttpListener(config);

serverInstance = new HttpServer();


serverInstance.serveApplication("/", handleRequest,
    { });

if (Configuration.HttpServer["static"]) {
    staticContext = serverInstance.serveStatic(Configuration.HttpServer.static.mount, module.resolve(Configuration.HttpServer.static.directory), {
        "allowDirectoryListing": Configuration.HttpServer.static.allowListing
    });
}

serverInstance.createHttpListener(
    {
        port: Configuration.HttpServer.listenPort,
        host: Configuration.HttpServer.listenIp
    });

serverInstance.jetty.start();
