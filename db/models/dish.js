var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var DishSchema   = new Schema({
	id: {
		type: Number,
		required: true
	},
	title: {
		type: String,
		required: true
	},
	image: {
		type: String,
		required: true
	},
	rating: {
		type: Number,
		required: true
	},
	ingredients: {
		type: Array,
		required: true
	},
	price: {
		type: Number,
		required: true
	}
});

module.exports = mongoose.model('Dish', DishSchema);