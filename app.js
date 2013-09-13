/*

Chad Allen Dumadag
===================
NODE MODULES
	connect-flash
	ejs
	ejs-locals
	express
	express-flash
	express-helpers
	formidable
	helpers
	less-middleware
	mongoose
	node
	nodemon
	passport
	passport-local

*/

var express = require('express')
	, flash = require('connect-flash')
	, passport =require('passport')
  , LocalStrategy = require('passport-local').Strategy
	,	http = require('http')
	,	path = require('path')
	, routes =require('./routes')
	,	user = require('./routes/user');

var app = express();

app.configure(function () {
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/public/views');
	app.set('view engine', 'ejs');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser({ keepExtensions: true, uploadDir: __dirname +'/public/images/uploads' }));
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use((express.session({ secret: 'Tumbililing!' })));
	app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());
	app.use(function(req, res, next){
		res.locals = {
	  	title: 'Tumbling',
	  	message: ''
		}
		res.locals.username = function(){
			return req.user.username;
		};
		next();
	});
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

user.usePassport;
user.serializePassport;
user.deserializePassport;


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

function restrict(req, res, next) {
	if (req.user) {
		next();
	} else {
		req.session.error = 'Access denied!';
		res.redirect('/login');
	}
}

app.get('/*', function(req, res, next) {
	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});

app.param('username', user.usernameParam);

app.get('/', routes.index);

app.get('/signUp', user.signUp);
app.post('/signUp', user.signUp);

app.get('/login', routes.login);
app.post('/login', passport.authenticate('local'), user.login);

app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/login');
});

app.get(/\/me\/?(edit_account)?(edit_password)?(edit_avatar)?/, restrict, user.profile);
app.put('/uploadPost', restrict, user.uploadPost);
app.post('/deletePost', user.deletePost);
app.put('/updateAccount', restrict, user.updateAccount);
app.put('/updatePassword', restrict, user.updatePassword);
app.put('/updateAvatar', restrict, user.updateAvatar);

app.get('/users', user.list);
app.get('/check', restrict, function(req, res) {
	res.send(req.user);
});
app.get('/removeUsers', user.remove);
app.get('/removePost', user.removePost);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});