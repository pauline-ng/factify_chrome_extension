/*
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

////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
// Codes for checking if the page is PDF
function isPdfFile(response, url) {
	var header = response.getResponseHeader('content-type');
	if (header) {
		var headerValue = header.toLowerCase().split(';', 1)[0].trim();
		return (headerValue === 'application/pdf' ||
						headerValue === 'application/octet-stream' &&
						url.toLowerCase().indexOf('.pdf') > 0);
	}
}
// Codes for checking if the page is PDF
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
// Codes for generate unique token
function getRandomToken() {
		// E.g. 8 * 32 = 256 bits token
		var randomPool = new Uint8Array(32);
		crypto.getRandomValues(randomPool);
		var hex = '';
		for (var i = 0; i < randomPool.length; ++i) {
				hex += randomPool[i].toString(16);
		}
		// E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
		return hex;
}


// https://developer.chrome.com/extensions/storage
// storage.sync => the token is valid for one user (multiple machine as long as user use Chrome with their credential)
// storage.local => the token is only valid for one machine

chrome.storage.sync.get('userid', function(items) {
		var userid = items.userid;
		if (userid) {
			// if token exists
				useToken(userid);
		} else {
			// if token does not exist
				userid = getRandomToken();
				chrome.storage.sync.set({userid: userid}, function() {
						useToken(userid);
				});
		}
		function useToken(userid) {
				// TODO: Use user id for authentication or whatever you want.
				console.log("The stored token for Factify Chrome: " + userid)
		}
});
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
// Codes when Browser load the page
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

	if(changeInfo.status == "complete"){
	
		//TODO: check if serverRequestHandler is alive
		var handlerUrl = "http://factpub.org:8080/get/";
		fetch(handlerUrl).then(function(response) {
			if(response.status == 200){
				xhr = new XMLHttpRequest();
				var url = tab.url;

				xhr.open('GET', url, true);
				xhr.responseType = "arraybuffer";

				xhr.onload = function() {
					if (isPdfFile(this, url)) {

					console.log("This page is PDF: " + url);
					notifyMe(url);
					
					//runNativeApp();
					
					} else {
						// The page is HTML file
						// Do nothing.
					}
				}
				xhr.send(null);

			}else{
				// response.status == 404
				var nt = chrome.notifications.create("", {
					type:    "basic",
					iconUrl: "icon_no.png",
					title:   "Factify Chrome",
					message: "[Error] factpub.org server seems not alive.",
					contextMessage: response.status + " " + response.statusText
				}, function(id) {
					myNotificationID = id;
				});
			}

	  	}).catch(function(err) {
			console.log("[Error] Unknown Error Occured.");
			console.log(err);
			
		});

	}
});
// Codes when Browser load the page
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
// Codes for notification
// request permission on page load
document.addEventListener('DOMContentLoaded', function () {
	if (!Notification) {
		alert('Desktop notifications not available in your browser.'); 
		return;
	}

	if (Notification.permission !== "granted")
		Notification.requestPermission();
});

var myNotificationID = null;
var myNotification = {}; //Hashmap

function notifyMe(url) {
	if (Notification.permission !== "granted")
		Notification.requestPermission();
	else {

			var nt = chrome.notifications.create("", {
				type:    "basic",
				iconUrl: "icon.png",
				title:   "Factify Chrome",
				message: url,
				contextMessage: "Send facts of this paper?",

				// Only be able to show up till two buttons
				// https://developer.chrome.com/apps/richNotifications#behave
				buttons: [{
						title: "Yes, donate facts to factpub.org",
						iconUrl: "icon_yes.png"
				}, {
						title: "No.",
						iconUrl: "icon_no.png"
				}]
				}, function(id) {
						myNotificationID = id;
				});
		// notification.onclick = function () {
		//   console.log("start Factify: " + url)
		//   confirm("wanna factify?");
		// };
			console.log("notification" + nt)
//		myNotifications[] = 
	}

}


/* Respond to the user's clicking one of the buttons */
chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
		if (notifId === myNotificationID) {
				if (btnIdx === 0) {
						// chrome.notifications.clear(notifId)
						
						chrome.notifications.update(notifId, {
						type:    "progress",
						contextMessage: "Launching extraction process...",
						iconUrl: "icon_yes.png",
						progress: 5,
						buttons: []

						}, function(id) {
								myNotificationID = id;
						});

						
						//launch worker task
						var pdfData = {"responseURL": null, "size":0, "pdf":null};

						////////////////////////////
						// bufferarray - scenario //
						////////////////////////////
						byteArray = new Uint8Array(xhr.response);
						pdfData.responseURL = xhr.responseURL;
						pdfData.size = byteArray.length;
						pdfData.pdf = byteArray;

						connectNativeApp(pdfData);
						

				} else if (btnIdx === 1) {
						chrome.notifications.clear(notifId)
				}
		}
});

chrome.notifications.onClicked.addListener(function(notifId) {
		chrome.notifications.getAll(function(notifications){
			console.log(notifications[notifId].message())
		});
		//window.open(notifId.message);
});

/* Add this to also handle the user's clicking 
 * the small 'x' on the top right corner */
chrome.notifications.onClosed.addListener(function(notifId) {
		console.log("Notification ID: " + notifId + " is closed");
});
// Codes for notification
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
// Codes for host program
function connectNativeApp(pdfData) {
	var hostName = "org.factpub.factify";

	port = chrome.runtime.connectNative(hostName);
	port.onMessage.addListener(onNativeMessage);
	port.onDisconnect.addListener(onDisconnected);

	message = {"responseURL": pdfData.responseURL, "size": pdfData.size, "pdf": pdfData.pdf};

	console.log(message);
	port.postMessage(message);

	// updateUiState();
}

function onNativeMessage(message) {
	console.log("onNativeMessage is called.");
}

function onDisconnected() {
	console.log("onDisconnected is called.");
	port = null;
	//updateUiState();
}
// Codes for host program
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
