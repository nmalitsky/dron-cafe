var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ClientSchema   = new Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	account: {
		type: Number,
		required: true
	}
});

module.exports = mongoose.model('Client', ClientSchema);