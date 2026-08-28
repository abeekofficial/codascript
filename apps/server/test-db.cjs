const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://uzstreetboyblog_db_user:uzstreetboy021225@uzum-tracker.zvzblhl.mongodb.net/test?retryWrites=true&w=majority&appName=uzum-tracker").then(async () => {
  const db = mongoose.connection.db;
  const users = await db.collection("users").find({}).toArray();
  console.log(JSON.stringify(users, null, 2));
  process.exit(0);
});
