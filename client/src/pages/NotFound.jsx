/**
 * Not found page
 *
 * @param {page} string - Wanted page
 * @returns {JSX.Element}
 */
export const NotFound = ({ page }) => {
    return (
        <>
            <h1>Page Introuvable</h1>
            <p>
                La page demandee: {page}, n'existe pas {':('}
            </p>
        </>
    );
};
