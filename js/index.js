var carousel_width = -1;
var default_container_width = -1;
var tag_array = [];
var BASE_URL = "http://localhost:8000/";
var USERNAME = "username";
var PASSWORD = "password";
var user = {};
var listingsArray = [];
var listingsSelectedArray = [];
var tagsArray = [];

$(document).ready(function(){
	initialize();

    // $.ajax({
    //     url: BASE_URL + "tags"
    // }).then(function(data) {
    // 	populateTags(data.tags);
    
    // });

    // $.ajax({
    //     url: BASE_URL + "listings"
    // }).then(function(data) {
    // 	console.log('got listings ' + data);
    // 	populateListings(data.listings);
    // });

});


function signout(){
  clearCookie(USERNAME);
  window.location.reload();
}


function onSigninClose(){
	$('#sign_in_container').hide();
	$('#register_button').show();
	$('#close_button').hide();
	$('#sign_in_button').css("border-radius", "0px 0px 3px 3px");
}

function signin(){
	console.log('signin click');
	if(!($('#sign_in_container').is(':visible'))){
		$('#sign_in_container').show();
		$('#signed_in_container').css("background", "#666");
		$('#register_button').hide();
		$('#sign_in_button').css("border-radius","3px");
		$('#close_button').show();
	}else{
		var username = $("#sign_in_username").val();
		var password = $("#sign_in_password").val();
		if((username.length > 0)&&(password.length > 0)){
			authenticateUser(username, md5(password));
		}else{
			showSigninError("Invalid Credentials", false);
		}
	}
	$('#cancel_button').show();
}


function register(){
	if(!($('#sign_in_container').is(':visible'))){
		$('#sign_in_container').show();
		$('#sign_in_email').show();
		$('#sign_in_button').hide();
		//$('#sign_in_button').css("border-radius","3px");
		//$('#signed_in_container').css("background","#666");
	}else{
		//$('#signed_in_container').css("background","");
		var username = $("#sign_in_username").val();
		var password = $("#sign_in_password").val();
		var email = $("#sign_in_email").val();

		if((username.length > 0)&&(password.length > 0) && (email.length > 0)){
			registerUser(username, password, email);
		}else{
			showSigninError("Please try again.", true);
		}
	}
}

function getName(){
  var name = getCookie(USERNAME);
  $('#sign_in_container').hide();
  if(name != null && name.length > 0){
    $("#signed_in_name").append("hello, " + name);
    $("#sign_out_button").show();
    $("#sign_in_button").hide();
    $('#signup_container').hide();
    $('#register_button').hide();
  }else{
     $("#sign_in_button").show();
     $("#signed_in_name").hide();
     $("#sign_out_button").hide();
  }
  console.log('name is : ' + name);
}


function setName(){
  var username = $('#username_input').val();
  var password = $('#password_input').val();

  //registerUser(username, password);
  setCookie(USERNAME, username, 5);
}


function showSigninError(message, floatRight){
	$('#sign_in_error').text(message);
	$('#sign_in_error').show();
	$('#sign_in_error').css("float", floatRight ? "right" : "none");
}


function authenticateUser(username, passwordHash){
	console.log('authenticate : ' + username + ' password ' + passwordHash);

	var requestBody = {
    	"Username" : username,
   	 	"PasswordHash" : passwordHash
  	}

 	$.ajax({
        url: BASE_URL + "user/authenticateUser",
        data: requestBody,
        dataType: 'json',
        type: 'POST',
        context: document.body,
        success: function(response) {
	        if(response.IsSuccess){
	        	setCookie(USERNAME, username, 5);
	         	console.log('authenticated user: ' + username);
	         	user = response.user;
	         	console.log(response);
	         	console.log('we got a user ' + user.userid);
 	            window.location.reload();
	        }else{
	            showSigninError("Invalid Credentials");
	        	console.log('invalid credentials for: ' + username);
	        }
     	}
    });
}


function registerUser(username, password, email){
	console.log('lets register a user');
	var passwordHash = md5(password);
  	var requestBody = {
    	"Username" : username,
   	 	"PasswordHash" : passwordHash
  	}

 	$.ajax({
        url: BASE_URL + "user/registerUser",
        data: requestBody,
        dataType: 'json',
        type: 'POST',
        context: document.body,
        success: function(response) {
	        if(response.IsSuccess){
	           // window.location.reload();
	           authenticateUser(username, passwordHash);
	         	console.log('registered, now lets try to login with: ' + username + " . password; " + passwordHash);
	        }else{
	        	console.log('username already taken ' + username);
	        }
     	}
    });
}


function setCookie(cname, cvalue, exdays) {
 	var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}


function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}


