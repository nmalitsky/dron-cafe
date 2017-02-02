'use strict';

module.exports = class Dish {
    constructor(dish) {
        this.id = dish.id;
        this.title = dish.title;
        this.image = dish.image;
        this.rating = dish.rating;
        this.ingredients = dish.ingredients;
        this.price = dish.price;
    }

    toSearch() {
        let obj = {};

        if (this.id) obj['id'] = this.id;
        if (this.title) obj['title'] = this.title;
        if (this.image) obj['image'] = this.image;
        if (this.rating) obj['rating'] = this.rating;
        if (this.ingredients) obj['price'] = this.ingredients;
        if (this.price) obj['dish'] = this.price;

        return obj;
    }
};

