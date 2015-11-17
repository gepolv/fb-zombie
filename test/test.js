"use strict";
var FBTestUser = require("../fb-zombie");
var config = require("./config.js"); //where you set appid and access_token
var expect = require("chai").expect;

describe("Testing for Facebook test user managing", function(){
	describe("Constructor testing", function(){
		it("constructor with appid and access_token", function(){
			var fbuser = new FBTestUser(config.appid, config.access_token);
			expect(fbuser.appid).to.equal(config.appid);
			expect(fbuser.access_token).to.equal(config.access_token);
			expect(fbuser.randomnames.length).to.equal(2000);
		});
		
		it("constructor without appid", function(){
			var errorMessage ="";
			try{
				var fbuser = new FBTestUser( config.access_token);
			}catch(err){
				errorMessage = err.message;
			}
			expect(errorMessage).to.equal("You need specify both appid and access_token!");
		});
		
		it("constructor without access_token", function(){
			var errorMessage ="";
			try{
				var fbuser = new FBTestUser( config.appid);
			}catch(err){
				errorMessage = err.message;
			}
			expect(errorMessage).to.equal("You need specify both appid and access_token!");
		});
	});
	
	describe("List test users testing", function(){
		let fbuser;
		before(function() {
			fbuser = new FBTestUser(config.appid, config.access_token);
		});
		it("Calling ls correctly", function(done){
			fbuser.ls(function(err, results){
				if(err) return done(err);
				expect(results.length).to.be.above(0);
				done();
			});
			
		});
		
		it("Calling ls without callback sepcified", function(){
			var errorMessage ="";
			try{
				fbuser.ls();
			}catch(err){
				var errorMessage =err.message;
			}
			expect(errorMessage).to.equal("You need specify a callback funtion for function 'ls'!");
		});
	});
	
	describe("Creating test users testing", function(){
		let fbuser;
		before(function() {
			fbuser = new FBTestUser(config.appid, config.access_token);
		});
		it("testing createOne", function(done){
			fbuser.createOne("Test User FB",  "all", true, function(err, result){
				if(err) return done(err);
				expect(result.hasOwnProperty("id")).to.equal(true);
				done();
			});
		});
		
		it("testing create", function(done){
			fbuser.create(5, 3, function(err, result){
				if(err) return done(err);
				expect(result.length).to.equal(5);
				done();
			});
		});
	});
	
	describe("Deleting test users testing", function(){
		let fbuser;
		before(function() {
			fbuser = new FBTestUser(config.appid, config.access_token);
		});
		it("testing delete", function(done){
			//the above has created at least 5 test users.
			fbuser.delete(2, function(err, results){
				if(err) return done(err);
				expect(results.length).to.equal(2);
				done();
			});
		});
	});
	
	describe("Testing makeFriends", function(){
	    let fbuser;
	    fbuser = new FBTestUser(config.appid, config.access_token);

	    it("testing makeFriends", function(done){
	        fbuser.create(5, 3, function(err, users){
			    if(err) return done(err);
			    fbuser.makeFriends(users, 3, function(e, celebrity, friends){
				    if(e) return done(e);
				    var num = (users.length - 1) / 3;

				    if(users.length % 3 == 2)
					    expect(friends.length).to.equal(num*3+users.length);
				    else
					    expect(friends.length).to.equal(num*3+users.length-1);
                    expect(celebrity.hasOwnProperty("id")).to.equal(true);
				    done();
			    });
			    done();
		    });
		
		
	    });
	});    
	
});
