import PropTypes from "prop-types";

function Select({ options, value, setValue }) {
    return (
        <select className="h-full border" value={value} onChange={(e) => setValue(e.target.value)}>
        <option value="">-- Chọn --</option>
            {options && Array.from(options)?.map((option,index) => (
                <option key={index} value={option.name}>
                    {option.name}
                </option>
            ))}
        </select>
    );
}

Select.propTypes = {
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
};


export default Select;
