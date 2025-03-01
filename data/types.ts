// Definition of the types used in the application

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  isOwner: boolean;
  isProfileComplete: boolean;
  city: string;
  country: string;
  lastName: string;
  phone: string;
  postcode: string;
  streetAddress: string;
}


export interface Restaurant {
  id: string;
  name: string;
  description: string;
  email: string;
  imageUrls: string[];
  isAvailable: boolean;
  keywords: string[];
  latitude: number;
  longitude: number;
  phone: string;
  streetAddress: string;
  city: string;
  country: string;
  postcode: string;
  userId: string;
  website: string;
  cuisine_one: string;
  cuisine_two: string;
  cuisine_three: string;
  openingHours: string;
  closingHours: string;
  secondOpeningHours: string;
  secondClosingHours: string;
}


export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  photoURL: string;
  restaurantId: string;
}

export interface Review {
  id: string;
  title: string;
  body: string;
  rating: number;
  userId: string;
  restaurantId: string;
}

export interface Table {
  id: string;
  restaurantId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  capacity: number;
  seatsTaken: number;
  isAvailable: boolean;
  createdBy: string;
  tableNumber: number;
}

export interface Reservation {
  id: string;
  userId: string;
  tableId: string;
  restaurantId: string;
  reservationDate: string;
  reservationTime: string;
  numberOfPeople: number;
  isAccepted: boolean;
  isCancelled: boolean;
  isCompleted: boolean;
}
