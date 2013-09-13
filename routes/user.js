var mongoose = require('mongoose')
  , fs = require('fs')
  , format = require('util').format
	, flash = require('connect-flash')
	,	passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
	,	userModel = require('../models/User')
	,	postModel = require('../models/Post');

mongoose.connect('mongodb://localhost/chaddoy');
var User = new userModel(mongoose);
var Post = new postModel(mongoose);

exports.list = function(req, res){
	User.findAll(function(err, users) {
		if(err) return console.log(err);
		Post.findAll(function(err, posts) {
			if(err) return console.log(err);
			collections = {
				user: users,
				post: posts
			};
			res.send(collections);
		});
	});
};

exports.usernameParam = function(req, res, next, username) {
	User.findByUsername(req.params.username, function(err, docs) {
		if(err) return console.log(err);
		req.username = docs;
		next();
	});
};

exports.signUp = function(req, res) {
	var reqBody = req.body;
	var page = 'signUp';
	var message = '';

	if(reqBody.username) {
		User.register(reqBody, function(err, result) {
			if(err) return console.log(err);
			
			if(result === 'Email already used!') {
				message = result;
			} else if(result === 'Username already used!') {
				message = result;
			} else {
				page = 'login'
				message = result +' Login to continue!';
			}
			res.render(page, { title: 'Tumbling', message: message });
		});
	} else {
		res.redirect('/');
	}
};

exports.login = function(req, res) {
    res.redirect('/');
};

exports.profile = function(req, res) {
	User.findById(req.user._id, function(err, user) {
		Post.findByUserId(req.user._id, function(err, posts) {
			res.render('profile', {
				user: user,
				post: posts,
				params: req.params,
				notice: req.flash('notice')
			});
		})
	});
}
exports.uploadPost = function(req, res) {
	var file = req.files.image;

	if(file.size === 0) {
		fs.unlinkSync(file.path);
		req.flash('notice', { type: 'error', message: 'Something went wrong.' });
		res.redirect('back');
	} else {
		Post.findByUserId(req.user._id, function(err, docs) {
			if(err) console.log(err);

      var postId = 0;
      if(docs.length === 0) {
        postId = 1;
      } else if(docs[0].image.length === 0) {
        postId = 1;
      } else {
        postId = docs[0].image[docs[0].image.length -1]._id + 1;
      }
      console.log(postId);
			var postCount = postId
				,	extension = file.name.split('.')
				,	filePath = file.path.split('\\')
				,	oldFileName = filePath[filePath.length -1]
				,	newFileName = req.user.username +'_POST_'+ postCount +'.'+ extension[extension.length -1]
				,	oldPath = file.path
				,	newPath = oldPath.replace(oldFileName, newFileName);

			fs.rename(oldPath, newPath, function(err) {
				if (err) console.log(err);
				var values = {
					userId: req.user._id,
					image: [{
						title: req.body.title,
						path: '/images/uploads/'+ newFileName
					}]
				};
				Post.upload(values, function(err, docs) {
					if(err) console.log(err);
					req.flash('notice', { type: 'success', message: 'Uploaded' });
					res.redirect('back');
				});
			});
		});
	}
}
exports.deletePost = function(req, res) {
	var dirnameLength = __dirname.split('\\').length;
	var publicDir = __dirname.split('\\').splice(0, (dirnameLength - 1)).join('\\') +'/public';

	fs.unlink(publicDir +'/images/uploads/'+ req.user.username +'_POST_'+ req.body.postId +'.'+ req.body.ext, function (err) {
		if (err) throw err;
		Post.remove({ userId: req.user._id, imageId: req.body.postId }, function(err, docs) {
			if(err) console.log(err);
			console.log(docs);
			req.flash('notice', { type: 'success', message: 'Deleted successfully!' });
			res.redirect('back');
		});
	});
}
function passwordMatched(oldPass, newPass) {
	if(oldPass != newPass) return false;
	return true;
}
function usernameExists(username) {
	User.findByUsername(username, function(err, docs) {
		if(err) console.log(err);
		if(docs.length > 0) return true;
	});
	return false;
}
function emailExists(email) {
	User.findByEmail(email, function(err, docs) {
		if(err) console.log(err);
		if(docs.length > 0) return true;
	});
	return false;
}
exports.updateAccount = function(req, res) {
	var values = { username: req.body.username, email: req.body.email };
	User.updateInfo(req.user._id, values, function(err, docs) {
		if(err) console.log(err);
		if((req.user.username != req.body.username) || (req.user.email != req.body.email)) {
			if(usernameExists(req.body.username) == true) {
				req.flash('notice', { type: 'error', message: 'Username already existed.' });
			} else if(emailExists(req.body.email) == true) {
				req.flash('notice', { type: 'error', message: 'Email already existed.' });
			} else {
				req.flash('notice', { type: 'success', message: 'Successfully saved.' });
			}
		}
		res.redirect('back');
	});
}
exports.updatePassword = function(req, res) {
	if(passwordMatched(req.user.password, req.body.oldPass) === false) {
		req.flash('notice', { type: 'error', message: 'Old Password didn\'t matched.' });
		res.redirect('back');
	} else {
		User.changePassword(req.user._id, req.body.pass1, function(err, docs) {
			if(err) console.log(err);
			req.flash('notice', { type: 'success', message: 'Successfully saved.' });
			res.redirect('back');
		});
	}
}
exports.updateAvatar = function(req, res) {
	var file = req.files.profilePic;

	if(file.size === 0) {
		fs.unlinkSync(file.path);
		req.flash('notice', { type: 'error', message: 'Something went wrong.' });
		res.redirect('back');
	} else {
		var extension = file.name.split('.')
			,	filePath = file.path.split('\\')
			,	oldFileName = filePath[filePath.length -1]
			,	newFileName = req.user.username +'_PROFILE.'+ extension[extension.length -1]
			,	oldPath = file.path
			,	newPath = oldPath.replace(oldFileName, newFileName);

		fs.rename(oldPath, newPath, function(err) {
			if (err) console.log(err);
			User.updateInfo(req.user._id, { profilePic: '/images/uploads/'+ newFileName }, function(err, docs) {
				if(err) console.log(err);
				req.flash('notice', { type: 'success', message: 'Successfully saved.' });
				res.redirect('back');
			});
		});
	}
}

exports.posts = function(req, res){
  User.removeAll(function(err, docs) {
    if(err) return console.log(err);
    if(docs === 'Removed') {
      res.send(docs +'!');
    }
  });
};

exports.remove = function(req, res){
  User.removeAll(function(err, docs) {
    if(err) return console.log(err);
    if(docs === 'Removed') {
      res.send(docs +'!');
    }
  });
};

exports.removePost = function(req, res){
	Post.removeAll(function(err, docs) {
		if(err) return console.log(err);
		if(docs === 'Removed') {
			res.send(docs +'!');
		}
	});
};

exports.usePassport = passport.use(new LocalStrategy(
	function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

exports.serializePassport = passport.serializeUser(function(user, done) {
	done(null, user.id);
});

exports.deserializePassport = passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
    done(err, user);
  });
});