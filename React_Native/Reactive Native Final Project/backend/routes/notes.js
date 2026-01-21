const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Note = require('../models/Note');

// @route   POST /api/notes
// @desc    Create a note
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const newNote = new Note({
            userId: req.user.id,
            taskId: req.body.taskId, // Optional link to task
            content: req.body.content
        });

        const note = await newNote.save();
        res.json(note);
    } catch (err) {
        console.error('Note creation error details:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   GET /api/notes
// @desc    Get all user notes
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const query = { userId: req.user.id };
        if (req.query.taskId) {
            query.taskId = req.query.taskId;
        }
        const notes = await Note.find(query)
            .populate('taskId', 'title')
            .sort({ createdAt: -1 });
        res.json(notes);
    } catch (err) {
        console.error('Fetch notes error details:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   PUT /api/notes/:id
// @desc    Update a note
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        let note = await Note.findById(req.params.id);

        if (!note) return res.status(404).json({ msg: 'Note not found' });

        if (note.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        note = await Note.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json(note);
    } catch (err) {
        console.error('Update note error details:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        let note = await Note.findById(req.params.id);

        if (!note) return res.status(404).json({ msg: 'Note not found' });

        if (note.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Note.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Note removed' });
    } catch (err) {
        console.error('Delete note error details:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

module.exports = router;
