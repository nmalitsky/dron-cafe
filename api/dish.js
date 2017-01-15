'use strict';

module.exports = class Dish {
	constructor (dish) {
		this.id = dish.id;
		this.title = dish.title;
		this.image = dish.image;
		this.rating = dish.rating;
		this.ingredients = dish.ingredients; // todo check copy if need
		this.price = dish.price;
	}

	show() {
		console.log(`Dish: ${this.title} (id=${this.id}), image: ${this.image}, rating: ${this.rating}, ingradients: ${this.ingradients.join(',')}, price: ${this.price}`);
	}

	toSearch() {
		let obj = {};

		if(this.id) obj['id'] = this.id;
		if(this.title) obj['title'] = this.title;
		if(this.image) obj['image'] = this.image;
		if(this.rating) obj['rating'] = this.rating;
		if(this.ingredients) obj['ingredients'] = this.ingredients;
		if(this.price) obj['price'] = this.price;

		return obj;
	}

	get obj() {
		return {id: this.id, title: this.title, image: this.image, rating: this.rating, ingredients: this.ingredients, price: this.price};
	}
}

