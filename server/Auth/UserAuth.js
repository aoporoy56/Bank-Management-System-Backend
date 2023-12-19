const connection = require("../DB/ConDB");
const { response } = require("../config/Response");

exports.auth = function(req, res, next) {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const account_no = jwt.verify(token, process.env.JWT_SECRET);
            connection.query(
              "SELECT * FROM users WHERE account_id = ?",
              account_no,
              (err, result) => {
                if (err) {
                  response(res, 500, err, null, null, null);
                }else{
                    if(result.length === 0) {
                        response(res, 404, null, null, "User not found", null);
                    }else{
                        next();
                    
                    }
                }
              }
            );
        } catch (error) {
            response(res, 401, null, null, "Not Authorized", null);
        }
    }
}