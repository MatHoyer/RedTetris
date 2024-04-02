const NavLink = ({ ...props }) => {
    return <a className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-white mr-4" {...props}></a>;
};

/**
 * Create a navigation bar
 *
 * @returns {JSX.Element}
 */
export const Navbar = () => {
    return (
        <nav>
            <a href="#home">
                <img src="RedTetris-logo.png" alt="logo" style={{ width: '100px', margin: '10px' }} />
            </a>
        </nav>
    );
};
