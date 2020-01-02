'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const schema = new Schema({
    nick_name: String,
    head_img: String,
    name: String,
    password: String,
    create_at: {
        type: Date,
        default: Date.now,
    },
});

// Duplicate the ID field.
schema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
// schema.set('toJSON', {
//     virtuals: true,
// });
schema.set('toObject', {
    virtuals: true,
});

schema.index({name: 1}, {unique: true});

module.exports = mongoose.model('User', schema);
