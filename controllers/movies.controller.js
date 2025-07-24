// backend/controllers/movies.controller.js
import MoviesDAO from '../dao/movies.dao.js';

export default class MoviesController {
  static async apiGetMovies(req, res, next) {
    try {
      const moviesPerPage = req.query.moviesPerPage
        ? parseInt(req.query.moviesPerPage, 10)
        : 20;
      const page = req.query.page
        ? parseInt(req.query.page, 10)
        : 0;

      const filters = {};
      if (req.query.title)   filters.title   = req.query.title;
      if (req.query.rated)   filters.rated   = req.query.rated;
      if (req.query.genres)  filters.genres  = req.query.genres;

      const { moviesList, totalNumMovies } = await MoviesDAO.getMovies({
        filters,
        page,
        moviesPerPage
      });

      res.json({
        movies:            moviesList,
        page,
        filters,
        entries_per_page:  moviesPerPage,
        total_results:     totalNumMovies
      });
    } catch (e) {
      console.error(`apiGetMovies failed: ${e}`);
      res.status(500).json({ error: e.toString() });
    }
  }

  static async apiGetMovieById(req, res, next) {
    try {
      const movie = await MoviesDAO.getMovieByID(req.params.id);
      if (!movie) return res.status(404).json({ error: 'Movie not found' });
      res.json(movie);
    } catch (e) {
      console.error(`apiGetMovieById failed: ${e}`);
      res.status(500).json({ error: e.toString() });
    }
  }

  static async apiGetRatings(req, res, next) {
    try {
      const ratings = await MoviesDAO.getRatings();
      res.json(ratings);
    } catch (e) {
      console.error(`apiGetRatings failed: ${e}`);
      res.status(500).json({ error: e.toString() });
    }
  }

  static async apiPostReview(req, res, next) {
    try {
      const movieId = req.params.id;
      const { name, text, date } = req.body;
      const result = await MoviesDAO.addReview(movieId, name, text, date);
      res.json(result);
    } catch (e) {
      console.error(`apiPostReview failed: ${e}`);
      res.status(500).json({ error: e.toString() });
    }
  }

  static async apiUpdateReview(req, res, next) {
    try {
      const { reviewId, name, text, date } = req.body;
      const result = await MoviesDAO.updateReview(reviewId, name, text, date);
      res.json(result);
    } catch (e) {
      console.error(`apiUpdateReview failed: ${e}`);
      res.status(500).json({ error: e.toString() });
    }
  }

  static async apiDeleteReview(req, res, next) {
    try {
      const { reviewId } = req.body;
      const result = await MoviesDAO.deleteReview(reviewId);
      res.json(result);
    } catch (e) {
      console.error(`apiDeleteReview failed: ${e}`);
      res.status(500).json({ error: e.toString() });
    }
  }
}
