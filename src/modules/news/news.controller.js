const httpStatus = require('http-status');
const News = require('./news.model');
const APIError = require('../../helpers/APIError');

/**
 * Load news and append to req.
 */
function load(req, res, next, id) {
  News.get(id)
    .then((news) => {
      req.news = news; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get news
 * @returns {News}
 */
function get(req, res) {
  return res.json(req.news);
}

/**
 * Create new news
 * @property {string} req.body.title - The name of news.
 * @property {string} req.body.description - The description of news.
 * @returns {News}
 */
function create(req, res, next) {
  const news = new News(req.body);
  news.owner = res.locals.session._id;

  News.findOne({ title: news.title })
    .exec()
    .then((foundNews) => {
      if (foundNews) {
        return Promise.reject(new APIError('News name must be unique', httpStatus.CONFLICT, true));
      }
      return news.save();
    })
    .then(savedNews => res.json(savedNews))
    .catch(e => next(e));
}

/**
 * Update existing news
 * @property {string} req.body.title - The name of news.
 * @property {string} req.body.description - The description of news.
 * @returns {News}
 */
function update(req, res, next) {
  const { news } = req;
  news.title = req.body.title || news.title;
  news.description = req.body.description || news.description;
  news.save()
    .then(savedNews => res.json(savedNews))
    .catch(e => next(new APIError(e.message, httpStatus.CONFLICT, true)));
}

/**
 * Get news list.
 * @returns {News[]}
 */
function list(req, res, next) {
  News.list()
    .then(news => res.json(news))
    .catch(e => next(e));
}

/**
 * Delete news.
 * @returns {News}
 */
function remove(req, res, next) {
  const { news } = req;
  news.remove()
    .then(deletedNews => res.json(deletedNews))
    .catch(e => next(e));
}

module.exports = {
  load,
  get,
  create,
  update,
  list,
  remove,
};
