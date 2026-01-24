const Group = require("../models/Group");
const User = require("../models/User");

// @desc    Get all groups for user
// @route   GET /api/groups
// @access  Private
exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      "members.user": req.user.id,
    })
      .populate("members.user", "name email avatar")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: groups.length,
      data: groups,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single group
// @route   GET /api/groups/:id
// @access  Private
exports.getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("members.user", "name email avatar phone")
      .populate("createdBy", "name email");

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is a member
    const isMember = group.members.some(
      (member) => member.user._id.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this group",
      });
    }

    res.json({
      success: true,
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create group
// @route   POST /api/groups
// @access  Private
exports.createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Please provide a group name",
      });
    }

    // Create group with creator as admin
    const group = await Group.create({
      name,
      description,
      createdBy: req.user.id,
      members: [
        {
          user: req.user.id,
          role: "admin",
        },
      ],
    });

    // Add additional members if provided
    if (members && members.length > 0) {
      for (let memberId of members) {
        if (memberId !== req.user.id) {
          group.members.push({
            user: memberId,
            role: "member",
          });
        }
      }
      await group.save();
    }

    const populatedGroup = await Group.findById(group._id)
      .populate("members.user", "name email avatar")
      .populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      message: "Group created successfully",
      data: populatedGroup,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Private
exports.updateGroup = async (req, res) => {
  try {
    let group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is admin
    const isAdmin = group.members.some(
      (member) =>
        member.user.toString() === req.user.id && member.role === "admin"
    );

    if (!isAdmin && group.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this group",
      });
    }

    group = await Group.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("members.user", "name email avatar")
      .populate("createdBy", "name email");

    res.json({
      success: true,
      message: "Group updated successfully",
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private
exports.deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Only creator can delete
    if (group.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only group creator can delete the group",
      });
    }

    await group.deleteOne();

    res.json({
      success: true,
      message: "Group deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add member to group
// @route   POST /api/groups/:id/members
// @access  Private
exports.addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is admin
    const isAdmin = group.members.some(
      (member) =>
        member.user.toString() === req.user.id && member.role === "admin"
    );

    if (!isAdmin && group.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to add members",
      });
    }

    // Check if user already a member
    const alreadyMember = group.members.some(
      (member) => member.user.toString() === userId
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a member",
      });
    }

    // Add member
    group.members.push({
      user: userId,
      role: "member",
    });

    await group.save();

    const updatedGroup = await Group.findById(group._id).populate(
      "members.user",
      "name email avatar"
    );

    res.json({
      success: true,
      message: "Member added successfully",
      data: updatedGroup,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Remove member from group
// @route   DELETE /api/groups/:id/members/:userId
// @access  Private
exports.removeMember = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is admin
    const isAdmin = group.members.some(
      (member) =>
        member.user.toString() === req.user.id && member.role === "admin"
    );

    if (!isAdmin && group.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to remove members",
      });
    }

    // Remove member
    group.members = group.members.filter(
      (member) => member.user.toString() !== req.params.userId
    );

    await group.save();

    res.json({
      success: true,
      message: "Member removed successfully",
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};