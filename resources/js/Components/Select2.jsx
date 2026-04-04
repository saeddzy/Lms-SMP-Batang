import React from 'react';
import ReactSelect from 'react-select';

export default function Select2({ options = [], defaultOptions = [], onChange, placeholder = 'Select...', isMulti = true }) {
	return (
		<ReactSelect
			isMulti={isMulti}
			name="roles"
			options={options}
			defaultValue={defaultOptions}
			onChange={onChange}
			placeholder={placeholder}
			classNamePrefix="select"
		/>
	);
}
