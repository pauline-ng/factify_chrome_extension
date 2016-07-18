/**
 *  Author: Sun SAGONG
 *  Copyright (C) 2016, Genome Institute of Singapore, A*STAR
 *   
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *   
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *   
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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

function sendNativeMessage(key, val) {
  message = {key: val};
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


function writeToLocal(filename, content) {
    // reject if the browser is not chrome
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf('chrome') == -1) {
        alert("This Page is Google Chrome only!");
    }

    function errorCallback(e) {
        alert("Error: " + e.name);
    }

    function fsCallback(fs) {
        fs.root.getFile(filename, {create: true}, function(fileEntry) {
            fileEntry.createWriter(function(fileWriter) {

                fileWriter.onwriteend = function(e) {
                    alert("Success! : " + fileEntry.fullPath);
                };

                fileWriter.onerror = function(e) {
                    alert("Failed: " + e);
                };

                var output = new Blob([content], {type: "application/pdf"});
                fileWriter.write(output);
            }, errorCallback);
        }, errorCallback);
    }
    // クオータを要求する。PERSISTENTでなくTEMPORARYの場合は
    // 直接 webkitRequestFileSystem を呼んでよい
    webkitRequestFileSystem(TEMPORARY, 1024, fsCallback, errorCallback);
}

function savePDF() {
	console.log("savePDF clicked.");
	if (window.File && window.FileReader && window.FileList && window.Blob) {
	console.log("File API is supported!")
	writeToLocal("hoge.txt", "foo\n");
	
	} else {
	console.log("File API is not supported.");
	}
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('connect-button').addEventListener('click', connect);
  document.getElementById('save-pdf-button').addEventListener('click', savePDF);
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