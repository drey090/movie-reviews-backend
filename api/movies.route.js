// backend/api/movies.route.js
import express from 'express';
import MoviesController from '../controllers/movies.controller.js';

const router = express.Router();

// 1) list & paginate
router
  .route('/')
  .get(MoviesController.apiGetMovies);

// 2) distinct ratings
router
  .route('/ratings')
  .get(MoviesController.apiGetRatings);

// 3) single‐movie + its reviews
router
  .route('/:id')
  .get(MoviesController.apiGetMovieById);

// 4) post a new review to a movie
router
  .route('/:id/reviews')
  .post(MoviesController.apiPostReview);

// 5) update or delete existing reviews
router
  .route('/reviews')
  .put(MoviesController.apiUpdateReview)
  .delete(MoviesController.apiDeleteReview);

export default router;
