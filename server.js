var h = require("mercury").h;
var toHTML = require("vdom-to-html");
var url = require("url");
var express = require("express");
var app = express();

require("./xhr");

var App = require("./index");
var Zone = require("can-wait");
var xhrZone = require("can-wait/xhr");

app.use(express.static(__dirname));

function index(req, res){
	var page = url.parse(req.url).pathname.substr(1) || "home";

	var zone = new Zone({
		location: { pathname: page },
		plugins: [xhrZone]
	});

	zone.run(App).then(function(data){
		var state = data.result;

		var html = h("html", [
			h("head", [ h("title", "Mercury App") ]),
			h("body", [
				App.render(state()),
				h("script", data.xhr ? data.xhr.toString() : ""),
				h("script", { src: "node_modules/steal/steal.js" })
			])
		]);

		res.send(toHTML(html));
	});
}

app.get("/", index);
app.get("/todos", index);

app.get("/api/todos", function(req, res){
	setTimeout(function(){
		res.json([
			{ id: 1, todo: "Get some food" },
			{ id: 2, todo: "Walk the dog" }
		]);
	}, 5);
});

app.listen(8080);
console.error("Listening on port", 8080);
