var express = require("express")
var app = express()
var bodyParser = require('body-parser');
//var formidable = require('formidable');
var fs = require('fs');
var BASE_URL = "http://localhost:8000/";
var http = require('http');
var cors = require('cors')
app.use(cors())
app.use(bodyParser());
const MongoClient = require('mongodb').MongoClient



app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/test', function(req,res){
	res.json({result: "success!" })
});

const port = 8000;

//mongodb://<dbuser>:<dbpassword>@ds217548.mlab.com:17548/project
mongodb://<dbuser>:<dbpassword>@ds217548.mlab.com:17548/project
var dbUrl = 'mongodb://admin:password1234@ds217548.mlab.com:17548/project';

MongoClient.connect(dbUrl, (err, client) => {
    console.log('we connected');
	if (err) return console.log(err)
	db = client.db('project') 
	app.listen(port, ()=>{
		console.log('hi we are live on port ' + port);
	});

	// SUBMIT A TAB
	app.post('/submitTab', (req, res) => {
		//var form = new formidable.IncomingForm();
		form.uploadDir = "/storage";
		form.keepExtensions = false;
		console.log('submit tab 1');
   		 form.parse(req);

		// form.on('fileBegin', function (name, file){
		// 	console.log('submit tab 2');
		//     file.path = file.name;
		//     console.log('file begin: ' + file);
		//     console.log(file);
		// });

		// form.on('file', function (name, file){

		// 	console.log('submit tab 3');
		//     console.log('Uploaded ' + file.name);
		// });


		form.on('fileBegin', function (name, file){
        file.path = __dirname +'/storage/' + file.name;
	    });

	    form.on('file', function (name, file){
	        console.log('Uploaded ' + file.name);
	    });

	    res.sendFile(__dirname + '/index.html');
	    res.json({"IsSuccess" : true})	
		//res.status(200);
	});	



	// GET ITEMS
	app.get('/items', (req, res)=>{
		db.collection("items").find({}).toArray(function(error, result) {
		    if (err) throw err;
	    	res.json({"IsSuccess" : true, "itemsList" : result})	
			console.log('items list' + result + "error " + error);
		});
	});

	// GET TAGS
	app.get('/tags', (req, res)=>{
		db.collection("tags").findOne({}, function(error, result) {
		    if (err) throw err;
	    	res.json({"IsSuccess" : true, "tags" : result.tags})	
			console.log('tags list' + result + "error " + error);
		});
	});


	// GET LISTINGS
	app.get('/listings', (req, res)=>{
		db.collection("listings").find({}).toArray(function(error, result) {
		    if (err) throw err;
	    	res.json({"IsSuccess" : true, "listings" : result})	
			console.log('number of listings ' + result.length);
		});
	});


	// GET COMMENTS
	app.get('/comments/:songid', (req, res)=>{
		var songid = parseInt(req.params.songid);
		//console.log('getting comments for : ' + songid);
		db.collection("comments").findOne({"id" : songid}, function(error, result) {
		    if (err) throw err;
	    	res.json({"IsSuccess" : true, "comments" : result})	
			console.log('we good 3');
		});
	});


 	// body { int songid, string comment, string name, string date} //  
	app.post('/insertComment', (req, res)=>{
		console.log(' insert comment for ' + req.body.songid);
		var songid = parseInt(req.body.songid);
		var comment = req.body.comment;
		var name = req.body.name;
		var date = req.body.date;
		db.collection("comments").findOne({"id" : songid}, function(error, result) {
		    if(error || result == null){
		    	console.log(' there was an error: ' + error);
		    	res.json({"IsSuccess" : false, "Error" : error});
		    	return;
		    }
		    var commentObject = result;
		    var commentArray = result.comments;
		    commentArray.push({"name" : name, "comment" : comment, "date" : date});
		    commentObject.comments = commentArray;
		    db.collection("comments").update({"id" : songid}, commentObject);
		    res.json({"IsSuccess" : true, "comment" : commentObject})
		});
	});



 	// body { int songid, int rating} //  
	app.post('/submitRating', (req, res)=>{
		console.log(' update rating ' + req.body.songid);
		var songid = parseInt(req.body.songid);
		var rating = parseInt(req.body.rating);

		db.collection("songs").findOne({"id" : songid}, function(error, result) {
		    if(error || result == null){
		    	console.log(' there was an error updating the rating: ' + error);
		    	res.json({"IsSuccess" : false, "Error" : error});
		    	return;
		    }
		    var songObject = result;
		    var rating = 1;
		    var ratingCount = parseInt(songObject.ratingCount);
		    newRatingCount = ratingCount + 1;
		    songObject.ratingCount = newRatingCount;
		    db.collection("songs").update({"id" : songid}, songObject);
		   
		   // db.collection("comments").update({"id" : songid}, commentObject);
		    res.json({"IsSuccess" : true, "result" : songObject});
		});
	});


	// REGISTRATION
	app.post('/user/registerUser', (req, res)=>{
		db.collection("users").find({}).toArray(function(error, users) {
		    if (err) throw err;
		    if(check_user_valid(users, req.body.Username)){
				save_user(users.length+1, req);
		    	res.json({"IsSuccess" : true, "UserId" : 1})	
				console.log('we good 1');
		    }else{
		    	res.json({"IsSuccess" : false, "ErrorMessage" : "User already reigstered", "ErrorCode" : 1})		
		    	console.log('already taken. no gucci');
		    }
		});
	});


	// LOGIN
	app.post('/user/authenticateUser', (req, res)=>{
		var query = {Username: req.body.Username.toLowerCase()};
		db.collection("users").find(query).toArray(function(err, result){
		if (err) throw err;
		if(result.length == 1){
			console.log('found the user at least... ' + ' password provided: ' + req.body.PasswordHash + ' and actual password is : ' + result[0].PasswordHash);
			if(result[0].PasswordHash == req.body.PasswordHash){
				res.json({IsSuccess: true, Message: "Successful Login", user : result[0]});
			}else{
				res.json({IsSuccess: false, ErrorMessage: "Incorrect Username or Password", ErrorCode: "2"});
			}
		}else{
			console.log('couldnt even find the user... ' );
			res.json({IsSuccess: false, ErrorMessage: "Incorrect Username or Password", ErrorCode: "1"});
		}
		    console.log(result);
		    return;
		});
	});


	var check_user_valid = function(users, newUserName){
		console.log("check users. users size: " + users.length + " new username: " + newUserName) ;
		for(var i =0;i<users.length;i++){
			if(users[i].Username == newUserName){
				console.log('duplicate: ' + newUserName + ' is the same as ' + users[i].Username);
				return false;
			}
			console.log('user: ' + users[i].Username + "\n");
		}
		return true;
	};




	var save_user = function(id, request){
		var newid;
		db.collection("counters").findOne({}, function(err, result){
 			newid = result.usersCounter + 1;
 			console.log('1 new id is : ' + newid);
 			var obj = {
				Username : request.body.Username.toLowerCase(),
				PasswordHash : request.body.PasswordHash,
				userid : newid
			};

			db.collection('users').insertOne(obj, (err, result)=>{
				if(err){
					console.log('error: save_user')
					return console.log(err)
				}

				db.collection("counters").updateOne({"id" : 1}, {$set:{'usersCounter':newid}});
		 			console.log('2 new id is : ' + newid);
       			 });
				console.log('success: save_user')
			});
	};
})


