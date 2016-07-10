// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var port = null;

var getKeys = function(obj){
   var keys = [];
   for(var key in obj){
      keys.push(key);
   }
   return keys;
}

function appendMessage(text) {
  document.getElementById('response').innerHTML += "<p>" + text + "</p>";
}

function updateUiState() {
  if (port) {
    document.getElementById('connect-button').style.display = 'none';
    document.getElementById('input-text').style.display = 'block';
    document.getElementById('send-message-button').style.display = 'block';
  } else {
    document.getElementById('connect-button').style.display = 'block';
    document.getElementById('input-text').style.display = 'none';
    document.getElementById('send-message-button').style.display = 'none';
  }
}

function sendNativeMessage() {
  message = {"text": document.getElementById('input-text').value};
  port.postMessage(message);
  appendMessage("Sent message: <b>" + JSON.stringify(message) + "</b>");
}

function onNativeMessage(message) {
  appendMessage("Received message: <b>" + JSON.stringify(message) + "</b>");
}

function onDisconnected() {
  appendMessage("Failed to connect: " + chrome.runtime.lastError.message);
  port = null;
  updateUiState();
}

function connect() {
  var hostName = "org.factpub.factify"; 
  
  appendMessage("Connecting to native messaging host <b>" + hostName + "</b>")
  port = chrome.runtime.connectNative(hostName);
  port.onMessage.addListener(onNativeMessage);
  port.onDisconnect.addListener(onDisconnected);
  
  chrome.tabs.getSelected(window.id, function (tab) {
			//tab.urlに開いているタブのURLが入っている
			message = {"url": tab.url};
			port.postMessage(message);

	});
  
  
  updateUiState();
}

function savepdf() {
	console.log("savePDF is performed.");
	
	chrome.tabs.getSelected(window.id, function (tab) {
		//tab.urlに開いているタブのURLが入っている
		document.getElementById('input-text').value = tab.url
		console.log(tab.url);
	});

}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('connect-button').addEventListener('click', connect);
  document.getElementById('savepdf-button').addEventListener('click', savepdf);
  //document.getElementById('savepdf-button').addEventListener('click', safepdf);
  document.getElementById('send-message-button').addEventListener('click', sendNativeMessage);
  updateUiState();
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    //if (tab.url.indexOf('.pdf') != -1) {
        // page action show
        chrome.pageAction.show(tabId);
    //}
});

// Clicked?
chrome.pageAction.onClicked.addListener(function() {
	document.getElementById('connect-button').addEventListener('click', connect);
	document.getElementById('send-message-button').addEventListener('click', sendNativeMessage);	
	connect();
	console.log("callback in saveAsMHTML is performed!")
	chrome.pageCapture.saveAsMHTML(tabId, function(mhtmlData){
		console.log("callback in saveAsMHTML is performed!")
	});
});