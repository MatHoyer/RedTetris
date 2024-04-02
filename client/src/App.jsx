import { Navbar } from './components/NavBar';
import { useHashNavigation } from './hooks/useHashNavigation';
import { Pages } from './pages/Pages';

const App = () => {
    const { page } = useHashNavigation();

    return (
        <div>
            <Navbar />
            <Pages page={page} />
        </div>
    );
};

export default App;
