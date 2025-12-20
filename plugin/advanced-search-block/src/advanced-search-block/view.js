/**
 * Front-end script for Advanced Search Block
 */

document.addEventListener('DOMContentLoaded', () => {
	document
		.querySelectorAll('.wp-block-create-block-advanced-search-block')
		.forEach(initAdvancedSearchBlock);
});

function initAdvancedSearchBlock(block) {
	// 防止重复初始化
	if (block.dataset.asbInit === '1') return;
	block.dataset.asbInit = '1';

	const form = block.querySelector('.asb-form');
	const results = block.querySelector('.asb-results');
	const pagination = block.querySelector('.asb-pagination');

	if (!form || !results || !pagination) return;

	// URL 是唯一真相源
	const params = new URLSearchParams(window.location.search);
	const initPage = parseInt(params.get('page') || '1', 10);
	const initTags = params.getAll('tags[]');

	// 初始化 keyword
	if (form.q) {
		form.q.value = params.get('q') || '';
	}

	/**
	 * 加载分类
	 */
	fetch('/wp-json/wp/v2/categories?per_page=100')
		.then((r) => r.json())
		.then((cats) => {
			const catSelect = form.cat;
			if (!catSelect) return;

			catSelect.innerHTML = `<option value="">All Categories</option>`;
			cats.forEach((c) => {
				const opt = document.createElement('option');
				opt.value = c.id;
				opt.textContent = c.name;
				if (params.get('cat') == c.id) opt.selected = true;
				catSelect.appendChild(opt);
			});
		});

	/**
	 * 加载标签
	 */
	fetch('/wp-json/wp/v2/tags?per_page=100')
		.then((r) => r.json())
		.then((tags) => {
			const tagBox = form.querySelector('.asb-tags');
			if (!tagBox) return;

			tagBox.innerHTML = '';

			tags.forEach((tag) => {
				const label = document.createElement('label');
				label.className = 'asb-tag';

				const checkbox = document.createElement('input');
				checkbox.type = 'checkbox';
				checkbox.name = 'tags[]';
				checkbox.value = String(tag.id);

				// 从 URL 还原状态
				if (initTags.includes(String(tag.id))) {
					checkbox.checked = true;
				}

				label.appendChild(checkbox);
				label.append(` ${tag.name}`);
				tagBox.appendChild(label);
			});
		});

	/**
	 * 执行搜索
	 */
	async function runSearch(page = 1) {
		const query = new URLSearchParams();

		if (form.q && form.q.value) {
			query.set('q', form.q.value);
		}

		if (form.cat && form.cat.value) {
			query.set('cat', form.cat.value);
		}

		const tagValues = Array.from(
			form.querySelectorAll('input[name="tags[]"]:checked')
		).map((el) => el.value);

		tagValues.forEach((tag) => query.append('tags[]', tag));

		query.set('page', page);

		// 同步 URL（可刷新 / 可分享）
		history.replaceState({}, '', `${location.pathname}?${query.toString()}`);

		const res = await fetch(`/wp-json/advanced-search/v1/posts?${query}`);
		const data = await res.json();

		results.innerHTML = data.posts.length
			? data.posts
					.map(
						(p) =>
							`<p><a href="${p.link}">${p.title}</a></p>`
					)
					.join('')
			: '<p>No results.</p>';

		renderPagination(page, Math.ceil(data.total / 5));
	}

	/**
	 * 渲染分页（不会重复）
	 */
	function renderPagination(current, total) {
		pagination.innerHTML = '';
		if (total <= 1) return;

		const maxAround = 2;

		const createBtn = (label, page, active = false, disabled = false) => {
			const btn = document.createElement('button');
			btn.textContent = label;

			if (active) {
				btn.classList.add('is-active');
				btn.disabled = true;
			} else if (!disabled) {
				btn.addEventListener('click', () => runSearch(page));
			} else {
				btn.disabled = true;
			}

			pagination.appendChild(btn);
		};

		createBtn('«', current - 1, false, current === 1);

		if (current > maxAround + 2) {
			createBtn('1', 1);
			pagination.appendChild(document.createTextNode(' … '));
		}

		const start = Math.max(1, current - maxAround);
		const end = Math.min(total, current + maxAround);

		for (let i = start; i <= end; i++) {
			createBtn(i, i, i === current);
		}

		if (current < total - maxAround - 1) {
			pagination.appendChild(document.createTextNode(' … '));
			createBtn(total, total);
		}

		createBtn('»', current + 1, false, current === total);
	}

	// 表单变化 → 重新搜索
	form.addEventListener('change', () => runSearch(1));

	// 初始化执行一次（URL 驱动）
	runSearch(initPage);
}
