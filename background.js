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

/**
	* Check if the page is a PDF file.
	* @param {Object} details First argument of the webRequest.onHeadersReceived
	*                         event. The properties "responseHeaders" and "url"
	*                         are read.
	* @return {boolean} True if the resource is a PDF file.
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
				console.log("The token stored: " + userid)
		}
});
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
		alert('Desktop notifications not available in your browser. Try Chromium.'); 
		return;
	}

	if (Notification.permission !== "granted")
		Notification.requestPermission();
});

var myNotificationID = null;
function notifyMe(url) {
	if (Notification.permission !== "granted")
		Notification.requestPermission();
	else {

			chrome.notifications.create("", {
				type:    "basic",
				iconUrl: "icon.png",
				title:   "Factify Chrome",
				message: url,
				contextMessage: "Send facts of the above paper?",

				// Only be able to show up till two buttons
				// https://developer.chrome.com/apps/richNotifications#behave
				buttons: [{
						title: "Yes, donate facts to factpub.org.",
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

	}

}

/* Respond to the user's clicking one of the buttons */
chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
		if (notifId === myNotificationID) {
				if (btnIdx === 0) {
						runNativeApp();
						// chrome.notifications.clear(notifId)
						
						chrome.notifications.update(notifId, {
						type:    "progress",
						title:   "Factify Chrome",
						contextMessage: "Start extracting facts from PDF...",
						iconUrl: "icon_yes.png",
						progress: 10,
						buttons: []


						}, function(id) {
								myNotificationID = id;
						});


				} else if (btnIdx === 1) {
						chrome.notifications.clear(notifId)
				}
		}
});

/* Add this to also handle the user's clicking 
 * the small 'x' on the top right corner */
chrome.notifications.onClosed.addListener(function() {
		saySorry();
});
// Codes for notification
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
// Codes when Browser load PDF
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

	// Use JavaScript Promise instead of XMLHttpRequest()
	// 
	// The JavaScript promises API will treat anything with 
	// a then method as promise-like (or thenable in promise-speak *sigh*),
	// so if you use a library that returns a Q promise, that's fine,
	// it'll play nice with the new JavaScript promises.

	// Although, as I mentioned, jQuery's Deferreds are a bitÅc unhelpful.
	// Thankfully you can cast them to standard promises,
	// which is worth doing as soon as possible:

	// Get file name with extension.
	// var url = tab.url;
	// var file = url;

	// var jsPromise = Promise.resolve($.ajax(file));

	// // url (required), options (optional)
	// fetch(tab.url, {
	// 	method: 'get'
	// }).then(function(response) {
		
	// }).catch(function(err) {
	// 	// Error :(
	// });


	xhr = new XMLHttpRequest();
	var url = tab.url;

	xhr.open('GET', url, true);
	xhr.responseType = "arraybuffer";

	xhr.onload = function() {
		if (isPdfFile(this, url)) {
			//chrome.browserAction.show(tabId);
			console.log(url);
			console.log("This page is PDF -- page action is activated.");
		
		//TODO: show pop-up window 
		
		// Show confirmation dialog box for user choice.
		// var x;
		// if (confirm("Do you wanna extract this PDF?") == true) {
		//     x = "Okay, start extracting..";
		//     console.log("Native App will be launched");
		// } else {
		//     x = "Do nothing.";
		// }
		// console.log(x);

		// setPopup only set the specified html for pop-up. it does not show pop-up.
	//   chrome.browserAction.setPopup({
	//     "popup": "popup.html"
	// });
		
		notifyMe(url);

		console.log("You must have seen the popup window...");
		
		//runNativeApp();
			
		//chrome.browserAction.popup({url : "popup.html"}); 
		} else {
			// The page is HTML file
		}
	}

	xhr.send(null);
});

// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//     console.log(tabId);
//     if (domains.contains(tab.url)) {
//         chrome.browserAction.setPopup({
//             tabId: tabId,
//             popup: 'popup.html'
//         });
//     } else {
//         chrome.browserAction.setPopup({
//             tabId: tabId,
//             popup: 'popup.html'
//         });
//     }
// });

function runNativeApp(){
		
		console.log(xhr);
		pdfData = {"responseURL": null, "size":0, "pdf":null};

		////////////////////////////
		// bufferarray - scenario //
		////////////////////////////
		byteArray = new Uint8Array(xhr.response);
		pdfData.responseURL = xhr.responseURL;
		pdfData.size = byteArray.length;
		pdfData.pdf = byteArray;

		/////////////////////
		// output //
		/////////////////////
		console.log(pdfData.responseURL)
		console.log(pdfData.size);
		console.log(pdfData.pdf);
		connectNativeApp();  
}

function connectNativeApp() {
	console.log("Connecting to NativeApp...");
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
