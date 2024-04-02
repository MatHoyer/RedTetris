import { Navbar } from './components/NavBar';
import { useHashNavigation } from './hooks/useHashNavigation';
import { Pages } from './pages/Pages';

const App = () => {
    const { page } = useHashNavigation();

    return (
        <div>
            <Navbar />
            <div style={{ height: 'calc(100vh - 65px)' }}>
                <Pages page={page} />
            </div>
        </div>
    );
};

export default App;
