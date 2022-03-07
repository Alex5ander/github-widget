const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema({
    created_at: { type: Date, default: Date.now }
});

const Visit = mongoose.model("visit", visitSchema);

module.exports = Visit;