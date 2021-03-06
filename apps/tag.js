/**
 * tag app
 */
var tagModel = require('./tag/tagmodel')
  , constants = require('../core/constants')
  , common = require('./common/commonmodel')
 , types = require('../node_modules/tqtopicmap/lib/types');


exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment;
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
	var CommonModel = environment.getCommonModel();
	var TagModel = new tagModel(environment);
	var MAPTYPE = "1";


	function isPrivate(req,res,next) {
		if (isPrivatePortal) {
			if (req.isAuthenticated()) {return next();}
			res.redirect('/login');
		} else {
			{return next();}
		}
	}
	function isLoggedIn(req, res, next) {
		// if user is authenticated in the session, carry on 
		console.log('ISLOGGED IN '+req.isAuthenticated());
		if (req.isAuthenticated()) {return next();}
		// if they aren't redirect them to the home page
		// really should issue an error message
		if (isPrivatePortal) {
			return res.redirect('/login');
		}
		res.redirect('/');
	}
	/////////////////
	// Menu
	/////////////////
	environment.addApplicationToMenu("/tag","Tag");

	/////////////////
	// Routes
	/////////////////
	app.get('/tag', isPrivate,function(req,res) {
		  var data = environment.getCoreUIData(req);
		  data.start=0;
		  data.count=constants.MAX_HIT_COUNT; //pagination size
		  data.total=0;
		  data.query="/tag/index";
		  //rendering this will cause an ajax query to blog/index
		  res.render('tagindex',data);
	  });
		
	  app.get("/tag/index", isPrivate,function(req,res) {
		  var start = parseInt(req.query.start);
		  var count = parseInt(req.query.count);
//		  var isNext = req.query.isNext.trim();
//		  topicMapEnvironment.logDebug("BLOG INDEX "+start+" "+count+" "+isNext);
		  var credentials= [];
		  if (req.user) {credentials = req.user.credentials;}

		  TagModel.fillDatatable(start,count, credentials, function(data, countsent,totalavailable) {
			  console.log("Tag.index "+data);
			  var cursor;
			  //if (isNext === "T") {
				  cursor = start+countsent;
			  //} else {
			//	  cursor = start-countsent;
			 // }
			//  if (cursor < 0) {cursor = 0;}
			//  topicMapEnvironment.logDebug("BLOG INDEX2 "+start+" "+countsent+" "+isNext+" "+cursor);
			  var json = {};
			  json.start = cursor;
			  json.count = constants.MAX_HIT_COUNT; //pagination size
			  json.total = totalavailable;
			  json.table = data;
			  try {
				  res.set('Content-type', 'text/json');
			  }  catch (e) { }
		      res.json(json);
		  });
	  });	
	app.get("/tag/ajaxfetch/:id", isPrivate, function(req,res) {
		    var q = req.params.id;
			var lang = req.query.language;
		    console.log('TAGajax '+q+" "+lang);
		    var credentials = [];
		    var usr = req.user;
		    if (usr) { credentials = usr.credentials;}
		    Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
		      console.log('TAGrout-1 '+err+" "+result);
		      var data = myEnvironment.getCoreUIData(req);
				    var contextLocator;
				    if (req.query.contextLocator) {
				    	contextLocator = req.query.contextLocator;
				    } else {
				    	//if it's a map node, use that
				    	if (result.getNodeType() == types.CONVERSATION_MAP_TYPE) {
				    		contextLocator = result.getLocator();
				    	} else {
				    		contextLocator = q;
				    	}
				    	//TODO
				    	//Otherwise, grab some context from the node
				    }
			    	  var canEdit = false;
			    	  var clipboard = req.session.clipboard;
			    	  
			    	  var editLocator = "/tag/edit/"+result.getLocator();
			    	  

				      var docs = result.listPivotsByRelationType(types.TAG_DOCUMENT_RELATION_TYPE);
				      if (!docs) {
				    	  docs = [];
				      }
				      var users = result.listPivotsByRelationType(types.TAG_CREATOR_RELATION_TYPE);
				      if (!users) {
				    	  users = [];
				      }
		      CommonModel.generateViewFirstData(result, [], docs,users,credentials, canEdit, data, contextLocator, "/tag/", clipboard, lang, function(json) {
				  //get all parents
				  CommonModel.fillConversationTable(true, true,q,"",credentials,function(err,cresult) {
					  if (cresult) {
						  json.ccontable = cresult;
					  }
					  //get just my parents in particular context
					  CommonModel.fillConversationTable(true, false,q,contextLocator,credentials,function(err,presult) {
						  if (presult) {
							  json.pcontable = presult;
						  }
					      json.newnodetype = MAPTYPE;
					      console.log("XXXX "+JSON.stringify(json));
					      	
					        try {
					            res.set('Content-type', 'text/json');
					          }  catch (e) { }
					          res.json(json);
					  });

				  });
		    	  
		      });
		    });
		      
	  });		
	app.get('/tag/:id', isPrivate,function(req,res) {
	    var q = req.params.id;
	    console.log('TAGrout '+q);
	    var data = myEnvironment.getCoreUIData(req);
	    data.query = "/tag/ajaxfetch/"+q;
	    data.language = "en";
	    data.type = "foo";
	    if (req.query.contextLocator) {
	    	data.contextLocator = req.query.contextLocator;
	    }
	    res.render('vf_topic', data);
  });

};