require("../jack");

Jack.Request = function(env) {
    this.env = env;
    this.env["jack.request"] = this;
}

Jack.Request.prototype.body            = function() { return this.env["jack.input"];                };
Jack.Request.prototype.scheme          = function() { return this.env["jack.url_scheme"];           };
Jack.Request.prototype.script_name     = function() { return this.env["SCRIPT_NAME"].toString();    };
Jack.Request.prototype.path_info       = function() { return this.env["PATH_INFO"].toString();      };
Jack.Request.prototype.port            = function() { return parseInt(this.env["SERVER_PORT"], 10); };
Jack.Request.prototype.request_method  = function() { return this.env["REQUEST_METHOD"];            };
Jack.Request.prototype.query_string    = function() { return this.env["QUERY_STRING"].toString();   };
Jack.Request.prototype.content_length  = function() { return this.env['CONTENT_LENGTH'];            };
Jack.Request.prototype.content_type    = function() { return this.env['CONTENT_TYPE'];              };