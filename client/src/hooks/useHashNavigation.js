import { useEffect, useState } from 'react';

/**
 *
 * @returns {Object}
 */
export const useHashNavigation = () => {
    const [hash, setHash] = useState(location.hash);

    useEffect(() => {
        const handleHashChange = () => {
            setHash(location.hash);
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, [hash]);

    const cleanedHash = hash.replace('#', '').toLowerCase() || 'home';
    const splittedHash = cleanedHash.split('[');

    return { page: splittedHash[0], param: splittedHash[1] || '' };
};
