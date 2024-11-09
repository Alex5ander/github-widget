const Datastore = require("nedb");
const db = new Datastore({ filename: "./database.db", autoload: true });
const Visit = () => ({ created_at: new Date().getTime() });
module.exports = { Visit, db };
