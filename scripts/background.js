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
function isPdfFile(response, url) {
  var header = response.getResponseHeader('content-type');
  if (header) {
    var headerValue = header.toLowerCase().split(';', 1)[0].trim();
    return (headerValue === 'application/pdf' ||
            headerValue === 'application/octet-stream' &&
            url.toLowerCase().indexOf('.pdf') > 0);
  }
}

// 
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (tab.url.indexOf('dotinstall') != -1) {
        // page action show
        chrome.pageAction.show(tabId);
    }
});

// Page Action?
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

    
    xhr = new XMLHttpRequest();
    var url = tab.url;

    xhr.open('GET', url, true);
    xhr.responseType = "arraybuffer";

    xhr.onload = function() {
      if (isPdfFile(this, url)) {
        chrome.pageAction.show(tabId);
        console.log(url);
        console.log("This page is PDF -- page action is activated.");

      } else {
        // The page is HTML file
      }
    }

    xhr.send(null);
});

// Clicked?
chrome.pageAction.onClicked.addListener(function() {
    console.log("Page Action is clicked!");
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
});

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
