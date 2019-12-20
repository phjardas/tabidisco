import { useMutation, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import React, { createContext, useCallback, useContext, useEffect } from 'react';

const LibraryContext = createContext();

const MediumFragment = gql`
  fragment MediumFragment on Medium {
    id
    title
    duration
    image
    playCount
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

const MediaSubscription = gql`
  subscription Media {
    media {
      type
      medium {
        ...MediumFragment
      }
    }
  }
  ${MediumFragment}
`;

export function LibraryProvider({ children }) {
  const { loading, error, data, subscribeToMore } = useQuery(LibraryQuery);

  useEffect(() => {
    if (subscribeToMore) {
      subscribeToMore({
        document: MediaSubscription,
        updateQuery(
          previous,
          {
            subscriptionData: {
              data: {
                media: { type, medium },
              },
            },
          }
        ) {
          if (type === 'created') {
            return { ...previous, media: [...previous.media, medium] };
          }

          if (type === 'deleted') {
            return { ...previous, media: previous.media.filter((m) => m.id !== medium.id) };
          }

          return previous;
        },
      });
    }
  }, [subscribeToMore]);

  const [createMediumMutation] = useMutation(CreateMediumMutation);
  const createMedium = useCallback(
    async (data) => {
      const result = await createMediumMutation({ variables: data });
      return result.data.createMedium;
    },
    [createMediumMutation]
  );

  const [deleteMediumMutation] = useMutation(DeleteMediumMutation);
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
