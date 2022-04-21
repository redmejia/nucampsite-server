const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
	.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
	.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
		Favorite.find({ user: req.user._id })
			.populate('user')
			.populate('campsites')
			.then(favorite => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(favorite);
			})
			.catch(err => next(err));
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		Favorite.findOne({ user: req.user._id })
			.then(favorites => {
				if (favorites.includes(favorites._id)) {
					favorites.push(favorites._id)
					favorites.save()
						.then(favorite => {
							res.statusCode = 200;
							res.setHeader('Content-Type', 'application/json');
							res.json(favorite);
						})
				} else {
					Favorite.create({
						user: req.user._id,
						campsite: req.body
					})
						.then(favorite => {
							res.statusCode = 200;
							res.setHeader('Content-Type', 'application/json');
							res.json(favorite);
						})
						.catch(err => next(err));
				}
			})
	})
	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
		res.statusCode = 501;
		res.send('Put is not suppurted')
	})
	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		Favorite.findOneAndDelete({
			user: req.user
		}).then(favorite => {
			res.statusCode = 200
			res.setHeader('Content-Type', 'application/json');
			res.json(favorite);
		})
	});

favoriteRouter.route('/:campsiteId')
	.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
	.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
		res.statusCode = 403
		res.send('/:campsiteId is not supported')
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
		Favorite.findOne({
			campsites: req.user._id
		})
			.then(favorite => {
				if (favorite.campsites) {
					res.send('That campsite is already in the list of favorite.')
				}
				favorite.save()
					.then(favorite => {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json(favorite);
					})
			})
	})
	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
		res.statusCode = 403
		res.send('/:campsiteId is not supported')
	})
	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
		Favorite.findOneAndDelete(req.params.campsiteId)
			.then(favorite => {
				const newFavorite = favorite.campsites.filter(favorite => favorite._id !== req.params.campsiteId)
				newFavorite.save()
					.then(favorite => {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json(favorite);
					})
			})
	});