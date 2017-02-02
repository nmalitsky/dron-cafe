'use strict';

module.exports = class Client {
    constructor(client) {
        this.name = client.name;
        this.email = client.email;
        this.account = client.account;
    }

    toSearch() {
        let obj = {};

        if (this.name) obj['name'] = this.name;
        if (this.email) obj['email'] = this.email;
        if (this.account) obj['account'] = this.account;

        return obj;
    }
};