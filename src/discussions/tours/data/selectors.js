export const notRespondedFilterTour = ({ tours }) => {
  // This function filters the tours list in the state by the tour_name 'not_responded_filter'
  // and returns the filtered list. This can be useful for displaying only the 'not_responded_filter'
  // tours to the user, for example in a list or table.
  if (!tours) {
    return {};
  }
  const response = tours.tours.find(tour => tour.tourName === 'not_responded_filter');
  return response || {};
};
