const express = require("express");
const router = express.Router();
const {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
} = require("../controllers/groupController");
const auth = require("../middlewares/auth").auth;

router.get("/", auth, getGroups);
router.get("/:id", auth, getGroup);
router.post("/", auth, createGroup);
router.put("/:id", auth, updateGroup);
router.delete("/:id", auth, deleteGroup);
router.post("/:id/members", auth, addMember);
router.delete("/:id/members/:userId", auth, removeMember);

module.exports = router;
