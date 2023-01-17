import { createSelector } from '@reduxjs/toolkit';

export const selectTours = (state) => state.tours.tours;
//
// export const notRespondedFilterTour = createSelector(
//   // This function filters the tours list in the state by the tour_name 'not_responded_filter'
//   // and returns the filtered list. This can be useful for displaying only the 'not_responded_filter'
//   // tours to the user, for example in a list or table.
//   selectTours,
//   (tours) => (tours.find(tour => tour.tourName === 'not_responded_filter')),
// );
