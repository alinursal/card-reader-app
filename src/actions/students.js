//import { normalize } from "normalizr";
//import { USERS_FETCHED } from "../types";
import api from "../api";
//import { studentSchema } from "../schemas";

/*
const othersFetched = data => ({
type: USERS_FETCHED,
data
});


export const fetchStudents = (data) => (dispatch) =>{
 api.students
 .fetchAll(data)
 .then(students => {
    dispatch(othersFetched(normalize(students, [studentSchema])))
 });
}

*/

export const submitOneStudent = (data) => () => api.students.submitOneStudent(data);