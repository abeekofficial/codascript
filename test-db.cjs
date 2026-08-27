const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://uzstreetboyblog_db_user:uzstreetboy021225@uzum-tracker.zvzblhl.mongodb.net/test?retryWrites=true&w=majority&appName=uzum-tracker").then(async () => {
  const db = mongoose.connection.db;
  const problem = await db.collection("problems").findOne({ _id: new mongoose.Types.ObjectId("6a8ebee859eab064e1a91d71") });
  console.log(JSON.stringify(problem, null, 2));
  process.exit(0);
});
