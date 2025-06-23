import {
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faArrowUp,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Key: React.FC<{ element: IconDefinition; text: string }> = ({ element, text }) => {
  return (
    <tr style={{ height: '50px' }}>
      <td style={{ paddingRight: '10px' }}>
        <FontAwesomeIcon className="icon" icon={element} />
      </td>
      <td style={{ userSelect: 'none' }}>{text}</td>
    </tr>
  );
};

export const Settings = () => {
  return (
    <div>
      <h1 style={{ marginBottom: '10px' }}>Settings</h1>
      <div style={{ display: 'grid', placeItems: 'center', height: '30px' }}>
        <table>
          <tbody>
            <Key element={faArrowUp} text="Rotate" />
            <Key element={faArrowDown} text="Move down" />
            <Key element={faArrowLeft} text="Move left" />
            <Key element={faArrowRight} text="Move right" />
          </tbody>
        </table>
      </div>
    </div>
  );
};
