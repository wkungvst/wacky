var BASE_URL = "http://localhost:8000/";

$(document).ready(function(){
	initialize();
  //getName();
});



function initialize(){
  $('#artist_submit').unbind('click').click(setName);
  $('#sign_out_button').unbind('click').click(signout);
  $('#sign_in_button').unbind('click').click(signin);
}
