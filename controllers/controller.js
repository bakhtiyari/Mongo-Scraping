// Import dependencies.
var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');

// Initialize express router.
var router = express.Router();

// Import models.
var Article = require('../models/article');
var Comment = require('../models/comment');

// Pulls article data from the database and uses it to render the index.
router.get('/', function (req, res) {
    // Find all articles.
    Article.find({}).sort({_id: 'desc'}).exec(function (err, data) {
        // Create array for article data.
        var resultData = [];
        // For each article, create an object that handlebars will use to render the article.
        data.forEach(function (article) {
            resultData.push({
                title: article.title,
                link: article.link,
                image: article.image,
                articleID: article.articleID
            });
        });
        // Render index based on the result object compiled above.
        res.render('index', {result: resultData});
    });
});

// Pulls comment data from the database and uses it to render the comment page.
router.get('/:id', function(req, res) {
    // ID is the article ID.
    var articleID = req.params.id;
    // Find all comments for that article ID.
    Article.find({articleID: articleID}).populate('comments').exec(function(err, data) {
        if (err) {
            console.log(err);
        } else {
            if (data.length > 0) {
                var commentData = [];
                data[0].comments.forEach(function(comment) {
                    commentData.push({
                        id: comment._id,
                        text: comment.text,
                        timestamp: comment.timestamp,
                        articleID: articleID
                    });
                });

                var articleTitle = data[0].title;
                var link = data[0].link;
                commentData.push({articleID: articleID, articleTitle: articleTitle, link: link});

                res.render('comment', {commentData: commentData});
            } else {
                res.redirect('/');
            }
        }
    });
});

// Scrapes data from vox.com/news.
router.get('/api/news', function (req, res) {
    // Make a request to Rotten tomatoes
    request('https://editorial.rottentomatoes.com/news/', function (error, response, html) {

        // Load the html of the page into a cheerio $ variable, similar to jQuery $.
        var $ = cheerio.load(html);

        // With cheerio, find each div with the 'm-block' class.
        // (i: iterator. element: the current element)
        $('.m-block').each(function (i, element) {

            // Grab the title.
           

            // Grab the article URL.
            

            // Grab the article blurb.
            

            // Create an author array.
            

            // Grab the byline section.
            

            // Grab the image URL.
            var image = $(element).children('.m-block__image').children('a').children('img').data('original');

            // Grab the article's unique ID.
            var articleID = $(element).children('.m-block__body').children('.m-block__body__byline').children('span').data('remote-admin-entry-id');

            // Save these results in an object that we'll save to MongoDB.
            var newArticle = {
                title: title,
                link: link,
                image: image,
                articleID: articleID
            };

            // We're going to query the Article collection for an article by this ID.
            var query = {articleID: articleID};

            // Run that query. If matched, update with 'newArticle'. If no match, create with 'newArticle.'
            Article.findOneAndUpdate(query, newArticle, {upsert: true}, function (err) {
                if (err) {
                    console.log(err);
                }
            });
        });

        res.redirect('/');

    });
});

// Add new comment.
router.post('/api/comment/:article', function(req, res) {
    var articleID = req.params.article;
    var text = req.body.text;
    var author = req.body.author;

    var newComment = {
        text: text,
        author: author
    };

    Comment.create(newComment, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            Article.findOneAndUpdate({articleID: articleID}, { $push: { 'comments': data._id } }, { new: true }, function(error) {
                if (error) {
                    console.log(error);
                } else {
                    res.redirect('/' + articleID);
                }
            });
        }
    });

});

// Delete comment.
router.get('/api/comment/:article/:comment', function(req, res) {
    var id = req.params.comment;
    var articleID = req.params.article;
    Comment.remove({_id: id}, function(err) {
        if (err) {
            console.log(err);
        } else {
            Article.findOneAndUpdate({articleID: articleID}, { $pull: { comments: id } }, {safe: true}, function(error, data) {
                if (error) {
                    console.log(error);
                } else {
                    console.log(data);
                    res.redirect('/' + articleID);
                }
            });
        }
    });
});

// Default route.
router.use('*', function (req, res) {
    res.redirect('/');
});

// Export routes.
module.exports = router;