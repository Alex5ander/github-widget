<<<<<<< HEAD
const Datastore = require("nedb");
const db = new Datastore({ filename: "./database.db", autoload: true });
const Visit = () => ({ created_at: new Date().getTime() });
module.exports = { Visit, db };
=======
const Visit = () => ({ created_at: new Date().getTime() });
module.exports = Visit;
>>>>>>> 8e50249c01a3ba01415d158fb7d46ca3105b3e03
