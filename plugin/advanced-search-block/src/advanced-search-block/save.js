import { useBlockProps } from '@wordpress/block-editor';

export default function save() {
	return (
		<div {...useBlockProps.save()}>
			<form className="asb-form">
				<div className="asb-field">
					<label>Keyword</label>
					<input type="text" name="q" />
				</div>

				<div className="asb-field">
					<label>Category</label>
					<select name="cat"></select>
				</div>

				<div className="asb-field">
					<label>Tags</label>
					<div className="asb-tags"></div>
				</div>
			</form>

			<div className="asb-results"></div>
			<div className="asb-pagination"></div>
		</div>
	);
}
