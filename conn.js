var mysql = require("mysql");
var util = require("util");


var conn = mysql.createConnection({
    host:"bmencpnsxzzbvbsb6yxb-mysql.services.clever-cloud.com",
    user:"ud3hnpaskqfnzuze",
    password:"iBaYjr0C2ppr92l2KjxO",
    database:"bmencpnsxzzbvbsb6yxb"
})


var exe = util.promisify(conn.query).bind(conn);


module.exports = exe;
