
function Queue() {
    this.data = [];
}

Queue.prototype.add = function (record) {
    this.data.unshift(record);
};

Queue.prototype.pop = function () {
    if(this.data.length >0) {
        var last = this.last();
        this.data.pop();
        return last;
    }
};

Queue.prototype.first = function () {
    return this.data[0];
};

Queue.prototype.last = function () {
    return this.data[this.data.length - 1];
};

Queue.prototype.size = function () {
    return this.data.length;
};

module.exports = Queue;