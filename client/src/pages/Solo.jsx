import { Button } from '../components/Button';
import { Text } from '../components/Text';

export const Solo = () => {
    return (
        <>
            <div>
                <Text>test</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
                <Button className="btn">Play</Button>
            </div>
        </>
    );
};
