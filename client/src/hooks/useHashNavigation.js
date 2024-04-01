import { useEffect, useState } from 'react';

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
    });

    const cleanedHash = hash.replace('#', '').toLowerCase() || 'home';

    return { page: cleanedHash };
};
