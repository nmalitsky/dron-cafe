var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var OrderSchema   = new Schema({
	id: {
		type: Number,
		required: true
	},
	status: { 
		type: String, 
		enum: ['ordered', 'prepared', 'delivered', 'broken', 'completed'],
		default: 'ordered',
		required: true
	}, 
	client: {
		type: String
	},
	dish: {
		type: String
	}

});

module.exports = mongoose.model('Order', OrderSchema);