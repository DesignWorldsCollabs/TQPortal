/**
 * DesignWorlds 6th grade science collab
 */
exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	/////////////////
	// Menu
	/////////////////
	environment.addApplicationToMenu("/scicsix","ScienceCollab-6");

	app.get("/scicsix", function(req,res) {
		var data = environment.getCoreUIData(req);
		//set the brand
		 data.brand = "SciCollab";
		res.render("scicollabsix",data);
	});

};