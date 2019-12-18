import React, { createContext, useContext } from 'react';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

const LibraryContext = createContext();

export function LibraryProvider({ children }) {
  const { loading, error, data } = useQuery(gql`
    query Library {
      media {
        id
        title
        artist
        duration
        image
      }
    }
  `);

  return <LibraryContext.Provider value={{ loading, error, data }}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  return useContext(LibraryContext);
}
