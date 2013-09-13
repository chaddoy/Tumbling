function Post(db) {
	schema = new db.Schema({
		userId: String,
		image: [
			new db.Schema({
				_id: Number,
		    title: String,
		    path: String,
		    likes: { type: Number, default: 0 },
		    dateUploaded: { type: Date, default: Date.now }
	  	})
		],
	});
	this.db = db.model('Post', schema);
}

Post.prototype.findAll = function(callback) {
	this.db.find({}, function(err, docs) {
		if(err) return callback(err);
		callback(null, docs);
	});
}

Post.prototype.findByUserId = function(userId, callback) {
  this.db.find({ userId: userId }, function(err, docs) {
    if(err) return callback(err);
    callback(null, docs);
  });
}

Post.prototype.findByImageId = function(query, callback) {
  this.db.aggregate(query, function(err, docs) {
    if(err) return callback(err);
    callback(null, docs[0].image);
  });
}

Post.prototype.remove = function(obj, callback) {
	var condition = { userId: obj.userId };
	var post = { image: { _id: obj.imageId } };

	this.db.update(condition, { $pull: post }, function(err, docs) {
		if(err) return callback(err);
		callback(null, docs);
	});
}

Post.prototype.upload = function(obj, callback) {
	var _this = this.db;
	this.db.find({ userId: obj.userId }, function(err, docs) {
		if(err) return callback(err);

		if(docs.length > 0) {
			var lastObj = docs[0].image;

      var imageId = 0;
      if(docs[0].image.length === 0) {
        imageId = 1;
      } else {
        imageId = lastObj[lastObj.length -1]._id + 1;
      }
			_this.update({ userId: obj.userId }, {
				$push: {
					image: {
						_id: imageId,
						title: obj.image[0].title,
						path: obj.image[0].path
					}
				}
			}, function(err, docs) {
				if(err) return callback(err);
				console.log('Update');
				callback(null, docs);
			});
		} else {
			var values = {
				userId: obj.userId,
				image: [{
						_id: 1,
						title: obj.image[0].title,
						path: obj.image[0].path
				}]
			};
			_this(values).save(function(err, docs) {
				if(err) return callback(err);
				console.log('Save');
				callback(null, docs);
			});
		}
	});
}

Post.prototype.removeAll = function(callback) {
	this.db.remove({}, function(err) {
		if(err) return callback(err);
		callback(null, 'Removed');
	});
}

module.exports = Post;