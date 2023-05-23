const mongosee = require('mongoose');

const UserSchema = mongosee.Schema({
    firstname: String,
    lastname: String,
    email: {
        type: String,
        unique: true,
    },
    password: String,
    role: String,
    active: Boolean,
    avatar: String,
});

module.exports = mongosee.model('User', UserSchema);