
import Movie from ('../models/Movie');

export async function getMovies(req, res, next) {
	try {
		const movies = await Movie.find({}, 'title');
		res.render('./movies', {
			allMovies: movies,
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



export async function postSearchMovies(req, res, next) => {
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
    res.render('createMovie', {
      renderAs: 'new',
    });
  } catch (err) {
    next(err);
  }
};

export async function postCreate(req, res, next) {
  const errors = validationResult(req);
  const { title, price, description, imageUrl, printableUrl, topic } = req.body;
  if (errors.isEmpty()) {
    await createTheProduct();
  } else {
    showErrors();
  }
  async function createTheProduct() {
    try {
      let product = await Product.create({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        printableUrl: printableUrl,
        topic: topic,
        createdBy: req.user._id
      });
      res.redirect('/admin/products');
    } catch (err) {
      next(err);
    }
  }

  async function showErrors() {
    let topics = await Topic.find({}, 'title');
    const validationErrors = errors.array().reduce((errorObj, error) => {
      let { param } = error;
      // if field contains more than one validation error - show only the first
      if (!errorObj[param]) errorObj[param] = error.msg;
      return errorObj;
    }, {});
    res.status(422).render('admin/createProduct', {
      renderAs: 'errors',
      topics: topics,
      product: { title, price, description, topic },
      validationErrors,
      page: 'admin'
    });
  }
};


