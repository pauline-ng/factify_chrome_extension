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


const handlerUrl = "http://factpub.org:8080/collectChromeActivity?";
var chromeToken = null;
var factpubId = "anonymous";
var email = null;
var myNotificationID = null;

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
// Preprocessing codes for notification: request permission on page load
document.addEventListener('DOMContentLoaded', function () {
	if (!Notification) {
		alert('Desktop notifications not available in your browser.');
		return;
	}

	if (Notification.permission !== "granted")
		Notification.requestPermission();
});
// Preprocessing codes for notification: request permission on page load
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
			chromeToken = userid;
	}
});
// Codes for generate unique token
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
		fetch(handlerUrl).then(function(response) {
			if(response.status == 200){
				xhr = new XMLHttpRequest();
				var url = tab.url;

				xhr.open('GET', url, true);
				xhr.responseType = "arraybuffer";

				xhr.onload = function() {
					if (isPdfFile(this, url)) {

					console.log("This page is PDF: " + url);

					// Send User Activity to serverRequestHandler
					chrome.storage.sync.get('factpubId', function(items) {
						chrome.identity.getProfileUserInfo(function(userinfo){
							if(items.factpubId == undefined){
								factpubId = "anonymous";
							}else{
								factpubId = items.factpubId;
							};

							//console.log(userinfo);
							var email = userinfo.email;
							sendUserActivityToServer(factpubId, email, chromeToken, url);
						})
					});

					// Notification: Ask user to factify PDF or not.
					var nt = chrome.notifications.create("",{
						type:    "basic",
						iconUrl: "icon.png",
						title:   "Factify Chrome",
						message: url,
						contextMessage: "Send facts of this paper?",
						requireInteraction: true,

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


					} else {
						// The page is HTML file
						// Do nothing.
					}
				}
				xhr.send(null);

			}else{
				// Show Error notification if serverRequestHandler does not have handler.
				// response.status == 404

				console.log("[Error] factpub.org: server process seems not to exist.");
				var nt = chrome.notifications.create("", {
					type:    "basic",
					iconUrl: "icon_no.png",
					title:   "Factify Chrome",
					message: "[Error] factpub.org: server process not exist.",
					contextMessage: response.status + " " + response.statusText
				}, function(id) {
					myNotificationID = id;
				});
			}

	  	}).catch(function(err) {
			console.log("[Error] factpub.org: server process seems down.");
			console.log(err);

				// Show Error notification if serverRequestHandler is down.
				// response.status == 404
				var nt = chrome.notifications.create("", {
					type:    "basic",
					iconUrl: "icon_no.png",
					title:   "Factify Chrome",
					message: "[Error] factpub.org: server seems down.",
					contextMessage: err.toString()
				}, function(id) {
					myNotificationID = id;
				});
		});

	}
});
// Codes when Browser load the page
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////


/* Respond to the user's clicking one of the buttons */
chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
		if (notifId === myNotificationID) {
				if (btnIdx === 0) {

						byteArray = new Uint8Array(xhr.response);
						var msg = {	"pdfUrl": xhr.responseURL,
									"pdfSize":byteArray.length,
									"pdfData":byteArray,
									"factpubId":factpubId,
									"notifId":notifId};

						chrome.notifications.update(notifId, {
						type:    "progress",
						message: "(0/5) Launching the host program.",
						contextMessage: msg.pdfUrl,
						iconUrl: "icon_yes.png",
						progress: 1,
						buttons: []

						}, function(id) {
								myNotificationID = id;
						});

						connectNativeApp(msg, notifId);

				} else if (btnIdx === 1) {
						chrome.notifications.clear(notifId)
				}
		}
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

function sendUserActivityToServer(factpubId, email, chromeToken, url){

	fetch(handlerUrl
		 + "factpubId=" + factpubId
		 + "&email=" + email
		 + "&chromeToken=" + chromeToken
		 + "&url=" + url
		 , {method: "POST"}

	).then(function(handlerRes){
		// console.log(handlerRes);
		// Do Nothing.

	}).catch(function(handlerErr){
		console.log("[Error] POST request cause error.")
		console.log(handlerErr);

	})

}

