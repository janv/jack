
exports.main = function main(args) {
    var File = require("file");
    
    var environment = "development",
        options = { port : 8080, host : "0.0.0.0" },
        config = null,
        appName = "app",
        server = null,
        reload = false,
        evalText = null;

    if (args.length)
        var command = args.shift();

    while (system.args.length) {
        var arg = system.args.shift();
        switch (arg) {
            case "-e" :
            case "--eval" :
                evalText = system.args.shift();
                break;
            case "-I" :
            case "--include" :
                var newPaths = Array.prototype.unshift.apply(require.loader.getPaths(), system.args.shift().split(":"));
                require.loader.setPaths(newPaths);
                break;
            case "-d" :
            case "--debug" :
                system.debug = true;
                break;
            case "-a" :
            case "--app" :
                appName = system.args.shift();
                break;
            case "-s" :
            case "--server" :
                server = system.args.shift();
                break;
            case "-o" :
            case "--host" :
                options.host = system.args.shift();
                break;
            case "-p" :
            case "--port" :
                options.port = parseInt(system.args.shift());
                break;
            case "-E" :
            case "--env" :
                environment = system.args.shift();
                break;
            case "-r" :
            case "--reload" :
                reload = true;
                break;
            case "-h" :
            case "--help" :
                printUsage();
            case "--version" :
                throw new Error("Jack 0.1");
            default :
                if (config || arg.charAt(0) === "-")
                    printUsage();
                else
                    config = arg;
        }
    }

    var app, innerApp, configModule;
    
    if (!evalText) {
        
        if (!config)
            config = "jackconfig";

        if (config.charAt(0) !== "/")
            config = File.join(File.cwd(), config);

        print("Loading configuration module at " + config);

        configModule = require(config);
        if (!configModule)
            throw new Error("configuration " + config + " not found");
            
        if (reload)    
            innerApp = require("jack/reloader").Reloader(config, appName, require);
        else
            innerApp = configModule[appName];
    }
    else
        innerApp = system.evalGlobal(evalText);
    
    if (configModule && typeof configModule[environment] === "function")
    {
        app = configModule[environment](innerApp);
    }
    else
    {
        switch (environment) {
            case "development" :
                app = require("jack/commonlogger").CommonLogger(
                        require("jack/showexceptions").ShowExceptions(
                            require("jack/lint").Lint(innerApp)));
                break;
            case "deployment" :
                app = require("jack/commonlogger").CommonLogger(innerApp);
                break;
            case "none" :
                app = innerApp;
                break;
            default :
                throw new Error("Unknown environment (development, deployment, none)");
        }
    }
    
    if (!server)
    {
        if (system.env['PHP_FCGI_CHILDREN'] !== undefined)
            server = "fastcgi";
        else if (system.platform === "rhino")
            server = "simple";
        else if (system.platform === "k7")
            server = "shttpd";
        else if (system.platform === "v8cgi")
            server = "v8cgi";
        else
            throw new Error("Unknown platform " + system.platform + ". Specify a server with the \"-s\" option.");
    }

    // Load the required handler.
    var handler = require("jack/handler/" + server);
    
    handler.run(app, options);
}

function printUsage() {
    throw new Error("Usage: jackup [jack options] [jackup config]\n\
\n\
    Jack options:\n\
      -a, --app APPNAME        name of the module property to use as the app (default: app)\n\
      -s, --server SERVER      serve using SERVER (default: simple)\n\
      -o, --host HOST          listen on HOST (default: 0.0.0.0)\n\
      -p, --port PORT          use PORT (default: 8080)\n\
      -E, --env ENVIRONMENT    use ENVIRONMENT: deployment, development (default), none\n\
      -e, --eval LINE          evaluate a LINE of code to be used as the app (overrides module)\n\
      -r, --reload             reload application on each request\n\
      -d, --debug              sets system.debug to true\n\
      -h, --help               Show this message");
}

if (require.id == require.main)
    exports.main(system.args);
