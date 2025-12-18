/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

/**
 * Styles
 */
import './editor.scss';

export default function Edit() {
	const blockProps = useBlockProps();

	// 从 URL 初始化参数（刷新不丢）
	const urlParams = new URLSearchParams(window.location.search);

	const [keyword, setKeyword] = useState(urlParams.get('q') || '');
	const [category, setCategory] = useState(urlParams.get('cat') || '');
	const [categories, setCategories] = useState([]);

	const [tags, setTags] = useState([]);
	const [selectedTags, setSelectedTags] = useState(
		urlParams.getAll('tags[]') || []
	);

	/**
	 * 获取分类
	 */
	useEffect(() => {
		apiFetch({ path: '/wp/v2/categories?per_page=100' }).then(
			(data) => setCategories(data)
		);
	}, []);

	/**
	 * 获取标签
	 */
	useEffect(() => {
		apiFetch({ path: '/wp/v2/tags?per_page=100' }).then(
			(data) => setTags(data)
		);
	}, []);

	/**
	 * 表单状态 → URL 同步
	 */
	useEffect(() => {
		const params = new URLSearchParams();

		if (keyword) params.set('q', keyword);
		if (category) params.set('cat', category);

		selectedTags.forEach((tag) => {
			params.append('tags[]', tag);
		});

		const newUrl =
			window.location.pathname +
			(params.toString() ? `?${params.toString()}` : '');

		window.history.replaceState({}, '', newUrl);
	}, [keyword, category, selectedTags]);

	return (
		<div { ...blockProps }>
			<div className="asb-field">
				<label>{ __( 'Keyword', 'advanced-search-block' ) }</label>
				<input
					type="text"
					value={ keyword }
					onChange={ ( e ) => setKeyword( e.target.value ) }
					placeholder={ __( 'Search keyword…', 'advanced-search-block' ) }
				/>
			</div>

			<div className="asb-field">
				<label>{ __( 'Category', 'advanced-search-block' ) }</label>
				<select
					value={ category }
					onChange={ ( e ) => setCategory( e.target.value ) }
				>
					<option value="">
						{ __( 'All Categories', 'advanced-search-block' ) }
					</option>
					{ categories.map( ( cat ) => (
						<option key={ cat.id } value={ cat.id }>
							{ cat.name }
						</option>
					) ) }
				</select>
			</div>

			<div className="asb-field">
				<label>{ __( 'Tags', 'advanced-search-block' ) }</label>

				<div className="asb-tags">
					{ tags.map( ( tag ) => {
						const checked = selectedTags.includes( String( tag.id ) );

						return (
							<label key={ tag.id } className="asb-tag">
								<input
									type="checkbox"
									value={ tag.id }
									checked={ checked }
									onChange={ ( e ) => {
										if ( e.target.checked ) {
											setSelectedTags( [
												...selectedTags,
												String( tag.id ),
											] );
										} else {
											setSelectedTags(
												selectedTags.filter(
													( t ) => t !== String( tag.id )
												)
											);
										}
									} }
								/>
								<span>{ tag.name }</span>
							</label>
						);
					} ) }
				</div>
			</div>
		</div>
	);
}
