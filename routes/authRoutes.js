const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/create-user", authController.register);
router.post("/login", authController.login);
router.post("/change-password", authController.changePassword);
router.delete("/delete-user/:id", authController.deleteUser);
router.post("/logout", authController.logout);
router.get("/get-users", authController.getUsers);

module.exports = router;