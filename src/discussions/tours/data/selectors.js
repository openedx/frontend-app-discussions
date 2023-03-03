// eslint-disable-next-line import/prefer-default-export
import { createSelector } from '@reduxjs/toolkit';

export const selectTours = (state) => state.tours.tours;

export const selectTourByName = (tourName) => createSelector(
  [selectTours],
  (tours) => tours.find(tour => tour.tourName === tourName),
);
