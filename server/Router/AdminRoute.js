const express = require("express");
const { allAccountList } = require("../Controller/AdminController");
const { deactivate, active, deleteAccount } = require("../Controller/CustomerController");
const AdminRouter = express.Router();


// AdminRouter.get("accountDetails/:account_no", (req, res) => {
//     res.send("Account Details");
// });
// AdminRouter.use("/activateAccount", )
// AdminRouter.use("/deactivateAccount", )
// AdminRouter.use("/deleteAccount", )
AdminRouter.get("/allAccountList", allAccountList)
AdminRouter.get("/deactivate/:account_no", deactivate);
AdminRouter.get("/active/:account_no", active);
delete
AdminRouter.get("/delete/:account_no", deleteAccount);


module.exports = AdminRouter;