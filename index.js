var document = require("global/document");
var hg = require("mercury");
var h = require("mercury").h;
var isNode = require("detect-node");
var Zone = require("can-wait");
var virtualize = require("vdom-virtualize");

module.exports = App;

var Home = {
	render: function(changePage, loadTodos){
		return h("div", [
			h("div", "Hello world"),
			h("a", {
			  href: "/todos",
			  title: "Todo Page",
			  "ev-click": [loadTodos, hg.sendClick(changePage, "todos", {
				preventDefault: true
			  })]
			}, "Todos")
		]);
	}
};

var Todos = {
	state: function(page){
		var state = hg.state({
			todos: hg.value([]),
			channels: {
				load: loadTodos
			}
		});

		if(page === "todos") {
			loadTodos();
		}

		return state;

		function loadTodos(){
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "http://localhost:8080/api/todos");
			xhr.onload = function(){
				state.todos.set(JSON.parse(xhr.responseText));
			};
			xhr.send();
		}
	},
	render: function(state){
		if(!state.todos.length) {
			return h("div", "Loading...");
		}

		return h("ul", state.todos.map(function(todo){
			return h("li", todo.todo);
		}));
	}
};

function App(){
	var page = location.pathname.split("/").pop() || "home";

	return hg.state({
		page: hg.value(page),
		todo: Todos.state(page),
		channels: {
			changePage: function(state, page){
				state.page.set(page);
				history.pushState({}, page, "/" + page);
			}
		}
	});
}

App.render = function(state){
	return h("div#app", state.page === "home" ?
			 Home.render(state.channels.changePage,
						 state.todo.channels.load) :
			 Todos.render(state.todo));
};

if(!isNode) {
	new Zone().run(App).then(function(data){
		var app = data.result;

		var root = document.querySelector("#app");
		var prevTree = virtualize(root);

		hg.app(true, app, App.render, {
			initialTree: prevTree,
			target: root
		});

		app.set(app());
	});
}
