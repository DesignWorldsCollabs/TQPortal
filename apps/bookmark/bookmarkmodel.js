/**
 * Bookmark model
 */
var types = require('../../core/types')
  , icons = require('../../core/icons')
  , properties = require('../../core/properties')
  , constants = require('../../core/constants')
  , uuid = require('../../core/util/uuidutil')
  , tagmodel = require('../tag/tagmodel');

var BookmarkModel =  module.exports = function(environment) {
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
	var TopicModel = topicMapEnvironment.getTopicModel();
	var TagModel = new tagmodel(environment);
	var self = this;
  
	self.getBookmarkByURL = function(url, credentials, callback) {
		Dataprovider.getNodeByURL(url,credentials, function(err,data) {
			console.log('BookmarkModel.getNodeByURL '+url+" "+err+" "+data);
		});
	}
};