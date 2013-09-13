var passport = require('passport')
  , mongoose = require('mongoose')
  , userModel = require('../models/User')
  , postModel = require('../models/Post');

exports.index = function(req, res) {
	if(!req.user) {
	  res.render('signUp', {
	  	title: 'Sign up | Tumbling',
	  	message: ''
	  });
	} else {
	  res.render('index', {
	  	title: 'Tumbling',
	  	message: ''
	  });
	}
};

exports.login = function(req, res) {
  if(!req.user) {
    res.render('login', {
      title: 'Login | Tumbling',
      message: ''
    });
  } else {
    res.redirect('/');
  }
};