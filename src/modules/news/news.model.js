const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../../helpers/APIError');

/**
 * News Schema
 */
const NewsSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * - pre-post-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
NewsSchema.method({});

/**
 * Statics
 */
NewsSchema.statics = {
  /**
   * Get news
   * @param {ObjectId} id - The objectId of news.
   * @returns {Promise<News, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate('owner')
      .exec()
      .then((news) => {
        if (news) {
          return news;
        }
        const err = new APIError('No such news exists!', httpStatus.NOT_FOUND, true);
        return Promise.reject(err);
      });
  },

  /**
   * List news and populate owner details to wich the news belongs to.
   * @returns {Promise<News[]>}
   */
  list() {
    return this.find()
      .populate('owner')
      .exec();
  },

  /**
   * List news in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of news to be skipped.
   * @param {number} limit - Limit number of news to be returned.
   * @returns {Promise<News[]>}
   */
  listLazy({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('owner')
      .exec();
  },
};

/**
 * @typedef News
 */
module.exports = mongoose.model('News', NewsSchema);
