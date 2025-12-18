/**
 * Use this file for JavaScript code that you want to run in the front-end
 * on posts/pages that contain this block.
 *
 * When this file is defined as the value of the `viewScript` property
 * in `block.json` it will be enqueued on the front end of the site.
 *
 * Example:
 *
 * ```js
 * {
 *   "viewScript": "file:./view.js"
 * }
 * ```
 *
 * If you're not making any changes to this file because your project doesn't need any
 * JavaScript running in the front-end, then you should delete this file and remove
 * the `viewScript` property from `block.json`.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/#view-script
 */

/* eslint-disable no-console */
console.log( 'Hello World! (from create-block-advanced-search-block block)' );
/* eslint-enable no-console */


document.addEventListener('DOMContentLoaded', async () => {
	const block = document.querySelector('.wp-block-create-block-advanced-search-block');
	if (!block || block.dataset.asbInit === '1') return;

	block.dataset.asbInit = '1';


	const form = block.querySelector('.asb-form');
	const results = block.querySelector('.asb-results');
	const pagination = block.querySelector('.asb-pagination');

	const params = new URLSearchParams(window.location.search);

	// 初始化 keyword
	form.q.value = params.get('q') || '';

	// 加载分类
	const cats = await fetch('/wp-json/wp/v2/categories?per_page=100').then(r => r.json());
	// 加载标签（Tags）
	const tagBox = form.querySelector('.asb-tags');
	const tags = await fetch('/wp-json/wp/v2/tags?per_page=100').then(r => r.json());
	const selectedTags = params.getAll('tags[]');

	tags.forEach(tag => {
		const label = document.createElement('label');
		label.style.display = 'block';

		const checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.name = 'tags[]';
		checkbox.value = tag.id;

		if (selectedTags.includes(String(tag.id))) {
			checkbox.checked = true;
		}

		label.appendChild(checkbox);
		label.append(` ${tag.name}`);
		tagBox.appendChild(label);
	});


	const catSelect = form.cat;
	catSelect.innerHTML = `<option value="">All Categories</option>`;
	cats.forEach(c => {
		const opt = document.createElement('option');
		opt.value = c.id;
		opt.textContent = c.name;
		if (params.get('cat') == c.id) opt.selected = true;
		catSelect.appendChild(opt);
	});

	async function runSearch(page = 1) {
		const q = form.q.value;
		const cat = form.cat.value;

		const query = new URLSearchParams();

		const tagValues = Array.from(
			form.querySelectorAll('input[name="tags[]"]:checked')
		).map(el => el.value);


		if (q) query.set('q', q);
		if (cat) query.set('cat', cat);

		tagValues.forEach(tag => query.append('tags[]', tag));

		query.set('page', page);

		history.replaceState({}, '', `${location.pathname}?${query}`);

		const res = await fetch(`/wp-json/advanced-search/v1/posts?${query}`);
		const data = await res.json();

		results.innerHTML = data.posts.length
			? data.posts.map(p => `<p><a href="${p.link}">${p.title}</a></p>`).join('')
			: '<p>No results.</p>';

		const totalPages = Math.ceil(data.total / 5);
		pagination.innerHTML = '';

		if (totalPages <= 1) return;

		const maxAround = 2;

		function createBtn(label, targetPage, isActive = false, disabled = false) {
			const btn = document.createElement('button');
			btn.textContent = label;

			if (isActive) {
				btn.classList.add('is-active');
				btn.disabled = true;
			} else if (!disabled) {
				btn.onclick = () => runSearch(targetPage);
			} else {
				btn.disabled = true;
			}

			pagination.appendChild(btn);
		}

		// 上一页
		createBtn('«', page - 1, false, page === 1);

		// 起始省略
		if (page > maxAround + 2) {
			createBtn('1', 1);
			const dots = document.createElement('span');
			dots.textContent = '…';
			pagination.appendChild(dots);
		}

		// 中间窗口
		const start = Math.max(1, page - maxAround);
		const end = Math.min(totalPages, page + maxAround);

		for (let i = start; i <= end; i++) {
			createBtn(i, i, i === page);
		}

		// 结束省略
		if (page < totalPages - maxAround - 1) {
			const dots = document.createElement('span');
			dots.textContent = '…';
			pagination.appendChild(dots);
			createBtn(totalPages, totalPages);
		}

		// 下一页
		createBtn('»', page + 1, false, page === totalPages);

	}

	form.addEventListener('change', () => runSearch(1));

	runSearch(parseInt(params.get('page') || '1', 10));
});
