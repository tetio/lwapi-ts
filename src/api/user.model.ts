
import { IUser } from './user';
import mongoose = require('mongoose');


//type UserType = IUser & mongoose.Document;
var UserSchema: mongoose.Schema = new mongoose.Schema({
    username  :  {type: String, required: true},
    password  :  {type: String, required: true},
    name  :  {type: String, required: true},
    lastName  :  {type: String, required: true},
    email  :  {type: String, required: false}
});


var User = mongoose.model<IUser>('User', UserSchema);

//export default const User = mongoose.model<IUser>('User', UserSchema);

export { User }
