chrome.runtime.sendMessage({ action: "show"});

!(function(window, document){
	var gbang = {
		init: function(){
			this.appendBangElements();
			this.watchSerachBox();
		},
		selectors : {
			searchBox : document.getElementById("lst-ib"),
			autoCompleteBox: document.querySelectorAll("#sbtc > div.gstl_0.sbdd_a")[0],
			searchResultsContainer: document.getElementById("cnt")
		},
		states : {
			gsActivated: true,
			bangSearchActivated: false,
		},
		appendBangElements: function(){
			// create and append new search text input
			var searchBox = document.createElement("input");
			searchBox.setAttribute("style", this.selectors.searchBox.getAttribute('style') );
			searchBox.id = "bang-search-box";
			searchBox.style.display = "none";
			document.getElementById("gs_lc0").appendChild(searchBox);
			// create and append new autocomplete box
			var acBox = document.createElement("div");
			acBox.setAttribute("style", document.querySelectorAll("#sbtc > div.gstl_0.sbdd_a")[0].getAttribute('style') );
			acBox.id = "bang-ac";
			acBox.style.display = "none";
			document.getElementById("sbtc").appendChild(acBox);
			// create and append new search submit btn
			var el =  document.querySelector("#sblsbb > button").cloneNode(true);
			el.type="button";
			el.id = "bang-search-submit";
			el.style.display = "none";
			document.getElementById("sblsbb").appendChild(el);
		},
		watchSerachBox : function(){
			var bangSearchBox = document.getElementById("bang-search-box");
			var searchResultsContainer = document.getElementById("cnt");
			
			// check initial value
			if(this.selectors.searchBox.value){
				if(this.selectors.searchBox.value[0] === "!"){
					bangSearchBox.value = this.selectors.searchBox.value;
					this.setBangSearch();
					this.getBangACData(this.selectors.searchBox.value.split(" ")[0]);
				}
			}

			// detect input events rather than keyword ones, like copy/paste
			// [].forEach.call([this.selectors.searchBox, bangSearchBox], function(el) {
			// 	var $this = this;
			// 	console.log(el);
			// 	e.addEventListener("input", function(e){
			// 		if(e.srcElement.value[0] === "!"){
			// 			bangSearchBox.value = $this.selectors.searchBox.value;
			// 			$this.setBangSearch();
			// 			$this.getBangACData(e.srcElement.value.split(" ")[0]);
			// 		}
			// 	});
			// }.bind(this));


			// detect keyboard events 
			this.selectors.searchBox.addEventListener("keyup", function (event) {
				bangSearchBox.value = this.selectors.searchBox.value;
				if(bangSearchBox.value[0] === "!"){
					if(bangSearchBox.value.length === 1){
						this.setBangSearch();
					}
				}else{
					this.setGoogleSearch();
				}

			}.bind(this));
			
			bangSearchBox.addEventListener("keyup", function (event) {
				this.selectors.searchBox.value = bangSearchBox.value;
				if (this.selectors.searchBox.value.length === 0){
					this.setGoogleSearch();
				}

				if(event.keyCode !== 32 && bangSearchBox.value.split(" ").length === 1){
					this.getBangACData(bangSearchBox.value);
				}else if(event.keyCode === 13){
					this.getBangLink(bangSearchBox.value);
				}
			}.bind(this));
			
			bangSearchBox.addEventListener("keydown", function (event) {
				if(event.keyCode === 13){
					searchResultsContainer.style.display = "none";
				}
			});

			document.getElementById("bang-search-submit").addEventListener('click', function(event) {
				if(bangSearchBox.value) this.getBangLink(bangSearchBox.value);
			}.bind(this), false);

			document.getElementById('bang-ac').addEventListener('click', function(event) {
				var el = event.target;
				while (el && el.className !== "acp--bang") {
					el = el.parentNode;
				}
				el.value
				if(bangSearchBox.value[0] === "!"){
					bangSearchBox.value = (bangSearchBox.value.indexOf(" ") === -1) ? el.getElementsByClassName("acp--bang__phrase")[0].innerText : el.getElementsByClassName("acp--bang__phrase")[0].innerText + " " + bangSearchBox.value.slice(bangSearchBox.value.indexOf(" ")+1)
					bangSearchBox.focus();
				}

			}, false);
		},
		setGoogleSearch: function(){
			this.states.gsActivated = true;
			if(this.states.bangSearchActivated){
				this.states.bangSearchActivated = false;
				document.getElementById("bang-search-box").style.display = "none";
				document.getElementById("bang-ac").style.display = "none";
				document.getElementById("bang-search-submit").style.display = "none";
			}
			if (document.getElementById("cnt") && document.getElementById("cnt").style.display === "none" ) document.getElementById("cnt").style.display = "block";
			document.querySelector("#sblsbb > button:first-child").style.display = "block";
			this.selectors.searchBox.style.display = "block";
			this.selectors.searchBox.focus();
			document.querySelector("#sbtc > div.gstl_0.sbdd_a").style.display = "block";
		},
		setBangSearch: function(){
			this.states.bangSearchActivated = true;
			if(this.states.gsActivated){
				this.states.gsearchActivated = false;
				this.selectors.searchBox.style.display = "none";
				document.querySelector("#sbtc > div.gstl_0.sbdd_a").style.display = "none";
				document.querySelector("#sblsbb > button:first-child").style.display = "none";
			}
			var bangSearchBox = document.getElementById("bang-search-box");

			document.getElementById("bang-ac").style.display = "block";
			document.getElementById("bang-search-submit").style.display = "block";
			document.getElementById("bang-ac").style.width = document.querySelector("#sfdiv > .sbib_a").getBoundingClientRect().width + "px";
			bangSearchBox.style.display = "block";
			bangSearchBox.classList.add("bang-search-box");
			bangSearchBox.focus();

		},
		getBangACData: function(queryText){
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "https://ac.duckduckgo.com/ac/?format=json&q=" + queryText, true);
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					var ACHTMLRowsLeft = "", ACHTMLRowsRight= "";
					JSON.parse(xhr.response).forEach(function(obj, i){
						if(i <= JSON.parse(xhr.response).length/2){
							ACHTMLRowsLeft += '<div class="acp--bang" id="index-'+i+'">' +
									              '<div class="acp--bang__img-wrap"><img src="'+ obj.image +'" class="acp--bang__img" alt=""></div>' +
									              '<div class="acp--bang__body"><span class="acp--bang__phrase">'+ obj.phrase +'</span><span class="acp--bang__snippet">'+ obj.snippet +'</span></div>' +
									          '</div>';
						}else{
							ACHTMLRowsRight += '<div class="acp--bang" id="index-'+i+'">' +
									              '<div class="acp--bang__img-wrap"><img src="'+ obj.image +'" class="acp--bang__img" alt=""></div>' +
									              '<div class="acp--bang__body"><span class="acp--bang__phrase">'+ obj.phrase +'</span><span class="acp--bang__snippet">'+ obj.snippet +'</span></div>' +
									          '</div>';
						}
					});

					var autoCompleteHTML = '<div class="search__autocomplete">' +
											    '<div class="acp-wrap">' +
											    '<div class="progress-bar"></div>' +
											        '<div class="acp-wrap__column acp-wrap__column--left">' +
											            ACHTMLRowsLeft +
											        '</div>' +
											        '<div class="acp-wrap__column acp-wrap__column--right">' +
											        	ACHTMLRowsRight +
											        '</div>' +
											    '</div>' +
											    '<div class="acp-footer"><span class="acp-footer__instructions">Select a !bang for a direct site search - <a href="https://duckduckgo.com/bang" target="_blank"> Results from duckduckgo <img src="https://images.duckduckgo.com/iu/?u=http%3A%2F%2Fduckduckgo.com%2Fassets%2Ficons%2Fautocomplete%2Fsafeoff.png%3FimgFallback%3D%2Fassets%2Ficons%2Ffavicons%2Fbang.png%3FimgFallback%3D%2Fassets%2Ficons%2Ffavicons%2Fbang.png%3FimgFallback%3D%2Fassets%2Ficons%2Ffavicons%2Fbang.png%3FimgFallback%3D%2Fassets%2Ficons%2Ffavicons%2Fbang.png&f=1" class="ddgo-small-logo"/></a></span><span class="acp-footer__link"><a class="no-visited" href="https://duckduckgo.com/bang">View all !bangs</a></span></div>' +
											'</div>';
					var invalidBangMsg = '<div class="search__autocomplete">' +
											    '<div class="acp-wrap">' +
											    '<div class="invalid-bang-msg"> this is not a valid bang, please try another one. </div>'+
											    '</div>' +
											    '<div class="acp-footer"><span class="acp-footer__instructions">Select a !bang for a direct site search - <a href="https://duckduckgo.com/bang" target="_blank"> Results from duckduckgo <img src="https://images.duckduckgo.com/iu/?u=http%3A%2F%2Fduckduckgo.com%2Fassets%2Ficons%2Fautocomplete%2Fsafeoff.png%3FimgFallback%3D%2Fassets%2Ficons%2Ffavicons%2Fbang.png%3FimgFallback%3D%2Fassets%2Ficons%2Ffavicons%2Fbang.png%3FimgFallback%3D%2Fassets%2Ficons%2Ffavicons%2Fbang.png%3FimgFallback%3D%2Fassets%2Ficons%2Ffavicons%2Fbang.png&f=1" class="ddgo-small-logo"/></a></span><span class="acp-footer__link"><a class="no-visited" href="https://duckduckgo.com/bang">View all !bangs</a></span></div>' +
											'</div>';
					document.getElementById("bang-ac").innerHTML = (JSON.parse(xhr.response).length === 0) ? invalidBangMsg : autoCompleteHTML;
				}

			}.bind(this);
			xhr.send();
		},
		getBangLink: function(queryText){
			this.toggleLoader(true);
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "https://api.duckduckgo.com/?format=json&no_redirect=1&q=" + queryText, true);
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					this.toggleLoader(false);
					if(JSON.parse(xhr.response).Redirect !== ""){
						window.location.replace(JSON.parse(xhr.response).Redirect);
					}else{
						this.setGoogleSearch();
						this.triggerKeyboardEvent(this.selectors.searchBox, 13);
					}
				}
			}.bind(this);
			xhr.send();
		},
		toggleLoader: function(show){
			if(!document.getElementById("loader")){
				var el = document.createElement("div");
				var loader = '<div class="loader"><svg version="1.1" id="loader" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="28px" height="28px" viewBox="0 0 50 50" style="enable-background:new 0 0 50 50;" xml:space="preserve"><path fill="#fff" d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z"><animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.6s" repeatCount="indefinite" /></path></svg></div>';
				el.innerHTML = loader;
				document.querySelector("#sblsbb > button").appendChild(el);
			}
			document.querySelector("#sblsbb .loader").style.display = show ? "block": "none";
			document.querySelector("#sblsbb .sbico").style.display = show ? "none": "block";
		},
		triggerKeyboardEvent: function(el, keyCode) {
		    var eventObj = document.createEventObject ?
		        document.createEventObject() : document.createEvent("Events");

		    if (eventObj.initEvent) {
		        eventObj.initEvent("keydown", true, true);
		    }

		    eventObj.keyCode = keyCode;
		    eventObj.which = keyCode;

		    el.dispatchEvent ? el.dispatchEvent(eventObj) : el.fireEvent("onkeydown", eventObj);

		}
	};

	function init(){
		if(document.readyState == "complete" && document.querySelectorAll("#sbtc > div.gstl_0.sbdd_a").length === 1){
			gbang.init();
			clearTimeout(interval);
		}else{
			var interval = setTimeout(function(){
				init();
			}, 500);
		}
	}
	init();

})(window, document);