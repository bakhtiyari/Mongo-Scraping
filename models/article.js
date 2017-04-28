// Require mongoose
var mongoose = require("mongoose");
// Create Schema class
var Schema = mongoose.Schema;

// Create article schema
var articleSchema = new Schema({
  // title is a required string
  title: {
    type: String,
    required: true,
    unique: true
  },
  // link is a required string
  link: {
    type: String,
    required: true,
    unique: true
  },
  image: {
    type: String,
    required: true,
    unique: true
  },
  // This only saves one note's ObjectId, ref refers to the Note model
  comment: {
    type: Schema.Types.ObjectId,
    ref: "Comment"
  }
});

// Create the Article model with the ArticleSchema
var Article = mongoose.model("Article", articleSchema);

// Export the model
module.exports = Article;
