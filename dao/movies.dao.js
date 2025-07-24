// backend/dao/movies.dao.js
import { ObjectId } from 'mongodb';

let moviesColl;
let commentsColl;

export default class MoviesDAO {
  static async injectDB(client) {
    if (moviesColl && commentsColl) return;
    try {
      const db = client.db('sample_mflix');
      moviesColl   = db.collection('movies');
      commentsColl = db.collection('comments');
    } catch (e) {
      console.error(`Unable to establish collection handles: ${e}`);
    }
  }

  static async getMovies({ filters = {}, page = 0, moviesPerPage = 20 } = {}) {
    let query = {};
    if (filters.title) {
      query = { $text: { $search: filters.title } };
    } else if (filters.rated) {
      query = { rated: filters.rated };
    } else if (filters.genres) {
      query = { genres: { $in: [filters.genres] } };
    }

    const cursor = moviesColl.find(query)
      .skip(page * moviesPerPage)
      .limit(moviesPerPage);

    const moviesList    = await cursor.toArray();
    const totalNumMovies = await moviesColl.countDocuments(query);

    return { moviesList, totalNumMovies };
  }

  static async getMovieByID(id) {
    try {
      const pipeline = [
        { $match: { _id: new ObjectId(id) } },
        {
          $lookup: {
            from: 'comments',
            let: { id: '$_id' },
            pipeline: [
              { $match: { $expr: { $eq: ['$movie_id', '$$id'] } } },
              { $sort: { date: -1 } }
            ],
            as: 'reviews'
          }
        }
      ];
      return await moviesColl.aggregate(pipeline).next();
    } catch (e) {
      console.error(`getMovieByID error: ${e}`);
      return null;
    }
  }

  static async getRatings() {
    try {
      return await moviesColl.distinct('rated');
    } catch (e) {
      console.error(`getRatings error: ${e}`);
      return [];
    }
  }

  // ←–– Make sure these three methods exist exactly as shown

  /** insert a new comment document */
  static async addReview(movieId, name, text, date) {
    try {
      const reviewDoc = {
        movie_id: new ObjectId(movieId),
        name,
        text,
        date: new Date(date),
      };
      return await commentsColl.insertOne(reviewDoc);
    } catch (e) {
      console.error(`addReview error: ${e}`);
      return { error: e };
    }
  }

  /** update an existing comment by its _id */
  static async updateReview(reviewId, name, text, date) {
    try {
      const updateDoc = {
        $set: { name, text, date: new Date(date) }
      };
      return await commentsColl.updateOne(
        { _id: new ObjectId(reviewId) },
        updateDoc
      );
    } catch (e) {
      console.error(`updateReview error: ${e}`);
      return { error: e };
    }
  }

  /** delete a comment by its _id */
  static async deleteReview(reviewId) {
    try {
      return await commentsColl.deleteOne({ _id: new ObjectId(reviewId) });
    } catch (e) {
      console.error(`deleteReview error: ${e}`);
      return { error: e };
    }
  }
}
