import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';

import { getDiscoverMovies } from '../modules/APIRequest';

const useMovies = () => {
  const getUpcomingMovies = useCallback(async () => {
    const result = await getDiscoverMovies({
      releaseDateGte: moment().format('YYYY-MM-DD'),
      releaseDateLte: moment().add(1, 'years').format('YYYY-MM-DD'),
    });

    return result;
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['upcoming-movies'],
    queryFn: getUpcomingMovies,
  });

  const movies = data?.results ?? [];

  return {
    movies,
    isLoading,
  };
};

export default useMovies;
