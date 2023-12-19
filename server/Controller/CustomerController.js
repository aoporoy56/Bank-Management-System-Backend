const connection = require("../DB/ConDB");
const { get } = require("../Router/CustomerRoute");
const { response } = require("../config/Response");
const jwt = require("jsonwebtoken");

function lastAccountNo(callback) {
  connection.query(
    "SELECT `account_no` FROM `customer` ORDER BY `account_no` DESC LIMIT 1",
    (err, result, fields) => {
      if (err) {
        callback(err, null);
      }
      if (result.length > 0) {
        callback(null, JSON.parse(JSON.stringify(result[0])).account_no);
      } else {
        callback(null, 0);
      }
    }
  );
}
exports.createAccount = async (req, res) => {
  const { full_name, address, email, gender, phone, nid, password, image } =
    req.body;
  try {
    id = 0;
    account_no = 0;
    await lastAccountNo((err, result) => {
      account_no = result + 1;
      console.log(result);
      if (err) {
        response(res, 500, "Internal Server Error", "Internal Server Error", err.message, null);
      }
      if (result) {
        console.log(account_no);
        customerCreateQuery =
          "INSERT INTO Customer VALUEs (?,?,?,?,?,?,?,?,?,?,?,?,?)";
        customerQueryValue = [
          id,
          account_no,
          full_name,
          address,
          email,
          phone,
          nid,
          gender,
          password,
          0,
          image,
          "Pending",
          new Date(),
        ];
        connection.query(
          customerCreateQuery,
          customerQueryValue,
          (err, result, fields) => {
            if (err) {
              err.code == "ER_DUP_ENTRY"
                ? // ? res.send("Email Already Used")
                  response(
                    res,
                    500,
                    "Internal Server Error",
                    "Duplicate Entry",
                    err.message
                  )
                : response(
                    res,
                    500,
                    "Internal Server Error",
                    "Internal Server Error",
                    err.message
                  );
            } else {
              response(
                res,
                200,
                "OK",
                "Account Created. Your Account No : " + account_no,
                "Account Created. Your Account No : " + account_no,
                result
              );
            }
          }
        );
      } else {
        response(
          res,
          500,
          "Internal Server Error",
          "Internal Server Error",
          err.message
        );
      }
    });
    
  } catch (error) {
    response(
      res,
      500,
      "Internal Server Error",
      "Internal Server Error",
      error.message,
      null
    );
  }
};
exports.loginAccount = (req, res) => {
  try {
    const { account_no, password } = req.body;
    connection.query(
      "SELECT `account_no`,`full_name`,`address`,`email`,`phone`,`nid`,`gender`, `image`,`status` FROM `customer` WHERE `Account_No` = ? AND `password` = ?",
      [account_no, password],
      (err, result, fields) => {
        if (err) {
          response(
            res,
            500,
            "Internal Server Error",
            "Internal Server Error",
            err.message,
            null
          )
        }
        const accountStatus = JSON.parse(JSON.stringify(result))[0].status;
        if(result.length > 0){
          console.log();
          const token = jwt.sign(
            { account_no: result.account_no },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1d" }
          );
            if ( accountStatus != "Active"){
              response(
                res,
                400,
                "OK",
                "Login Successfull",
                "Login Successfull",
                result
              );
              
            }else{
              response(
                res,
                200,
                "OK",
                "Login Successfull",
                "Login Successfull",
                result
              );
            }
              
        }else{
          response(
            res,
            404,
            "Not Found",
            "No Account Found",
            "No Account Found",
            null
          );
        }
      }
    );
  } catch (error) {
    response(
      res,
      500,
      "Internal Server Error",
      "Internal Server Error",
      error.message,
      null
    );
  }
};
exports.findAccount = (req, res) => {
  const { account_no } = req.params;
  try {
    connection.query(
      "SELECT id, account_no,full_name, address, email, phone, nid, gender, balance,STATUS,created_at FROM `customer` WHERE `account_no` = ?",
      [account_no],
      (err, result, fields) => {
        if (err) {
          response(
            res,
            500,
            "Internal Server Error",
            "Internal Server Error",
            err.message,
            null
          );
        }
        if (result.length > 0) {
          response(res, 200, "OK", "Account Found", "Account Found", result[0]);
        } else {
          response(
            res,
            404,
            "Not Found",
            "No Account Found",
            "No Account Found",
            null
          );
        }
      }
    );
  } catch (error) {
    response(
      res,
      500,
      "Internal Server Error",
      "Internal Server Error",
      error.message,
      null
    );
  }
};

