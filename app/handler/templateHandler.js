
const   
    Mustache = require (appPath ("libs/Mustache/mustache.js")),
    log = require("ringo/logging").getLogger(module.id),
    Configuration = require(appPath ('config.js'))(),
    fs = require('fs');

let
    templateDirectory = appPath(Configuration.HttpServer.templates);

function getCacheControlHeader (mimeType) {
    let simpleType=mimeType.indexOf(";") ? mimeType.substring (0, mimeType.indexOf(";")) : mimeType;

    if (Configuration.Cache &&
        Configuration.Cache[simpleType]) {
        return "Max-Age=" + Configuration.Cache[simpleType];
    }
    return "Max-Age=0";
}

module["exports"] = function (req, uriElements) {
    let queryString = req.queryString,
        fileStream, localName,
        fileType="application/octet-stream",
        renderContext,
        fName, useMustache = false;

    // root without any url elements requested, redirect to default Page
    if (uriElements.length === 0 || uriElements[0] === "") {
        return {
            "status": 302,
            "headers": {
                "Location": [Configuration.HttpServer.baseUrl, Configuration.HttpServer.indexPage].join("/"),
                "Cache-Control" : "Max-Age=0"
            },
            "body": ["Location: ", Configuration.HttpServer.baseUrl, "/", Configuration.HttpServer.indexPage, "\n"]
        };
    }

    localName = uriElements.join("/");
    fName = templateDirectory + localName;

    switch (fName.substring (fName.lastIndexOf(".")+1).toLocaleLowerCase()) {
        case "png" :
            fileType = "image/png";
            break;
        case "html" :
            fileType = "text/html; charset=UTF-8";
            useMustache=true;
            break;
        case "jpg" :
            fileType = "image/jpg";
            break;
        case "txt" :
            fileType = "text/plain; charset=UTF-8";
            useMustache=true;
            break;
        case "js" :
            fileType = "text/javascript; charset=UTF-8";
            useMustache=false;
            break;
        case "css" :
            fileType = "text/css; charset=UTF-8";
            useMustache=true;
            break;
        default :
            fileType="application/octet-stream"; 
            useMustache = false;
    }

    try {
        if (useMustache) {
            renderContext = {
                queryString : queryString,
                uri : req.pathInfo,
                Configuration : Configuration
            };
            fileStream = fs.read(fName, { binary: false, read: true});
            return {
                "status" : 200,
                "headers" : {
                    "Content-Type": fileType,
                    "Cache-Control" : getCacheControlHeader(fileType)
                },
                "body" : [Mustache.render (fileStream, renderContext)]
            };
        } else {
            fileStream = fs.open(fName, { binary: true, read: true});
            return {
                "status" : 200,
                "headers" : {
                    "Content-Type": fileType,
                    "Cache-Control" : getCacheControlHeader(fileType)
                },
                body: {
                    forEach: function(fn) {
                        let read, bufsize = 8192;
                        let buffer = new ByteArray(bufsize);
                        while ((read = fileStream.readInto(buffer)) > -1) {
                            buffer.length = read;
                            fn(buffer);
                            buffer.length = bufsize;
                        }
                    },
                    close: function() {
                        if (fileStream) {
                            fileStream.close();
                        }
                    }
                }
            };
        }
    } catch (e) {
        log.info ("File not found " + fName);

        return {
            "status": 404,
            "headers": {
                "Content-Type": "text/plain; charset=UTF-8",
            },
            "body": ["\n\nMessage [404] \"", uriElements.join("/"), "\" Not found.\n\n"]
        };
    }
};
