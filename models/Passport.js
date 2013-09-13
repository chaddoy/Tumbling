function Passport() {
	passport = require('passport');
	this.pasport = require('passport');
}

Passport.prototype.checkAuth = function(callback) {
	this.passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) {
    	return res.render('login', {
		  	title: 'Tumbling',
		  	message: ''
	  	});
  	}
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/users/' + user.username);
    });
  })(req, res, next);
};

module.exports = Passport;