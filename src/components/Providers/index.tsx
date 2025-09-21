import React from 'react';
import { useMantineColorScheme } from '@mantine/core';
import { Loader } from '@/components';
import { useSongLoader } from '@/components/CustomHooks';
import { usePWA } from '@/hooks/usePWA';
import { ACTIONTYPE, MainContextProvider, pages, State } from '@/utils/context';

type PropsT = {
  children: React.ReactNode;
};

const initialAppState = {
  title: '',
  subtitle: '',
  width: document.body.getBoundingClientRect().width,
  colorScheme: 'auto' as const,
};

function reducer(state: State, action: ACTIONTYPE): State {
  switch (action.type) {
    case 'setTitle':
      return { ...state, title: action.payload };
    case 'setSubtitle':
      return { ...state, subtitle: action.payload };
    case 'setWidth':
      return { ...state, width: action.payload };
    case 'setColorScheme':
      return { ...state, colorScheme: action.payload };
    default:
      return state;
  }
}

function MainContext({ children }: PropsT) {
  const { songs, favourites, setFavourites } = useSongLoader();
  const [state, dispatch] = React.useReducer(reducer, initialAppState);
  const { colorScheme } = useMantineColorScheme();
  
  // Initialize PWA functionality
  usePWA();

  // Sync color scheme with context
  React.useEffect(() => {
    dispatch({ type: 'setColorScheme', payload: colorScheme });
  }, [colorScheme]);

  if (songs.length === 0) 
    {return <Loader />;}
  

  return (
    <MainContextProvider value={{ meta: state, songs, favourites, setFavourites, dispatch, pages }}>
      {children}
    </MainContextProvider>
  );
}

export default MainContext;
