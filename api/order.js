'use strict';

module.exports = class Order {
    constructor(order) {
        this.orderedTime = order.orderedTime;
        this.preparedTime = order.preparedTime;
        this.status = order.status;
        this.client_name = order.client_name;
        this.client_email = order.client_email;
        this.price = order.price;
        this.dish = order.dish;
    }

    toSearch() {
        let obj = {};

        if (this.orderedTime) obj['orderedTime'] = this.orderedTime;
        if (this.preparedTime) obj['preparedTime'] = this.preparedTime;
        if (this.status) obj['status'] = this.status;
        if (this.client_name) obj['client_name'] = this.client_name;
        if (this.client_email) obj['client_email'] = this.client_email;
        if (this.price) obj['price'] = this.price;
        if (this.dish) obj['dish'] = this.dish;

        return obj;
    }
};

