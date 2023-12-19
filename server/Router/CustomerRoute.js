const express = require("express");
const { createAccount, updateAccount, loginAccount, findAccount, transferMoney, balance, transitions, deactivate, active } = require("../Controller/CustomerController");
const CustomerRouter = express.Router();

CustomerRouter.use("/create",createAccount);
CustomerRouter.use("/login",loginAccount);

CustomerRouter.use("/update",updateAccount);
CustomerRouter.get("/findAccount/:account_no",findAccount);
CustomerRouter.post("/transfer",transferMoney);
CustomerRouter.get("/getAccountDetails/:account_no",);
CustomerRouter.get("/getTransactionDetails/:account_no",transitions);
CustomerRouter.get("/balance/:account_no",balance);
module.exports = CustomerRouter