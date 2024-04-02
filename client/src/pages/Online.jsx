import { Button } from '../components/Button';
import data from '../../public/MOCK_DATA.json';

const TabLine = ({ name, nbPlayers, status }) => {
    console.log(name, nbPlayers, status);
    return (
        <>
            <tr>
                <td>{name}</td>
                <td>{nbPlayers}</td>
                <td>{status ? 'in game' : 'waiting...'}</td>
                <td>
                    <Button className="btn">Join</Button>
                </td>
            </tr>
        </>
    );
};

export const Online = () => {
    const PartyData = data;

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'center', alignContent: 'center', marginBottom: '20px' }}>
                <Button className="btn" onClick={() => (location.hash = '#create-game')}>
                    Create Game
                </Button>
            </div>
            <div className="scrollable-div" style={{ maxHeight: '65%', overflowY: 'auto' }}>
                <table className="centered-table">
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Nb Players</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((cell) => (
                            <TabLine name={cell.name} nbPlayers={cell.nbPlayers} status={cell.status} />
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};
