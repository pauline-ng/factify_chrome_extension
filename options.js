$(function(){

	$("#login").click(function () {

	  	//TODO: must authenticate first
	  	console.log("Authentication is being performed...")

	  	var lgname = $("#factpubId").val();
	  	var lgpassword = $("#password").val();
	  	var lgtoken = "";


	  	// Authentication 1st batch
	  	var reqURL1 = "http://factpub.org/wiki/api.php?" 
			  		+ "format=json"
			  		+ "&action=login" 
			  		+ "&lgname=" + lgname 
			  		+ "&lgpassword=" + lgpassword 
			  		+ "&lgtoken=" + lgtoken

		console.log("reqURL1: " + reqURL1)	
	  	fetch(reqURL1
	  		, {	method: "POST",
				credentials: 'include'}
	  	
	  	).then(function(response1){	
			console.log("Authentication 1st batch done.")
			
			promiseObj = response1.json();
			promiseObj.then(function(res){console.log(res)
				var cookieprefix = res.login.cookieprefix;
				var result = res.login.result;
				var lgtoken = res.login.token;
				var sessionid = res.login.sessionid;
				console.log(cookieprefix + " : " + lgtoken + " : " + sessionid + " : " + result)

				if(result == "NeedToken"){
					// 2nd batch
					var reqURL2 = "http://factpub.org/wiki/api.php?" 
						  		+ "format=json"
						  		+ "&action=login" 
						  		+ "&lgname=" + lgname 
						  		+ "&lgpassword=" + lgpassword 
						  		+ "&lgtoken=" + lgtoken;

					console.log("reqURL2: " + reqURL2)
					fetch(reqURL2,
						{method: 'POST',
						credentials: 'include',
			  			headers: {"Cookie": "paper_facts_session=" + sessionid}
			  		}
			  		
			  		).then(function(response2){
						console.log("Authentication 2nd batch done.")
			
						promiseObj2 = response2.json();
						promiseObj2.then(function(res){

							var cookieprefix = res.login.cookieprefix;
							var result = res.login.result;
							var lgtoken = res.login.token;
							var sessionid = res.login.sessionid;
							console.log(res)
							console.log(cookieprefix + " : " + lgtoken + " : " + sessionid + " : " + result)
							if(result == "Success"){
								var factpubId = res.login.lgusername;
								chrome.storage.sync.set({"factpubId" : factpubId}, function() {
									console.log("Set FactPub ID: " + factpubId)
								});
								
								alert("Success: Log in as [" + factpubId + "]");
							}else{
								chrome.storage.sync.set({"factpubId" : "Anonymous"}, function() {
									console.log("Set FactPub ID: " + "Anonymous")
								});

								alert("Wrong ID or Password: Log in as an Anonymous user.");
							}
							
						});

			  		}).catch(function(err){
						console.log("[Error] Authentication 2nd batch failed")
						console.log(err)
					})
				}
			})
			
			

		}).catch(function(err){
			console.log("[Error] Authentication 1st batch failed")
			console.log(err)
		
		})

	});
});