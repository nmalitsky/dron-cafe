var mongoose     = require('mongoose');
var Mixed 	 = mongoose.Schema.Types.Mixed;
var Schema       = mongoose.Schema;

var OrderSchema   = new Schema({
	orderedTime: {
		type: String,
		required: true
	},
    preparedTime: {
        type: String,
        required: false
    },
	status: { 
		type: String, 
		enum: ['ordered', 'prepared', 'delivered', 'broken', 'completed'],
		default: 'ordered',
		required: true
	}, 
	client_name: {
		type: String,
		required: true
	},
	client_email: {
		type: String,
		required: true
	},
	price: {
		type: String,
		required: true
	},
	dish: {
		type: Mixed,
		required: true
	}
});

module.exports = mongoose.model('Order', OrderSchema);