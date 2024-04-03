import { useState } from 'react';
import { Navbar } from './components/NavBar';
import { Pages } from './pages/Pages';

const App = () => {
    const [registered, setRegistered] = useState(false);
    return (
        <div>
            <Navbar />
            <div style={{ height: 'calc(100vh - 65px)' }}>
                <Pages registered={registered} setRegistered={setRegistered} />
            </div>
        </div>
    );
};

export default App;
