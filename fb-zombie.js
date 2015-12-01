"use strict";

var async = require("async");
var https = require("https");
var fs = require("fs");

/*meta function used by other test user functions*/
function operate(method, accessToken, apiPath, callback) {
    var options = {
		host: 'graph.facebook.com',
		path: apiPath + 'access_token=' + accessToken,
		method: method
	};

	var buffer = ''; 
		
	var request = https.request(options, function(result){
		result.setEncoding('utf8');
		result.on('data', function(chunk){
			buffer += chunk;
		});

		result.on('end', function(){
			return callback(null, buffer);
		});
	});

	request.on('error', function(e){
		return callback(e);
	});
	request.end(); //done with the request
}	

class FBZombie{
	
	constructor(appid, access_token){
		if(!appid || !access_token)
                    throw new Error("You need specify both appid and access_token!");
		this.appid = appid;
		this.access_token = access_token;
		this.randomnames= [];
		this.full_permission =  "public_profile,user_friends,email,user_about_me,user_actions.books,user_actions.fitness,user_actions.music,user_actions.news,user_actions.video,user_birthday,user_education_history,user_events,user_games_activity,user_hometown,user_likes,user_location,user_managed_groups,user_photos,user_posts,user_relationships,user_relationship_details,user_religion_politics,user_tagged_places,user_videos,user_website,user_work_history,read_custom_friendlists,read_insights,read_audience_network_insights,read_page_mailboxes,manage_pages,publish_pages,publish_actions,rsvp_event,pages_show_list,pages_manage_cta,pages_manage_leads,ads_read,ads_management";
		
		var parent = this;
        	fs.readFileSync('./randomnames.txt').toString().split('\n').forEach(function (line) {
		        if( line.trim() )
		        {
		            var names = line.split(/[ +|\t]/);
		            parent.randomnames.push(names[0]+"+"+names[1]);
		        } 
        	});
	}

	/*list all test users on this account*/
	ls(callback){
	    if(!callback) throw new Error("You need specify a callback funtion for function 'ls'!");
		var parent = this;
		operate("GET", parent.access_token, "/"+parent.appid+"/accounts/test-users?limit=2000&", function(err, res){
			if (err) return callback(err);
			var results = JSON.parse(res).data;
			return callback(null, results);
		});
	}
	
