import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

export function useTodos() {
  const { data, error, mutate } = useSWR('/api/todos', fetcher);

  return {
    todos: data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
