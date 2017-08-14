const randomstring = require("randomstring");
const Promise = require('bluebird');
const models = require('../models');

module.exports = (model, field, createPromise, logging) => {
  if (typeof model === 'string') {
    model = models[model];
  }

  let idDuplicateError = new Error('Identifier in use.');
  let length = model.attributes[field].type._length;

  let checkPromise = (id, transaction) => {
    let whereConditions = {};
    whereConditions[field] = { $eq: id };

    var options = {};
    if (!logging) {
      options.logging = false;
    }
    options.where = whereConditions;
    options.transaction = transaction;

    return model.findOne(options)
      .then((result) => {
        if (result) {
          throw idDuplicateError;
        }
        return Promise.resolve();
      });
  };

  let generateAndCheckPromise = () => {
    let identifier = randomstring.generate(length);

    var options = {};
    if (!logging) {
      options.logging = false;
    }
    return models.sequelize
      .transaction(options, (t) => {
        return checkPromise(identifier, t)
          .then(() => {
            return createPromise(identifier, t);
          })
          .catch((err) => {
            if (err !== idDuplicateError) {
              throw err;
            }
            return generateAndCheckPromise();
          });
      });
  };

  return generateAndCheckPromise();
};
