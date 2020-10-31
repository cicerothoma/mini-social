const Post = require('./../models/postModel');

class APIFeatures {
  constructor(userQuery, mongooseQuery = Post.find()) {
    this.mongooseQuery = mongooseQuery;
    this.userQuery = userQuery;
  }
  filter() {
    const queryObj = { ...this.userQuery };
    const excludedFields = ['page', 'sort', 'fields', 'limit'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1b) Advanced Filtering
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lt|lte|eq)\b/g,
      (matchedWord) => `$${matchedWord}`
    );
    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryString));
    return this;
  }

  sort() {
    if (this.userQuery.sort) {
      const sortBy = this.userQuery.sort.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort({ createdAt: 'desc' });
    }
    return this;
  }

  limitFields() {
    if (this.userQuery.fields) {
      const fields = this.userQuery.fields.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select('-__v');
    }
    return this;
  }

  paginate() {
    const limit = +this.userQuery.limit || 100;
    const page = +this.userQuery.page || 1;
    const skip = limit * (page - 1);
    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
