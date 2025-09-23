import { createSelector } from "reselect";
import { USERS_FETCHED } from "../types";

export default function students(state = {}, action = {}) {
  switch (action.type) {
  	case USERS_FETCHED:
  	  return { ...state, ...action.data.entities.students };
    default:
      return state;
  }
}

// SELECTORS

export const othersStudents = state => state.students;

export const allStudentsSelector = createSelector(othersStudents, othersHash =>
  Object.values(othersHash)
);