function clearCookie(cname){
	document.cookie = cname + "=" + ";" + "expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}


function populateListings(listings){
	console.log('listing size: ' + listings.length);
	setTags(listings);
	listingsArray = listings;
	console.log(listingsArray[0]);
}


function setTags(listingsArray){
	for(var i=0;i<listingsArray.length;i++){
		var tags = listingsArray[i].tags.toString().split(',');
		outerloop:
		for(var j=0;j<tags.length;j++){
			for(var key in tagsArray){
				if(key == tags[j]){
					//console.log('found a dup ' + key + " " + tags[j]);
					tagsArray[tags[j]] = tagsArray[tags[j]] + 1;
					break outerloop;
				}
			}
			tagsArray[tags[j]] = 1;
		}
	}

	for(var key in tagsArray){
		console.log('number of tags: ' + tagsArray[key]);
		$('#tags_container').append("<div class='tag' tagname='" + key  + "'>" +  key + " (" + tagsArray[key]+ ")</div>");
		console.log('tag: ' + key + " count: " + tagsArray[key]);
	}
	$('.tag').click(onTagClicked);
}


function populateItems(itemsList){
	console.log('pop items');
	for(i=0;i<itemsList.length;i++){
		console.log('item name: ' + itemsList[i].name);
	}
}


function populateTags(tags){
	tag_array = tags.toString().split(",");
	console.log('array ' + tag_array);
    $( "#tags" ).autocomplete({
      source: tag_array
    });
}

$(window).resize(function() {
	setCarousel();
});


function initialize(){
	//$('#header').load("header.html", onHeaderLoaded);
}


function onHeaderLoaded(){
	
}


function setListeners(){
	
}



// function onTagClicked(){
// 	var t = $(this).attr("tagname");
// 	listingsSelectedArray = [];
// 	for (var listing in listingsArray){
// 		//alert(typeof listingsArray[listing].tags.toString());
// 		if(listingsArray[listing].tags.toString().includes(t)){
// 			listingsSelectedArray.push(listingsArray[listing]);
// 			console.log('yes this listing: ' + listingsArray[listing]._id);
// 		}
// 		//console.log('listing: ' + listingsArray[listing].tags);
// 	}
// 	populateSelectedListings();
// }


// function populateSelectedListings(){
// 	$('#listing_container').empty();
// 	for(var listing in listingsSelectedArray){
// 		$('#listing_container').append("<div class='listing_item_container'><img class='listing_img' src='" + listingsSelectedArray[listing].images + "'></div>");
// 	}
// 	$('.listing_item_container').click(onListingItemClicked);
// }


// function onListingItemClicked(){
// 	var listingId = $(this).attr("listingid");
// 	console.log('listing clicked ' + listingId);
// }


// function chooseUserOption(){
// 	var id = "#" + $(this).attr('id') + "_info";
// 	console.log('id ' + id);
// 	$('.user_info').hide();
// 	$('.user_option').removeClass("user_selected");
// 	$(id).show();
// 	$(this).addClass("user_selected");
// }


// function showMerchOption(){
// 	var id = $(this).attr('id').toString().substring($(this).attr('id').toString().length - 1, $(this).attr('id').toString().length);
// 	$('.merch_desc').hide();
// 	switch(id){
// 		case "1":
// 			$('#merch_desc_1').show();
// 		break;
// 		case "2":
// 			$('#merch_desc_2').show();
// 		break;
// 		case "3":
// 			$('#merch_desc_3').show();
// 		break;
// 		default:
// 		break;
// 	}
// }


// function carouselHoverIn(){
// 	//$(this).css("height",($(this).height() - 2)+ "px");
// 	//$(this).css("height",($(this).width() - 2)+ "px");
// 	$(this).css("margin","0px");
// 	$(this).css("border","1px #ccc solid");
// 	//alert('ok');
// 	//alert('hover in ' + $(this).css("margin"));
// }

// function carouselHoverOut(){
// //	$(this).css("height",($(this).height() + 2)+ "px");
// //	$(this).css("height",($(this).width() - 2)+ "px");
// 	$(this).css("margin","1px");
// 	$(this).css("border","0");
// }


// function setCarousel(){
// 	var box_width = $('.carousel_item_container').width();
// 	var container_width = $('#carousel_container').width();
// 	if(container_width <= (2*carousel_width)){
// 		$('.carousel_item_container').css("height", (container_width -4)+ "px");
// 		$('.carousel_item_container').css("width", (container_width -4) + "px");
// 	}else{
// 		$('.carousel_item_container').css("height", carousel_width + "px");
// 		$('.carousel_item_container').css("width", carousel_width + "px");
// 		//console.log('container width ' + container_width + "is great er than " + (2*box_width));
// 	}
// 	//console.log('box width ' + box_width + " container width " + container_width);
// 	//alert(" " + $('.carousel_item_container').width());
// 	//var width = $('.carousel_item_container').width();
// 	//console.log('height is ' + height);
// 	//$('.carousel_item_container').css("height", width + "px");
// }