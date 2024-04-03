import { Button } from '../components/Button';
import data from '../../public/MOCK_DATA.json';
import { useState } from 'react';
import { useToggle } from '../hooks/useToggle';

const TabLine = ({ name, nbPlayers, status }) => {
    return (
        <tr>
            <td>{name}</td>
            <td>{nbPlayers}</td>
            <td>{status ? 'in game' : 'waiting...'}</td>
            <td>
                <Button>Join</Button>
            </td>
        </tr>
    );
};

export const Online = () => {
    const { toggle: showInGame, setToggle: toggleShowInGame } = useToggle(true);
    const [research, setResearch] = useState('');

    const filteredData = data.filter((cell) => {
        if (research && !cell.name.toLowerCase().includes(research.toLowerCase())) return false;
        if (showInGame && cell.status) return false;
        return true;
    });

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label htmlFor="inGame" style={{ color: 'white', textAlign: 'center' }}>
                    <input
                        type="checkbox"
                        id="inGame"
                        defaultChecked
                        onChange={toggleShowInGame}
                        style={{ marginRight: '10px' }}
                    />
                    Hide games currently playing
                </label>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '10px',
                    }}
                >
                    <label htmlFor="research" style={{ color: 'white' }}>
                        Research:
                    </label>
                    <input
                        type="text"
                        id="research"
                        value={research}
                        onChange={(e) => setResearch(e.target.value)}
                        style={{
                            padding: '5px',
                            borderRadius: '5px',
                            border: 'none',
                            backgroundColor: '#333',
                            color: 'white',
                        }}
                    />
                </div>
            </div>
            <div className="scrollable-div" style={{ maxHeight: '65%', overflowY: 'auto' }}>
                <table className="centered-table">
                    <thead style={{ position: 'sticky', top: '0px', zIndex: 3 }}>
                        <tr>
                            <th style={{ width: '20%' }}>Nom</th>
                            <th style={{ width: '20%' }}>Nb Players</th>
                            <th style={{ width: '20%' }}>Status</th>
                            <th style={{ width: '20%' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {!!filteredData.length ? (
                            filteredData.map((cell, _, tab) => (
                                <TabLine
                                    key={cell.name}
                                    name={cell.name}
                                    nbPlayers={cell.nbPlayers}
                                    status={cell.status}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4">No games found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignContent: 'center', marginBottom: '20px' }}>
                <Button onClick={() => (location.hash = '#create-game')}>Create Game</Button>
            </div>
        </>
    );
};
