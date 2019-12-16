const express = require('express');
const validate = require('express-validation');
const Joi = require('@hapi/joi');
const newsCtrl = require('./news.controller');

const router = express.Router(); // eslint-disable-line new-cap
const paramValidation = {
  createNews: {
    body: {
      title: Joi.string().required(),
      description: Joi.string().max(2000).required(),
    },
  },
  updateNews: {
    params: {
      newsId: Joi.string().required(),
    },
    body: {
      title: Joi.string().required(),
      description: Joi.string().max(2000).required(),
    },
  },
};

router.route('/')
  /** GET /api/news - Get list of news */
  .get(newsCtrl.list)

  /** POST /api/news - Create new news */
  .post(validate(paramValidation.createNews), newsCtrl.create);

router.route('/:newsId')
  /** GET /api/news/:newsId - Get news */
  .get(newsCtrl.get)

  /** PUT /api/news/:newsId - Update news */
  .put(validate(paramValidation.updateNews), newsCtrl.update)

  /** DELETE /api/news/:newsId - Delete news */
  .delete(newsCtrl.remove);

/** Load news when API with newsId route parameter is hit */
router.param('newsId', newsCtrl.load);

module.exports = router;
