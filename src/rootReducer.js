import { combineReducers } from "redux";

import user from "./reducers/user";
import students from "./reducers/students";

export default combineReducers({
  user,
  students
});