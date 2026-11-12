import { useEffect, useState } from 'react';
import { fetchFeaturedLessons } from '../services/lessons';
import { Lesson } from '../types';

export default function useFeaturedLessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    let active = true;
    fetchFeaturedLessons()
      .then((result) => {
        if (active) setLessons(result);
      })
      .catch(() => {
        if (active) setLessons([]);
      });
    return () => {
      active = false;
    };
  }, []);

  return lessons;
}
