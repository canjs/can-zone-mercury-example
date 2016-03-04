// The XHR polyfill is lame and doesn't use prototypes

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var XHR = global.XMLHttpRequest = function(){
	XMLHttpRequest.apply(this, arguments);

	this.onload = null;

	this._send = this.send;
	this.send = XHR.prototype.send;
};

XHR.prototype.send = function(){
	return this._send.apply(this, arguments);
};
