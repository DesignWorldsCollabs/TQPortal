/**
 * User Model
 * <p>Creates a <em>Topic</em> for each new account; that's the user identity
 * that will be traded in the database, not the user's _id</p>
 * <p>User's handle must be unique and is used as the locator for that topic</p>
 */

var types = require('../../core/types')
  , icons = require('../../core/icons')
  , constants = require('../../core/constants');

var UserModel = module.exports = function(environment) {
  var topicMapEnvironment = environment.getTopicMapEnvironment();
  var Dataprovider = topicMapEnvironment.getDataProvider();
  var topicModel = topicMapEnvironment.getTopicModel();

  var self = this;
	
  /**
   * Create a new user Topic from an authenticated User object
   * @param user = User, the authentication user, not the topic user
   * @param callback signature (err,data)
   */
  self.newUserTopic = function(user, callback) {
    //NOTE: user.handle is also the topic's locator
    //must be unique
    console.log('USER.newUserTopic- '+JSON.stringify(user.getData()));
    var credentials = null; //TODO
    // In fact, we already check for valid and unique handle in routes.js
    console.log('USER.newUserTopic-1 '+user.getHandle());
    self.findUser(user.getHandle(), credentials, function(err,result) {
      console.log('USER.newUserTopic-2 '+err+' '+result);
      //if (result !== null) {
      if (result != null /*&& result.length > 0*/) {
        callback(user.getHandle()+" already exists", null);
      } else {
        //create a new user
    	var usr;
        topicModel.newInstanceNode(user.getHandle(), types.USER_TYPE,
        		user.getFullName(),"","en",constants.SYSTEM_USER,
        		icons.PERSON_ICON_SM,icons.PERSON_ICON, false, credentials, function(err,result) {
            console.log('USER.newUserTopic-3 '+err+' '+result.toJSON());
        	usr = result;
          Dataprovider.putNode(usr, function(err,data) {
            console.log('UserModel.newUserTopic+ '+usr.getLocator()+" "+err);
            callback(err,null);
          });
        });
      }
 	});
  },
	
  /**
   * Find user topic given <code>userLocator</code>
   * @param userlocator
   * @param credentials
   * @param callback signature (err,data)
   */
  self.findUser = function(userLocator, credentials, callback) {
	  console.log("UserModel.findUser "+userLocator+" "+credentials);
    Dataprovider.getNodeByLocator(userLocator, credentials, function(err,result) {
      callback(err,result);
    });
  }

};