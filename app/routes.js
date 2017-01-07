 // app/routes.js

// grab the nerd model we just created
var House = require('./models/house');
var path = require('path');var fs = require('fs');
var mongoose = require("mongoose");
var Grid = require('gridfs-stream');
var GridFS = Grid(mongoose.connection.db, mongoose.mongo);
var util = require('util');
var ObjectId = require('mongoose').Types.ObjectId; 

    module.exports = function(app) {

        // server routes ===========================================================
        app.get('/api/houses', function(req, res) {
			util.log('getAll');
			var filters={};
			if(req.query.filters){
				filters = JSON.parse(decodeURIComponent(req.query.filters));
			}
			util.log(filters)
			
			var sort={date_init:-1};
			
			if(req.query.sort){
				sort = JSON.parse(decodeURIComponent(req.query.sort));
			}
			
            House.find(filters).sort(sort).exec(function(err, houses) {
                if (err)
                    res.send(err);

				util.log('nbResults: '+houses.length);
                res.json(houses);
            });
        });
		
		app.get('/api/houses/:docId/pdf', function(req,res){
			House.findOne({_id:req.params.docId}, function(err, house) {
                if (err)
                    res.send(err);
			
				var pdfId = new ObjectId(house.pdf);
				var readstream = GridFS.createReadStream({_id: pdfId});
				readstream.pipe(res);
            });
		});

		app.get('/api/cities', function(req, res) {
			House.find().distinct('city', function(err, cities) {
				if (err)
					res.send(err);

				res.json(cities);
			});
        });
		
		app.put('/api/houses/:docId', function(req,res){
			util.log('updateOne: '+req.params.docId);
			House.update({_id:req.params.docId}, req.body, function(err) {
                if (err){
                    res.send(err);
					util.log(err);
				}
				else {
					res.send(true);
				}
            });
		});
		
		app.get('/api/stats/avgm2price', function(req, res) {
			util.log('getAvgM2Price');
			var filters={};
			if(req.query.filters){
				filters = JSON.parse(decodeURIComponent(req.query.filters));
			}
			
            House.aggregate(
			[
			{$match: filters},
			{$project:{surface:1, price: {$ifNull:["$price_last","$price_init"]}}},
			{$group:{_id:null, avgm2price:{$avg:{$divide: [ "$price", "$surface"]}}}}]).exec(function(err, stats) {
                if (err)
                    res.send(err);
			
				util.log('avgm2price: '+stats[0].avgm2price);
                res.json(Number(stats[0].avgm2price.toFixed(0)));
            });
        });
		
		app.get('/api/stats/avgpubdate', function(req, res) {
			util.log('getAvgPublishedDate');
			var filters={};
			if(req.query.filters){
				filters = JSON.parse(decodeURIComponent(req.query.filters));
			}
			
            House.aggregate(
			[
			{$match: filters},
			{$project:{date_last:1, date_init: 1}},
			{$group:{_id:null, avgPubDate:{$avg:{ $subtract: [ "$date_last", "$date_init"]}}}}]).exec(function(err, stats) {
                if (err)
                    res.send(err);
			
				var daysDifference = Number((stats[0].avgPubDate/1000/60/60/24).toFixed(0));
				util.log('avgPubDate: '+daysDifference);
                res.json(daysDifference);
            });
        });
		
        // frontend routes =========================================================
        // route to handle all angular requests
        app.get('*', function(req, res) {
            res.sendFile(path.join(__dirname, '../public/index.html')); // load our public/index.html file
        });
    };
