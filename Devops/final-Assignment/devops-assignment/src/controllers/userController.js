const User = require("../models/User");

const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const user = await User.create({ name, email });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

const getUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
};

const updateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
};

const deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(204).send();
};

module.exports = {createUser, deleteUser, updateUser, getUser, getUsers}
