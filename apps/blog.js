/**
 * Blog app
 */
var acls = require('./blog/blogmodel')
  , constants = require('../core/constants')
  , types = require('../node_modules/tqtopicmap/lib/types');

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment;
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
	var BlogModel = new acls(environment);
	console.log("Starting Blog "+this.BlogModel);
  
	var self = this;
	self.canEdit = function(node, credentials) {
		console.log("BLOG.canEdit "+JSON.stringify(credentials));
		var result = false;
		if (credentials) {
			// node is deemed editable if the user created the node
			// or if user is an admin
			var cid = node.getCreatorId();
			var where = credentials.indexOf(cid);
			if (where < 0) {
				var where2 = credentials.indexOf(constants.ADMIN_CREDENTIALS);
				if (where > -1) {result = true;}
			} else {
				result = true;
			}
		}
		return result;
	};
	
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
	myEnvironment.addApplicationToMenu("/blog","Blog");
  /////////////////
  // Routes
  /////////////////
  app.get('/blog', isPrivate,function(req,res) {
    res.render('blogindex',myEnvironment.getCoreUIData(req));
  });
		
		
  app.get('/blog/new', isLoggedIn, function(req,res) {
	var data =  myEnvironment.getCoreUIData(req);
	data.formtitle = "New Article";
    data.isNotEdit = true;
	res.render('blogform',data); //,
  });
  
  app.get('/blog/edit/:id', isLoggedIn, function(req,res) {
	var q = req.params.id;
	var usx = req.user;
	var credentials = null;
	if (usx) {credentials = usx.credentials;}
	var data =  myEnvironment.getCoreUIData(req);
	data.formtitle = "Edit Article";
	Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
		topicMapEnvironment.logDebug("BLOG.edit "+q+" "+result);
		if (result) {
			//A blog post is an AIR
			data.title = result.getSubject(constants.ENGLISH).theText;
			data.body = result.getBody(constants.ENGLISH).theText;
			data.locator = result.getLocator();
			data.isNotEdit = false;
		}
		res.render('blogform', data); //,
	});
  });

  app.get('/blog/:id', isPrivate,function(req,res) {
    var q = req.params.id;
    console.log('BLOGrout '+q);
    var credentials = null;
    var usr = req.user;
    if (usr) { credentials = usr.credentials;}
    Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
      console.log('BLOGrout-1 '+err+" "+result);
      var data = myEnvironment.getCoreUIData(req);
      if (result) {
    	  //This is an AIR
    	  var title = result.getSubject(constants.ENGLISH).theText;
    	  var details = result.getBody(constants.ENGLISH).theText;
    	  var userid = result.getCreatorId();
    	  // paint tags
    	  var tags = result.listRelationsByRelationType(types.TAG_DOCUMENT_RELATION_TYPE);
    	  console.log("Blogs.XXX "+JSON.stringify(tags));
    	  var canEdit = self.canEdit(result,credentials);
    	  data.canEdit = canEdit;
    	  data.isNotEdit = true;
    	  data.editLocator = "/blog/edit/"+result.getLocator();
    	  var date = result.getLastEditDate();
    	  data.title = title;
    	  data.body = details;
    	  data.tags = tags;
    	  data.source = result.toJSON();
    	  data.date = date;
    	  console.log("BLOGrout-X "+data.canEdit+" "+data.editLocator);
    	  data.user = userid;
    	  data.image = "/images/publication.png";
    	  console.log('BLOGrout-2 '+JSON.stringify(data));
      }
      res.render('topic', data);
    });
  });

  /**
   * Function which ties the app-embedded route back to here
   */
  var _blogsupport = function(body,usx, callback) {
    var credentials = usx.credentials;
    if (body.locator === "") {
    	BlogModel.create(body, usx, credentials, function(err,result) {
    		callback(err,result);
    	});
    } else {
        BlogModel.update(body, usx, credentials, function(err,result) {
            callback(err,result);
        });
   }
  };
    
  app.post('/blog', isLoggedIn, function(req,res) {
    var body = req.body;
    var usx = req.user;
    console.log('BLOG_NEW_POST '+JSON.stringify(usx)+' | '+JSON.stringify(body));
    _blogsupport(body, usx, function(err,result) {
      console.log('BLOG_NEW_POST-1 '+err+' '+result);
      //technically, this should return to "/" since Lucene is not ready to display
      // the new post; you have to refresh the page in any case
      return res.redirect('/blog');
    });
  });
};