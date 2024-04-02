/**
 * Not found page
 *
 * @param {page} string - Wanted page
 * @returns {JSX.Element}
 */
export const NotFound = ({ page }) => {
    return (
        <>
            <h1>Page not found</h1>
            <p style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
                The page: '{page}' doesn't exist
            </p>
        </>
    );
};
