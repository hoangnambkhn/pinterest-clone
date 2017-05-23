const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const imageSchema = new Schema({
    userId : String,
    url : String,
    description : String,
    userAvatar : String,
    listUserLike : [{
        userId: String
        
    }]
});
const modelsClass = mongoose.model('image',imageSchema);
module.exports = modelsClass;