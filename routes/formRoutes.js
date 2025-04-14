const express = require("express");
const router = express.Router();
const formController = require("../controllers/formController");

router.post("/submit", formController.submitForm);
router.get("/", formController.getAllLeads);
router.get("/leads", formController.getFilteredLeads);
router.get("/notification", formController.getNotificationLeads);
router.get("/latest-action", formController.latestAction);
router.get("/close", formController.getLeadsByStatus("close"));
router.get("/onboard", formController.getLeadsByStatus("onboard"));
router.get("/missed-leads", formController.getMissedLeads);
router.post("/update-action/:id", formController.updateAction);

module.exports = router;