////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
// Codes for host program
function connectNativeApp(message, notifId) {
	var hostName = "org.factpub.factify";

	port = chrome.runtime.connectNative(hostName);
	console.log(message);
	port.postMessage(message);
	port.name = notifId

	port.onDisconnect.addListener(function(port){

		var message = chrome.runtime.lastError.message;
		var notFound = "Specified native messaging host not found.";
		var notAccessible = "Access to the specified native messaging host is forbidden.";
		// var appExit = "Native host has exited.";

		console.log(message + " : " + port.name);
		if(message == notFound){
			var nt = chrome.notifications.update(notifId, {
				type:    "basic",
				iconUrl: "icon_no.png",
				title:   "Factify Chrome",
				message: "[Error] The host program was not found.",
				contextMessage: "Click here to install the host program.",

				}, function(id) {
						myNotificationID = id;
				});
				console.log("[Error] The host program is not installed.")
				port = null;
		}else if(message == notAccessible){
			var nt = chrome.notifications.update(notifId, {
				type:    "basic",
				iconUrl: "icon_no.png",
				title:   "Factify Chrome",
				message: "[Error] Extension ID not registered.\n" + chrome.runtime.id,
				contextMessage: "Click here to install the host program.",

				}, function(id) {
						myNotificationID = id;
				});
				console.log("[Error] Caller id is not registered.")
				port = null;
		}

		// Redirect to download installation scripts.
		// chrome.notifications.onClicked.addListener(function(notifId) {
		// 	var OSName="Unknown OS";
		// 	if (navigator.appVersion.indexOf("Win")!=-1) OSName="Windows";
		// 	if (navigator.appVersion.indexOf("Mac")!=-1) OSName="MacOS";
		// 	if (navigator.appVersion.indexOf("X11")!=-1) OSName="UNIX";
		// 	if (navigator.appVersion.indexOf("Linux")!=-1) OSName="Linux";
		//
		// 	console.log('Your OS: '+ OSName);
		//
		// 	window.open("http://factpub.org/html/contribute.html");
		//
		// 	chrome.notifications.clear(notifId)
		// });
	})




	port.onMessage.addListener(function(message, port) {

		console.log(port.name + " Message Received: " + JSON.stringify(message));

		chrome.notifications.onClicked.addListener(function(notifId) {
			// nullify onClicked
		});

		var STEP_1_END = "(1/5)Receiving PDF data from extension.";
		var STEP_2_END = "(2/5)Initializing Rule_Matching files.";
		var STEP_3_END = "(3/5)Running extraction process.";
		var STEP_4_END = "(4/5)Sending facts to factpub.org.";
		var STEP_5_END = "(5/5)Facts are donated.";

		if("steps" in message){

			switch(message.steps){
				case STEP_1_END:
						chrome.notifications.update(notifId, {
							type:    "progress",
							message: STEP_1_END,
							progress: 10
						});
					break;

				case STEP_2_END:
						chrome.notifications.update(notifId, {
							type:    "progress",
							message: STEP_2_END,
							progress: 20
						});
					break;

				case STEP_3_END:
						chrome.notifications.update(notifId, {
							type:    "progress",
							message: STEP_3_END,
							progress: 35
						});
					break;

				case STEP_4_END:
						chrome.notifications.update(notifId, {
							type:    "progress",
							message: STEP_4_END,
							progress: 70
						});
					break;

				case STEP_5_END:
						chrome.notifications.update(notifId, {
							type:    "progress",
							message: STEP_5_END,
							progress: 95
						});
					break;
			}
		}else if("url" in message){
			chrome.notifications.onClicked.addListener(function(notifId) {
				window.open(message.url);
				chrome.notifications.clear(notifId)
			});

			chrome.notifications.update(notifId, {
				type:    "progress",
				message: "[Click here to browse the donated facts.]\n"+ message.url,
				contextMessage: STEP_5_END,
				iconUrl: "icon.png",
				progress: 100
			});

		}else if("error" in message){
			chrome.notifications.update(notifId, {
				type:    "basic",
				message: message.error,
				iconUrl: "icon_no.png"
			});

		}

	});


	return port;
}

// Codes for host program
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