exports.transferMoney = (req, res) => {
  const { account_no, receiverAccountNo, amount, password } = req.body;
  try {
    connection.query("SELECT * FROM `customer` WHERE `account_no` = ? AND `password` = ?", [account_no, password], (err, result, fields) => {
      if(err){
        response(res, 500, "Internal Server Error", "Internal Server Error", err.message, null);
      }else{
        if(result.length > 0){
          if(result[0].balance < amount){
            response(res, 400, "Bad Request", "Insufficient Balance", "Insufficient Balance", null);
          }else{
            connection.query("SELECT * FROM `customer` WHERE `account_no` = ?", [receiverAccountNo], (err, result, fields) => {
              if(err){
                response(res, 500, "Internal Server Error", "Internal Server Error", err.message, null);
              }
              if(result.length > 0){
                connection.beginTransaction();
                connection.query("UPDATE `customer` SET `balance` = `balance` + ? WHERE `account_no` = ?", [amount, receiverAccountNo], (err, result, fields) => {
                  if(err){
                    response(res, 500, "Internal Server Error", "Internal Server Error", err.message, null);
                  }
                  if (result.changedRows > 0) {
                    connection.query(
                      "INSERT INTO `transactions` VALUES (?,?,?,?,?,?)",
                      [
                        "",
                        account_no,
                        receiverAccountNo,
                        amount,
                        "Send Money",
                        new Date(),
                      ],
                      (err, result, fields) => {
                        if (err) {
                          connection.rollback();
                          response(
                            res,
                            500,
                            "Internal Server Error",
                            "Internal Server Error",
                            err.message,
                            null
                          );
                        }
                        connection.query(
                          "UPDATE `customer` SET `balance` = `balance` - ? WHERE `account_no` = ?",
                          [amount, account_no],
                          (err, result, fields) => {
                            if (err) {
                              connection.rollback();
                              response(
                                res,
                                500,
                                "Internal Server Error",
                                "Internal Server Error",
                                err.message,
                                null
                              );
                            }
                            if (result.affectedRows > 0) {
                              connection.commit();
                              response(
                                res,
                                200,
                                "OK",
                                "Money Transfered",
                                "Money Transfered",
                                null
                              );
                            } else {
                              connection.rollback();
                              response(
                                res,
                                500,
                                "Internal Server Error",
                                "Internal Server Error",
                                "Transfer Failed",
                                null
                              );
                            }
                          }
                        );
                      }
                    );
                  } else {
                    response(
                      res,
                      500,
                      "Internal Server Error",
                      "Internal Server Error",
                      "Transfer Failed",
                      null
                    );
                  }
                })
              }else{
                response(res, 404, "Not Found", "No Account Found", "No Account Found", null);
              }
            
        })
          }
        }else{
          response(res, 404, "Not Found", "Password Wrong", "Password Wrong", null);
        }
      }
    })
  } catch (error) {
    response(
      res,
      500,
      "Internal Server Error",
      "Internal Server Error",
      error.message,
      null
    );
  }
  

  // try {
  //   connection.query("SELECT * FROM `customer` WHERE `account_no` = ?", [account_no], (err, result, fields) => {
  //     if(err){
  //       response(res, 500, "Internal Server Error", "Internal Server Error", err.message, null);
  //     }
  //     if(result.length > 0){
  //       if(result[0].balance < amount){
  //         response(res, 400, "Bad Request", "Insufficient Balance", "Insufficient Balance", null);
  //       }else{
  //         connection.query("SELECT * FROM `customer` WHERE `account_no` = ?", [receiverAccountNo], (err, result, fields) => {
  //           if(err){
  //             response(res, 500, "Internal Server Error", "Internal Server Error", err.message, null);
  //           }
  //           if(result.length > 0){
  //             connection.beginTransaction();
  //             connection.query("UPDATE `customer` SET `balance` = `balance` + ? WHERE `account_no` = ?", [amount, receiverAccountNo], (err, result, fields) => {
  //               if(err){
  //                 response(res, 500, "Internal Server Error", "Internal Server Error", err.message, null);
  //               }
  //               if(result.affectedRows > 0){
  //                 connection.query(
  //                   "INSERT INTO `transactions` VALUES (?,?,?,?,?,?)",
  //                   [account_no, receiverAccountNo, amount, "Send Money", new Date()],
  //                   (err, result, fields) => {
  //                     if (err) {
  //                       connection.rollback();
  //                       response(
  //                         res,
  //                         500,
  //                         "Internal Server Error",
  //                         "Internal Server Error",
  //                         err.message,
  //                         null
  //                       );
  //                     }
  //                     connection.query(
  //                       "UPDATE `customer` SET `balance` = `balance` - ? WHERE `account_no` = ?",
  //                       [amount, account_no],
  //                       (err, result, fields) => {
  //                         if (err) {
  //                           connection.rollback();
  //                           response(
  //                             res,
  //                             500,
  //                             "Internal Server Error",
  //                             "Internal Server Error",
  //                             err.message,
  //                             null
  //                           );
  //                         }
  //                         if (result.affectedRows > 0) {
  //                           connection.commit();
  //                           response(
  //                             res,
  //                             200,
  //                             "OK",
  //                             "Transfer Successfull",
  //                             "Transfer Successfull",
  //                             null
  //                           );
  //                         } else {
  //                           connection.rollback();
  //                           response(
  //                             res,
  //                             500,
  //                             "Internal Server Error",
  //                             "Internal Server Error",
  //                             "Transfer Failed",
  //                             null
  //                           );
  //                         }
  //                       }
  //                     );
  //                   }
  //                 );
  //               }else{
  //                 response(res, 500, "Internal Server Error", "Internal Server Error", "Transfer Failed", null);
  //               }
  //             })
  //           }else{
  //             response(res, 404, "Not Found", "No Account Found", "No Account Found", null);
  //           }
  //         })
  //       }
  //     }else{
  //       response(res, 404, "Not Found", "No Account Found", "No Account Found", null);
  //     }
  //   })
  // } catch (error) {
  //   response(res, 500, "Internal Server Error", "Internal Server Error", error.message, null);
  // }
};
exports.balance = (req, res) => {
  const { account_no } = req.params;
  try {
    connection.query(
      "SELECT `balance` FROM `customer` WHERE `account_no` = ?",
      [account_no],
      (err, result, fields) => {
        if (err) {
          response(
            res,
            500,
            "Internal Server Error",
            "Internal Server Error",
            err.message,
            null
          );
        }
        if (result.length > 0) {
          response(res, 200, "OK", "Balance Found", "Balance Found", result[0]);
        } else {
          response(
            res,
            404,
            "Not Found",
            "No Account Found",
            "No Account Found",
            null
          );
        }
      }
    );
  } catch (error) {
    response(
      res,
      500,
      "Internal Server Error",
      "Internal Server Error",
      error.message,
      null
    );
  }
};
exports.transitions = (req, res) => {
  const { account_no } = req.params;
  try {
    connection.query(
      "SELECT * FROM `transactions` WHERE `account_no` = ? or `receiver_account_no`=?",
      [account_no, account_no],
      (err, result, fields) => {
        if (err) {
          response(
            res,
            500,
            "Internal Server Error",
            "Internal Server Error",
            err.message,
            null
          );
        }
        console.log(result.length);
        if (result.length > 0) {
          response(
            res,
            200,
            "OK",
            "Transition Found",
            "Transition Found",
            result
          );
        } else if (result.length == 0) {
          response(
            res,
            404,
            "Not Found",
            "No Transition Found",
            "No Transition Found",
            null
          );
        } else {
          response(
            res,
            404,
            "Not Found",
            "No Transition Found",
            "No Transition Found",
            null
          );
        }
      }
    );
  } catch (error) {
    response(
      res,
      500,
      "Internal Server Error",
      "Internal Server Error",
      error.message,
      null
    );
  }
};
exports.deactivate = (req, res) => {
  try {
    const { account_no } = req.params;
    connection.query(
      "UPDATE `customer` SET `status` = 'Deactive' WHERE `account_no` = ?",
      [account_no],
      (err, result, fields) => {
        if (err) {
          response(
            res,
            500,
            "Internal Server Error",
            "Internal Server Error",
            err.message,
            null
          );
        }
        if (result.affectedRows > 0) {
          response(
            res,
            200,
            "OK",
            "Account Deactivated",
            "Account Deactivated",
            null
          );
        } else {
          response(
            res,
            404,
            "Not Found",
            "No Account Found",
            "No Account Found",
            null
          );
        }
      }
    );
  } catch (error) {
    response(
      res,
      500,
      "Internal Server Error",
      "Internal Server Error",
      error.message,
      null
    );
  }
};
exports.active = (req, res) => {
  const { account_no } = req.params;
  try {
    connection.query(
      "UPDATE `customer` SET `status` = 'Active' WHERE `account_no` = ?",
      [account_no],
      (err, result, fields) => {
        if (err) {
          response(
            res,
            500,
            "Internal Server Error",
            "Internal Server Error",
            err.message,
            null
          );
        }
        if (result.affectedRows > 0) {
          response(
            res,
            200,
            "OK",
            "Account Activated",
            "Account Activated",
            null
          );
        } else {
          response(
            res,
            404,
            "Not Found",
            "No Account Found",
            "No Account Found",
            null
          );
        }
      }
    );
  } catch (error) {
    response(
      res,
      500,
      "Internal Server Error",
      "Internal Server Error",
      error.message,
      null
    );
  }
};
exports.deleteAccount = (req, res) => {
  const { account_no } = req.params;
  try {
    connection.query(
      "DELETE FROM `customer` WHERE `account_no` = ?",
      [account_no],
      (err, result, fields) => {
        if (err) {
          response(
            res,
            500,
            "Internal Server Error",
            "Internal Server Error",
            err.message,
            null
          );
        }
        if (result.affectedRows > 0) {
          response(res, 200, "OK", "Account Deleted", "Account Deleted", null);
        } else {
          response(
            res,
            404,
            "Not Found",
            "No Account Found",
            "No Account Found",
            null
          );
        }
      }
    );
  } catch (error) {
    response(
      res,
      500,
      "Internal Server Error",
      "Internal Server Error",
      error.message,
      null
    );
  }
};
exports.updateAccount = (req, res) => {
  accountUpdate =
    "UPDATE customers SET name = 'NewNme', address = 'New Address', email = 'newemail@example.com', mobile = '555-555-5555', pin = 'newpin', balance = 1500.00, status = 'Active' WHERE customer_id = 18";
  accountUpdateValue = [];
  connection.query(accountUpdate, accountUpdateValue, (err, result, fields) => {
    if (err) {
      res.send(err);
    }
    if (result.changedRows > 0) {
      res.send("Updated");
    } else {
      res.send("No Change");
    }
  });
};
