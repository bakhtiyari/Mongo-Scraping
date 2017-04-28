// Import dependencies.
var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');

// Initialize express router.
var router = express.Router();

// Import models.
var Article = require('../models/article.js');
var Comment = require('../models/comment.js');

router.get("/", function(req, res) {
    res.render("index");
})

// A GET request to scrape the Rotten Tomatoes website
router.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("https://editorial.rottentomatoes.com/news/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);

    var result = [];
   
    $("div.newsItem").each(function(i, element) {

      // Add the text, href, and image of every element, and save them as properties of the result object
        var title = $(element).find("p").text();
        var link = $(element).find("a").attr("href");
	    var image = $(element).find("a").find("img").attr("src");

        if (title && link && image) {
                //push the elements as an object into the result array
                result.push({
                    title: title,
                    link: link,
                    image: image
                })
        }

    });

    res.render("index", { result: result });
  });

});

// Saved articles
router.get("/saved", function(req, res) {
    var query = Article.find({});

    query.exec(function(err, articles) {
        if (err) {
            return handleError(err);
        } else {

            res.render("saved", { articles: articles });
        }
    });
});

//Save scraped articles into the db
router.post("/", function(req, res) {

    var art = new Article({
        title: req.body.title,
        link: req.body.link,
        image: req.body.image
    });

    art.save(function(err, art) {
        // If there's an error during this query
        if (err) {
            // Log the error
            return console.log(err);
        }
        // Otherwise,
        else {
            //log results
        }
    });
     
    res.redirect("/scrape");

})

// add comment and push to specified article...
router.post('/articles/:id', function(req, res) {
    // create a new comment and pass the req.body to the entry.
    var comment = new Comment({
        username: req.body.username,
        body: req.body.body
    });


    comment.save(function(err, result) {
        // log any errors
        if (err) {
            console.log(err);
        } else {

            //updates the article's comments array so that the new comment is included in results
            Article.findOneAndUpdate({ '_id': req.body.id }, { $push: { 'comment': result._id } }, { new: true }, function(err, result) {
                // log any errors
                if (err) {
                    console.log(err);
                } else {

                    //takes you back to saved results
                    res.redirect('/saved');
                }
            });
        }
    });
});

//Delete route for articles
router.post("/articles/one/:id", function(req, res) {

    Article.findOneAndRemove({ "_id": req.params.id }, { $push: { 'comment': Comment._id } }, function(err) {
        if (err) {
            return handleError(err);
        } else {

            res.redirect('/saved');
        }

    });
});

// Default route.
router.use('*', function (req, res) {
    res.redirect('/');
});

// Export routes.
module.exports = router;