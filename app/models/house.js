var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var HouseSchema   = new Schema({
    _id: String,
    link: String,
    title: String,
    price_init: Number,
    price_last: Number,
    m2price_last: Number,
    date_init: Date,
    date_last: Date,
	city: String,
	pdf: String,
	imageLink: String,
	ignore: Boolean
});

module.exports = mongoose.model('House', HouseSchema);