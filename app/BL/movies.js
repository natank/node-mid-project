
import * as Movie from '../models/Movie';

export async function getMovies(req, res, next) {
  
  
	try {
		const movies = await Movie.find({});
		res.render('./movies', {
			movies,
		});
	} catch (err) {
    next(err);
	}
};

export async function getMovie(req, res, next) {
	try {
		const movie = await Movie.findById(req.params.id);

		res.render('./movie', {	movie	});
	} catch (err) {
		next(err);
	}
};



export async function postSearchMovies(req, res, next)  {
	const prodId = req.body.productId;
	let user = await req.user
		.populate({
			path: 'cart.item.product',
		})
		.execPopulate();

	user.cart = user.cart.filter(item => {
		let leaveInCart = item.product.toString() !== prodId;
		return leaveInCart;
	});
	try {
		await user.save();
		res.redirect('/cart');
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
};

export async function getCreateMovie(req, res, next) {
  try {
    res.render('movieForm', {
      renderAs: 'new',
    });
  } catch (err) {
    next(err);
  }
};

export async function postCreateMovie(req, res, next) {
  const { name, language, genre } = req.body;
  try{

    await Movie.createMovie({name, language, genre})
    res.render('./menu')
  } catch(err){
    next(err)
  }
  
};


