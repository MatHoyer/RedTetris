import { useState } from 'react';
import { Button } from '../components/Button';

export const CreateGame = () => {
    const [data, setData] = useState({ name: '', number: 2 });

    const handleChange = (event) => {
        setData({ ...data, [event.target.id]: event.target.value });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
    };

    return (
        <div>
            <form className="form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Name of the game: </label>
                    <input type="text" id="name" className="form-control" onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="number">Max number of players: {data.number} </label>
                    <input
                        type="range"
                        id="number"
                        className="form-control"
                        defaultValue={data.number}
                        min={2}
                        max={10}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <Button disabled={data.name === ''} style={{ display: 'block', width: '100%' }} type="submit">
                        Create
                    </Button>
                </div>
            </form>
        </div>
    );
};