	/*create a test user*/
	createOne(name,  permission, installed, callback){
	    if(!name || !permission || !installed || !callback) 
	        throw new Error("You need spceify 4 parameters for function 'createOne'.");

		name = name.split(/ +|\t/).join("+");

		var parent = this;
		if(permission == "all") permission = parent.full_permission;
		
		var apiPath = "/"+parent.appid+"/accounts/test-users?permissions="+permission+"&installed="+((installed)?"true":"false")+"&name="+name+"&";

		operate("POST", parent.access_token, apiPath, function(err, res){
			if(err) callback(err);
			var u = JSON.parse(res);
			if(u.hasOwnProperty("id")){
				callback(null, u);
			}
			else
			    callback(new Error("Failed to create test user: "+name));
		});
	}
	/*delete a test user*/
	deleteOne(id, callback){
	    if(!id) callback(new Error("You forget to specify ID of the test user to be deleted."));
		var parent = this;
		operate("GET", parent.access_token, "/"+id+"?", function(err, res){
			if (err) return callback(err);
			var user = JSON.parse(res);
			operate("DELETE", parent.access_token, "/"+id+"?", function(err, cb){
				if(err) return callback(err);
				if(user.name){
					callback(null, user);
				}	
				else
					callback(new Error("Test user with ID "+id+" does not exist!"));
			});
		});
	}
	/*create "total" test users with meaningful names*/
	/*num_of_installed: how many test users install the APP*/
	/*all users are created with full permissions*/
	create(total, num_of_installed, callback){
	    if(!total || !num_of_installed || !callback) 
	        throw new Error("You need spceify 4 parameters for function 'create'.");
	    if(num_of_installed > total){
	        num_of_installed = total;
	        console.log("Warning: you can create at most "+total+" test users.");
	    }
	    var parent = this;
	    var names = parent.randomnames.slice(0, total);

	    var permission = parent.full_permission;
	    var users = [];
		var apiPath = "";
        async.forEachOf(names, function(name, index, cb){
            if(index < num_of_installed)
                apiPath = "/"+parent.appid+"/accounts/test-users?permissions="+permission+"&installed=true&name="+name+"&";
            else
                apiPath = "/"+parent.appid+"/accounts/test-users?permissions="+permission+"&name="+name+"&";

            operate("POST", parent.access_token, apiPath, function(err, res){
                if(err) return cb(err);
                else{
                    var u = JSON.parse(res);
                    if(u.hasOwnProperty("id")){
	        			users.push(u);
		    			return cb(null);
					} 
                    else
		    			return cb(new Error("Failed to create test user: "+name));
                }
            });
        }, function(err){
            if(err) return callback(err);
            else return callback(null, users);
        }); 
	}
	/*make friends between two test users each of which must have id and access_token information*/
	// a test user cannot friend with a real world user.
	connect(userpair, cb){
		var user1 = userpair[0];
		var user2 = userpair[1];
		var connection = "/" + user1.id + "/friends/" + user2.id + "?";
		operate("POST", user1.access_token, connection, function(err1, res1){
			if(err1) return cb(err1);
			var r = JSON.parse(res1);
			if(r.hasOwnProperty("error")) return cb(new Error(r.error.message));
			connection = "/" + user2.id + "/friends/" + user1.id + "?";

			operate("POST", user2.access_token, connection, function(err2, res2){
				if(err2) return cb(err2);
				r = JSON.parse(res2);
			    if(r.hasOwnProperty("error")) return cb(new Error(r.error.message));
				return cb(null, userpair);
			});
		});
	}
	/*make friends for newly created test users, each user information contailns at least id and access_token*/
	// users: input list of friends
	makeFriends(users, circle_num, cb)
	{	
	    var parent = this;
	    var center_user = users[0];
	    users = users.slice(1);
		function friendpairs(){
			var i,j,k;
			var pairs = [];
			var circles = Math.ceil(users.length / circle_num);
			for (i = 0; i < circles; i++){
				for(j = circle_num*i; j<Math.min(users.length-1,circle_num*i+circle_num-1); j++){
					for(k = j+1; k < Math.min(circle_num*i+circle_num,users.length); k++){
						pairs.push([users[j], users[k]]);
					}
				}
			}

			for(i=0;i < users.length; i++){
			    pairs.push([center_user, users[i]]);
			}
			return pairs;
		}
		
		var pairs = friendpairs();
		async.map(pairs, parent.connect, function(err,results)
        {
			if(err) throw err;
            cb(null, center_user, results);//results:[ [friend1, friend2], ... ], of which, friend1 is a user containing all info. 
        });
	}
	/*create 100 test users*/
	create100( callback)
	{
	    create(100, 50, callback);
	}
	/*create 200 test users*/
	create200( callback)
	{
	    create(200, 100, callback);
	}
	/*create 500 test users*/
	create500(callback)
	{
	    create(500, 250, callback);
	}
	/*create 1000 test users*/
	create1000( callback)
	{
	    create(1000, 500, callback);
	}
	/*create 2000 test users*/
	create2000(callback)
	{
	    create(2000, 1000, callback);
	}
	
	delete(num, callback){
	    if (!num) throw new Error("You forgot to specify the number of test users to delete.");
	    var parent = this;
	    /*delete a test user with callback*/
	    function fbdeluser(user,cb)
        {
        	operate("DELETE", parent.access_token, "/"+user.id+"?", function(err, res){
			    if(err) return cb(err);
			    return cb(null, user.id);
		    });
        }
		
		parent.ls(function(err, users){
			if(err) return callback(err);
			var del_users = [];
			if (users.length <= num){
				async.map(users, fbdeluser, function(err, results){
					if(err) return callback(err); 
					return callback(null, results);
				});
			}
			else{
				async.map(users.slice(0,num), fbdeluser, function(err, results){
					if(err) return callback(err); 
					return callback(null, results);
				});
			}
		});
	}
}
module.exports = FBZombie;

