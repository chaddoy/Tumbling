function User(db) {
	userSchema = new db.Schema({
		email: String,
		password: String,
		username: String,
		profilePic: { type: String, default: '/images/tumbling.png' }
	});
	userSchema.methods.validPassword = function(password) {
		return (this.password === password);
	};
	this.db = db.model('User', userSchema);
}

User.prototype.findAll = function(callback) {
	this.db.find({}, function(err, docs) {
		if(err) return callback(err);
		callback(null, docs);
	});
}

User.prototype.findOne = function(query, callback) {
	this.db.findOne(query, function (err, docs) {
		if(err) return callback(err);
		return callback(null, docs);
	});
}

User.prototype.findById = function(id, callback) {
	this.db.findOne({ _id: id }, function(err, docs) {
		if(err) return callback(err);
		return callback(null, docs);
	});
}

User.prototype.findByUsername = function(username, callback) {
	var condition = { username: username };
	this.db.find(condition, function(err, docs) {
		if(err) return callback(err);
		callback(null, docs);
	});
}

User.prototype.findByEmail = function(email, callback) {
	var condition = { email: email };
	this.db.find(condition, function(err, docs) {
		if(err) return callback(err);
		callback(null, docs);
	});
}

User.prototype.changePassword = function(id, password, callback) {
	this.db.findByIdAndUpdate(id, { $set: { password: password }}, function (err, docs) {
	  if (err) return console.log(err);
		callback(null, docs);
	});
}

User.prototype.updateInfo = function(id, object, callback) {
	this.db.findByIdAndUpdate(id, { $set: object}, function (err, docs) {
	  if (err) return console.log(err);
		callback(null, docs);
	});
}

User.prototype.register = function(object, callback) {
	var _this = this.db;
	this.db.count({ email: object.email }, function(err, emailCount) {
		if(err) return callback(err);
		if(emailCount > 0) {
			callback(null, 'Email already used!');
		} else {
			_this.count({ username: object.username }, function(err, usernameCount) {
				if(err) return callback(err);
				if(usernameCount > 0) {
					callback(null, 'Username already used!');
				} else {
					_this(object).save(function(err, docs) {
						if(err) return callback(err);
						callback(null, 'Success!');
					});
				}
			});
		}
	});
}

User.prototype.removeAll = function(callback) {
	this.db.remove({}, function(err) {
		if(err) return callback(err);
		callback(null, 'Removed');
	});
}

module.exports = User;