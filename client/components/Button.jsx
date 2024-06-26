/**
 * Button works like an html button
 *
 * @param {}
 * @returns {JSX.Element}
 */
export const Button = ({ ...props }) => {
    return <button className="btn" {...props}></button>;
};
