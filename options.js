$(function(){

	$("#login").click(function () {

	  	//TODO: must authenticate first
	  	console.log("Authentication is being performed...")

	  	var factpubId = $("#factpubId").val();
	  	var password = $("#password").val();

	  	console.log(factpubId + " : " + password)

	  	if(true){
		    chrome.storage.sync.set({"factpubId" : factpubId}, function() {
				alert("FactPub ID was set: " + factpubId)
			});
		}else{
			console.log("[Error] FactPub Authentication Failed");
			alert("[Error] FactPub Authentication Failed");
		}
		
	});
});