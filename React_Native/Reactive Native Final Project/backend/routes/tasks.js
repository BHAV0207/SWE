const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const Note = require('../models/Note');

// @route   POST /api/tasks
// @desc    Create a task
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        console.log('Creating task with body:', req.body);
        const newTask = new Task({
            userId: req.user.id,
            title: req.body.title,
            description: req.body.description,
            priority: req.body.priority,
            dueDate: req.body.dueDate,
            category: req.body.category
        });

        const task = await newTask.save();
        console.log('Saved task:', task);
        res.json({ ...task.toJSON(), noteCount: 0 });
    } catch (err) {
        console.error('Task creation error details:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   GET /api/tasks
// @desc    Get all user tasks
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });

        const tasksWithNoteCount = await Promise.all(tasks.map(async (task) => {
            const count = await Note.countDocuments({ taskId: task._id });
            return { ...task.toJSON(), noteCount: count };
        }));

        res.json(tasksWithNoteCount);
    } catch (err) {
        console.error('Fetch tasks error details:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);

        if (!task) return res.status(404).json({ msg: 'Task not found' });

        // Make sure user owns task
        if (task.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        console.log('Updating task with body:', req.body);
        task = await Task.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        const count = await Note.countDocuments({ taskId: task._id });
        res.json({ ...task._doc, noteCount: count });
    } catch (err) {
        console.error('Update task error details:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);

        if (!task) return res.status(404).json({ msg: 'Task not found' });

        // Make sure user owns task
        if (task.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        // Delete all notes associated with this task
        await Note.deleteMany({ taskId: req.params.id });

        await Task.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Task and associated notes removed' });
    } catch (err) {
        console.error('Delete task error details:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

module.exports = router;
