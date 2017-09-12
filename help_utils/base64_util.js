/**
 * Created by Tyrion on 2016/5/26.
 */
module.exports.decode = function(string){
    return new Buffer(string,'base64').toString();
};