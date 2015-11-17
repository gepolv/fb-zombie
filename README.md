fb-zombie
===
This node module is focusing on creating test environment for Facebook APP development/testing. One feature of this module is to create a massive number of test users which then are made friends in terms of the specified requirement.

Installation
---

    $ npm install fb-zombie

Documentation
---
* [FBTestUser](#FBTestUser)
* [create](#create)
  * [createOne](#createOne)
  * [create100](#create100)
  * [create200](#create100)
  * [create500](#create100)
  * [create1000](#create100)
  * [create2000](#create100)
* [ls](#list)
* [delete](#delete)
  * [deleteOne](#deleteOne)
* [connect](#connect)
* [makeFriends](#makeFriends)

Usages
---
<a name="FBZombie" />
### FBZombie(options) ###
Initializes a new FBZombie object which is in charge of managing test users.

**Arguments**

* **YOUR_APP_ID** - Your Facebook App ID.
* **YOUR_APP_ACCESS_TOKEN** - Your Facebook App's Access Token. You APP's access token can be obtained through  [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer).

**Example**

```js
FBZombie = require('fb-zombie');
fbUsers = new FBZombie('YOUR_APP_ID','YOUR_APP_ACCESS_TOKEN');
```
<a name="create" />
### create(total, num_of_installed, callback) ###
Creates "total" number of test users, "num_of_installed" of which have APP installed. The names of each test user are retrieved from a predetermined name list in "randomname.txt". The APP has all permissions to access each test user.

**Arguments**

* **total** - The number of test users to be created. Note: Facebook requies each APP cannot create more than 2000 test users.
* **num_of_installed** - The number of test users who have APP installed. 
* **callback(error, results)** - The callback is called once the users creation are completed, or an error occurred.
  * *error* - Error object
  * *results* - Array of user objects, including "id", "access_token" and "login_url".

**Example**

```js
fbUsers.create(100, 50, function(error, results){
  results.map(x => console.log(x));
});
```
<a name="createOne" />
### createOne(name, permission, installed, callback) ###
Creates a single test user.

**Arguments**

* **name** - The name of test user to be created.
* **permissions** - Permissions for accessing this user. You can speciy "all" which means all permissions. See [Here](https://developers.facebook.com/docs/facebook-login/permissions/v2.5) for more details.
* **callback(error, result)** - The callback is called once the user creation is completed, or an error occurred.
  * *error* - Error object
  * *result* - An user object, including "id", "access_token" and "login_url".

**Example**

```js
fbUsers.createOne("Alum Rock", "all", true, function(error, result){
  console.log(result);
});
```
<a name="create100" />
### create100(callback) ###
Creates 100 test users with "all" permissions and 50 test users have the APP installed. Similarly, we have:
* create200(callback): Creates 200 test users with "all" permissions and 100 users have the APP installed.
* create500(callback): Creates 500 test users with "all" permissions and 250 users have the APP installed.
* create1000(callback): Creates 1000 test users with "all" permissions and 500 users have the APP installed.
* create2000(callback): Creates 2000 test users with "all" permissions and 1000 users have the APP installed.

Attention: Facebook has a limit for graph api access. Make sure you won't reach that limit. From the Facebook documentation as of Nov. 16th, 2015, here's how rate limiting on the Graph API works:

Rate limiting is done on your Facebook AppId. If your app reaches a rate limit, all calls made for that app will be limited not just on a per-user basis.
Rate limiting is calculated by taking the number of users your app had the previous day and adding today's new logins. This gives a base number of users that your app has.
As an example, if your app had 10 users yesterday and 5 new logins today, that would give you a base of 15 users. This means that your app can make ((10 + 5) * 200) = 3000 API calls in any 60 minute window. See [here](https://developers.facebook.com/docs/graph-api/advanced/rate-limiting) for more details.

**Arguments**

* **name** - The name of test user to be created.
* **permissions** - Permissions for accessing this user. You can speciy "all" which means all permissions. See [Here](https://developers.facebook.com/docs/facebook-login/permissions/v2.5) for more details.
* **callback(error, results)** - The callback is called once the users creation are completed, or an error occurred.
  * *error* - Error object
  * *results* - Array of user objects, including "id", "access_token" and "login_url".

**Example**

```js
fbUsers.create100(function(error, result){
  if(error) return console.log(error.message);
  console.log(result);
});
```

<a name="list" />
### ls(callback) ###

Retrieves all test users of this APP.

**Arguments**

* **callback(error, users)** - The callback is called once all users are retrieved, or an error occurred.
  * *error* - Error object.
  * *user* - Array of user objects.

**Example**

```js
fbUsers.ls(function(error, users){
  console.log(users);
});
```

<a name="delete" />
### delete(num, callback) ###

Delete "num" of test users.

**Arguments**

* **num** - The number of test users to delete.
* **callback(error, results)** - The callback is called once all required users has been deleted, or an error occurred.
  * *error* - Error object.
  * *results* - Array of IDs of deleted test users.

**Example**

```js
fbUsers.delete(50, function(error, results){
  console.log(results);
});
```
<a name="deleteOne" />
### deleteOne(id, callback) ###

Delete a test user.

**Arguments**

* **id** - The id of the test user to delete.
* **callback(error, result)** - The callback is called once all required users has been deleted, or an error occurred.
  * *error* - Error object.
  * *result* - The deleted test user object.

**Example**

```js
fbUsers.deleteOne("123456789", function(error, result){
  console.log(result.name);
});
```

<a name="connect" />
### connect(userPair, callback) ###

Connect two test users specified in "userPair". Each user must include valid "id" and user "access_token". Usually, this function is used together with "create*" functions. There is a better way to create friendship between test users using [makefriends](#makeFriends).

**Arguments**

* **userPair** - Array of two test user objects: [user1, user2].
* **callback(error, results)** - The callback is called once the two users have been connected, or an error occurred.
  * *error* - Error object
  * *results* - "userPair" is returned.

**Example**

```js
var user1 = {"id":"xxxxx", "access_token":"xxxxxxxxxxx"};
var user2 = {"id":"xxxxx", "access_token":"xxxxxxxxxxx"};
fbUsers.connect([user1, user2], function(error, results){
  console.log(results);
});
```

<a name="makeFriends" />
### makeFriends(users, circle_num, callback) ###

Given an array of test users, create friendship between every "circle_num" users. 

**Arguments**

* **users** - Array of test user objects.
* **circle_num** - Number of a group of test uesrs that will friend with each other. 
* **callback(error, celebrity, results)** - The callback is called once the friendship creating has been completed, or an error occurred.
  * *error* - Error object
  * *celebrity* - A test user that is a friend of all other test users.
  * *results* - Array of user pair that contain friends.

**Example**

```js
fbUsers.create(100,80, function(error, results){
	if(error) return console.log(error.message);
	fbUsers.makeFriends(results, 10, function(err, celebrity, friends){
	    friends.map(x => console.log(x[0].id +" and "+ x[1].id + " are friends now!"));
	    console.log("total "+ friends.length+ " pairs of friends!");
	    console.log("celebrity user is: ");
	    console.log(celebrity);
	});
});
```
Testing
---

To run the test suite first invoke the following command <b>within the repo</b>, installing the development dependencies:

    $ npm install

then modify the file `test/config.js`:
```json
{
  "appID": "YOUR_APP_ID",
  "secret": "YOUR_APP_ACCESS_TOKEN"
}
```

Finally, run the tests:

    $ npm test


## License ##

(The MIT License)

Copyright (c) 2015 Jinpeng LV &lt;gepolv@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
