import api from "../api";

export const eligibleUploadSubmit = (data) => () => api.manage.eligibleUploadSubmit(data);