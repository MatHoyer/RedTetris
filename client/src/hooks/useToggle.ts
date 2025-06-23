import { useState } from 'react';

export const useToggle = (startingState: boolean) => {
  const [value, setValue] = useState(startingState);

  const setToggle = () => {
    setValue(!value);
  };

  return { toggle: value, setToggle: setToggle };
};
