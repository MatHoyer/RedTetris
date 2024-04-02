import { useState } from 'react';

/**
 * Toggle hook
 *
 * @param {boolean} startingState
 * @returns {Object} - the toggle hook
 */
export const useToggle = (startingState) => {
    const [value, setValue] = useState(startingState);

    const setToggle = () => {
        setValue(!value);
    };

    return { toggle: value, setToggle: setToggle };
};
