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

    // LOGGING: Show what is being received
    console.log("DAO received filters:", filters);

    if (filters.title) {
      // Case-insensitive, partial match search
      query = { 
        title: { 
          $regex: filters.title, 
          $options: 'i'
        } 
      };
    } else if (filters.rated) {
      query = { rated: filters.rated };
    } else if (filters.genres) {
      query = { genres: { $in: [filters.genres] } };
    }

    // LOGGING: Show the constructed Mongo query
    console.log("MongoDB query:", query);

    try {
      const cursor = moviesColl.find(query)
        .sort({ title: 1 })
        .skip(page * moviesPerPage)
        .limit(moviesPerPage);

      const moviesList = await cursor.toArray();
      const totalNumMovies = await moviesColl.countDocuments(query);

      return { moviesList, totalNumMovies };
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`);
      return { moviesList: [], totalNumMovies: 0 };
    }
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

  static async deleteReview(reviewId) {
    try {
      return await commentsColl.deleteOne({ _id: new ObjectId(reviewId) });
    } catch (e) {
      console.error(`deleteReview error: ${e}`);
      return { error: e };
    }
  }
}
