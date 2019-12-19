import { useMutation, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import React, { createContext, useCallback, useContext } from 'react';

const LibraryContext = createContext();

const MediumFragment = gql`
  fragment MediumFragment on Medium {
    id
    title
    duration
    image
  }
`;

const LibraryQuery = gql`
  query Library {
    media {
      ...MediumFragment
    }
  }
  ${MediumFragment}
`;

const CreateMediumMutation = gql`
  mutation CreateMedium($title: String!, $file: Upload!, $image: Upload!) {
    createMedium(title: $title, file: $file, image: $image) {
      success
      message
      stack
      medium {
        ...MediumFragment
      }
    }
  }
  ${MediumFragment}
`;

const DeleteMediumMutation = gql`
  mutation DeleteMedium($id: ID!) {
    deleteMedium(id: $id) {
      success
      message
      stack
      medium {
        id
      }
    }
  }
`;

export function LibraryProvider({ children }) {
  const { loading, error, data } = useQuery(LibraryQuery);

  const [createMediumMutation] = useMutation(CreateMediumMutation, {
    update(
      cache,
      {
        data: {
          createMedium: { medium },
        },
      }
    ) {
      if (medium) {
        const data = cache.readQuery({ query: LibraryQuery });
        cache.writeQuery({
          query: LibraryQuery,
          data: { ...data, media: [...data.media, medium] },
        });
      }
    },
  });

  const [deleteMediumMutation] = useMutation(DeleteMediumMutation, {
    update(
      cache,
      {
        data: {
          deleteMedium: { medium },
        },
      }
    ) {
      if (medium) {
        const data = cache.readQuery({ query: LibraryQuery });
        cache.writeQuery({
          query: LibraryQuery,
          data: { ...data, media: data.media.filter((m) => m.id !== medium.id) },
        });
      }
    },
  });

  const createMedium = useCallback(
    async (data) => {
      const result = await createMediumMutation({ variables: data });
      return result.data.createMedium;
    },
    [createMediumMutation]
  );

  const deleteMedium = useCallback(
    async (id) => {
      const result = await deleteMediumMutation({ variables: { id } });
      return result.data.deleteMedium;
    },
    [deleteMediumMutation]
  );

  return <LibraryContext.Provider value={{ loading, error, data, createMedium, deleteMedium }}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  return useContext(LibraryContext);
}
