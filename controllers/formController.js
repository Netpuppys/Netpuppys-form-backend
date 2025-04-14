const Form = require("../models/Form");

exports.submitForm = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      website,
      budget,
      service,
      startTime,
      designation,
      description,
      formName,
      source,
    } = req.body;

    const newForm = new Form({
      name,
      email,
      phone,
      website,
      budget,
      service,
      startTime,
      designation,
      description,
      formName,
      source,
      createdAt: new Date(),
      action: [], // Empty array initially
    });

    await newForm.save();
    res.status(201).json({ message: "Form submitted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error submitting form" });
  }
};

exports.getAllLeads = async (req, res) => {
  try {
    const Allleads = await Form.find();
    res.status(200).json(Allleads);
  } catch (error) {
    res.status(500).json({ error: "Error fetching leads" });
  }
};

exports.getFilteredLeads = async (req, res) => {
  try {
    const leads = await Form.find();

    const filteredLeads = leads.filter((lead) => {
      if (lead.action.length > 0) {
        const latestAction = lead.action.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0];
        return (
          latestAction.nextFollowUp !== "close" &&
          latestAction.nextFollowUp !== "onboard"
        );
      }
      return true; // If no actions, include in leads
    });

    res.status(200).json(filteredLeads);
  } catch (error) {
    res.status(500).json({ error: "Error fetching leads" });
  }
};

exports.getNotificationLeads = async (req, res) => {
  try {
    const leads = await Form.find();
    const today = new Date();

    // Extract year, month, and date from today's date
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    const notificationLeads = leads.filter((lead) => {
      if (lead.action.length > 0) {
        const latestAction = lead.action.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0];

        if (latestAction.nextFollowUp) {
          const followUpDate = new Date(latestAction.nextFollowUp);

          // Extract year, month, and date from nextFollowUp
          const followUpYear = followUpDate.getFullYear();
          const followUpMonth = followUpDate.getMonth();
          const followUpDay = followUpDate.getDate();

          // Compare only year, month, and date
          return (
            followUpYear === todayYear &&
            followUpMonth === todayMonth &&
            followUpDay === todayDate
          );
        }
      }
      return false;
    });

    res.status(200).json(notificationLeads);
  } catch (error) {
    res.status(500).json({ error: "Error fetching notifications" });
  }
};
exports.latestAction = async (req, res) => {
  try {
    const leads = await Form.find();

    const latestActionLeads = leads.map((lead) => {
      if (lead.action.length > 0) {
        const latestAction = lead.action.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0];

        return {
          ...lead.toObject(), // Convert Mongoose document to plain object
          action: [latestAction], // Keep only the latest action
        };
      }
      return lead; // Return lead as is if no action exists
    });

    res.status(200).json(latestActionLeads);
  } catch (error) {
    res.status(500).json({ error: "Error fetching latest actions" });
  }
};
exports.getLeadsByStatus = (status) => async (req, res) => {
  try {
    const leads = await Form.find();
    const result = leads.filter((lead) => {
      if (lead.action.length > 0) {
        const latest = lead.action.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0];
        return latest.nextFollowUp === status;
      }
      return false;
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: `Error fetching ${status} leads` });
  }
};
exports.getMissedLeads = async (req, res) => {
  try {
    const leads = await Form.find();
    const today = new Date();

    // Normalize today's date to midnight for accurate comparison
    today.setHours(0, 0, 0, 0);

    const missedLeads = leads.filter((lead) => {
      if (lead.action.length > 0) {
        // Get the latest action
        const latestAction = lead.action.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0];

        if (latestAction.nextFollowUp) {
          const followUpDate = new Date(latestAction.nextFollowUp);

          // Normalize followUpDate to midnight to ignore time
          followUpDate.setHours(0, 0, 0, 0);

          // Check if nextFollowUp is before today
          return followUpDate < today;
        }
      }
      return false;
    });

    res.status(200).json(missedLeads);
  } catch (error) {
    console.error("Error fetching Missed Leads:", error);
    res.status(500).json({ error: "Error fetching Missed Leads" });
  }
};
exports.updateAction = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      connectionStatus,
      connectedVia,
      clientStage,
      remarks,
      nextFollowUp,
      actionBy,
    } = req.body;

    // Create new action object
    const newAction = {
      connectionStatus,
      connectedVia,
      clientStage,
      remarks,
      nextFollowUp,
      createdAt: new Date(),
      actionBy, // Add timestamp to each action
    };

    // Update the form by adding a new action to the array
    const updatedForm = await Form.findByIdAndUpdate(
      id,
      { $push: { action: newAction } }, // Push new action into action array
      { new: true } // Return the updated document
    );

    if (!updatedForm) {
      return res.status(404).json({ error: "Form not found" });
    }

    res
      .status(200)
      .json({ message: "Action added successfully!", updatedForm });
  } catch (error) {
    res.status(500).json({ error: "Error updating action" });
  }
};
