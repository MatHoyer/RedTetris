/**
 *
 * @param {string} id
 * @param {Function} handleChange
 * @param {string} label
 * @returns {JSX.Element}
 */
export const InputCheckbox = ({ id, handleChange, label }) => {
    return (
        <label htmlFor={id} style={{ color: 'white', textAlign: 'center' }}>
            <input type="checkbox" id={id} defaultChecked onChange={handleChange} style={{ marginRight: '10px' }} />
            {label}
        </label>
    );
};

/**
 *
 * @param {string} id
 * @param {Function} handleChange
 * @param {string} label
 * @param {number} defaultValue
 * @param {number} min
 * @param {number} max
 * @returns {JSX.Element}
 */
export const InputRange = ({ id, handleChange, label, defaultValue, min, max, ...rest }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label htmlFor={id}>{label}</label>
            <input
                type="range"
                id={id}
                className="form-control"
                min={min}
                max={max}
                defaultValue={defaultValue}
                onChange={handleChange}
                {...rest}
            />
        </div>
    );
};

/**
 *
 * @param {string} id
 * @param {Function} handleChange
 * @returns {JSX.Element}
 */
export const InputText = ({ id, handleChange, label, ...rest }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label htmlFor={id}>{label}</label>
            <input
                type="text"
                id={id}
                onChange={handleChange}
                style={{
                    padding: '5px',
                    borderRadius: '5px',
                    border: 'none',
                    backgroundColor: '#333',
                    color: 'white',
                }}
                {...rest}
            />
        </div>
    );
};
