import axios from 'axios';

document.addEventListener('DOMContentLoaded', event => {
	let select = document.querySelector('.submit-on-toggle');
	select &&
		select.addEventListener('change', event => {
			let form = event.target.closest('form');
			form.submit();
		});

	document
		.querySelectorAll('.bi-heart')
		.forEach(elem => elem.addEventListener('click', product.wishlistProduct));
	document
		.querySelectorAll('.bi-heart-fill')
		.forEach(elem =>
			elem.addEventListener('click', product.un_wishlistProduct)
		);
});

let product = (function () {
	return {
		wishlistProduct: async function () {
			const card = event.target.closest('.card');
			const heart = card.querySelector('.bi-heart');
			const id = card.getAttribute('data-id');
			const heartFill = card.querySelector('.bi-heart-fill');
			const csrf = card.getAttribute('data-csrf');

			let response = await axios({
				method: 'post',
				url: `/shop/wishlist`,
				data: {
					prodId: id,
					_csrf: csrf,
				},
			});
			switch (response.status) {
				case 200:
					heart.style.visibility = 'hidden';
					heartFill.style.visibility = 'visible';
					break;
				case 404:
					break;
				default:
					break;
			}
			//alert(`product ${id} wishlisted`)
		},
		un_wishlistProduct: async function () {
			const card = event.target.closest('.card');
			const heartFill = card.querySelector('.bi-heart-fill');
			const heart = card.querySelector('.bi-heart');
			const id = card.getAttribute('data-id');
			const csrf = card.getAttribute('data-csrf');

			let response = await axios({
				method: 'delete',
				url: `/shop/wishlist`,
				data: {
					prodId: id,
					_csrf: csrf,
				},
			});
			switch (response.status) {
				case 200:
					heartFill.style.visibility = 'hidden';
					heart.style.visibility = 'visible';
				case 404:
					break;
				default:
					break;
			}
		},
	};
})();

export const wishlistProduct = product.wishlistProduct;
