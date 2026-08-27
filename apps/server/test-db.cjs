const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://uzstreetboyblog_db_user:uzstreetboy021225@uzum-tracker.zvzblhl.mongodb.net/test?retryWrites=true&w=majority&appName=uzum-tracker").then(async () => {
  const db = mongoose.connection.db;
  const res = await db.collection("problems").updateOne(
    { _id: new mongoose.Types.ObjectId("6a8ebee859eab064e1a91d71") },
    { $set: { testCases: [{ input: "3,7,1,9,4", expectedOutput: "9", isHidden: false }, { input: "10,20,5", expectedOutput: "20", isHidden: false }] } }
  );
  console.log(JSON.stringify(res, null, 2));
  process.exit(0);
});
