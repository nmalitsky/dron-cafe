'use strict';

module.exports = class Order {
	constructor (order) {
		this.id = order.id;
		this.status = order.status;
		this.client = order.client;
		this.dish = order.dish;
	}

	show() {
		console.log(`Order: ${this.id}, status: ${this.status}, client: ${this.client}, dish: ${this.dish}`);
	}

	toSearch() {
		let obj = {};

		if(this.id) obj['id'] = this.id;
		if(this.status) obj['status'] = this.status;
		if(this.client) obj['client'] = this.client;
		if(this.dish) obj['dish'] = this.dish;

		return obj;
	}

	get obj() {
		return {id: this.id, status: this.status, client: this.client, dish: this.dish};
	}
}

