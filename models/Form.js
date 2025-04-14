const mongoose = require("mongoose");

const formSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  website: String,
  budget: String,
  service: String,
  startTime: String,
  designation: String,
  description: String,
  formName: String,
  source: String,
  createdAt: { type: Date, default: Date.now },
  action: [
    {
      connectionStatus: String,
      connectedVia: String,
      clientStage: String,
      remarks: String,
      nextFollowUp: String,
      createdAt: { type: Date, default: Date.now },
      actionBy: String,
    },
  ],
});

module.exports = mongoose.model("Form", formSchema);