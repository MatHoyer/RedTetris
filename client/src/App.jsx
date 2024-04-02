import { Navbar } from './components/NavBar';
import { Pages } from './pages/Pages';

const App = () => {
    return (
        <div>
            <Navbar />
            <div style={{ height: 'calc(100vh - 65px)' }}>
                <Pages />
            </div>
        </div>
    );
};

export default App;
