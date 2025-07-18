import React from 'react';
// Assuming TapRating and SwipeRating are now available at the root level of 'react-native-ratings'
import TapRating, { type TapRatingProps as RatingProps } from './TapRating';
import { RneFunctionComponent } from '../helpers';

export interface TapRatingProps extends RatingProps {}

export const AirbnbRating: RneFunctionComponent<TapRatingProps> = (props) => {
  return <TapRating {...props} />;
};

AirbnbRating.displayName = 'AirbnbRating';
