import type { Entry } from '~/models/entry';

export const useEntry = () => {
  const getEntry = (): Promise<Entry> => {
    return $fetch(`${import.meta.env.VITE_API}/entry`);
  };

  return {
    getEntry,
  };
};
