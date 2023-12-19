const connection = require("../DB/ConDB");
const { response } = require("../config/Response");


exports.allAccountList = (req, res) => {
    try {
        connection.query("SELECT * FROM customer", (err, result) => {
            console.log(result)
            if (err) {
                console.log(err);
                response(res, 400, "Bad Request", "Something went wrong", err, null);
            } else {
                response(res, 200, "Success", "All Account List", null, result);
            }
        })
    } catch (error) {
        response(res, 500, "Internal Server Error", "Something went wrong", error.message, null);
    }
}