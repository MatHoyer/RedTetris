import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown, faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

const Key = ({ element, text }) => {
    return (
        <tr style={{ height: '50px' }}>
            <td style={{ paddingRight: '10px' }}>
                <FontAwesomeIcon className="icon" icon={element} />
            </td>
            <td>{text}</td>
        </tr>
    );
};

export const Settings = () => {
    return (
        <>
            <h1 style={{ marginBottom: '10px' }}>Settings</h1>
            <div style={{ display: 'grid', placeItems: 'center', height: '30vh' }}>
                <table>
                    <tbody>
                        <Key element={faArrowUp} text="Rotate" />
                        <Key element={faArrowDown} text="Move down" />
                        <Key element={faArrowLeft} text="Move left" />
                        <Key element={faArrowRight} text="Move right" />
                    </tbody>
                </table>
            </div>
        </>
    );
};
