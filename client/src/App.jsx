import { useHashNavigation } from './hooks/useHashNavigation';
import { Pages } from './pages/Pages';

const App = () => {
    const { page } = useHashNavigation();

    return (
        <div>
            <div className={'header'}>TETRIS</div>
            <Pages page={page} />
        </div>
    );
};

export default App;
