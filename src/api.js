import axios from "axios";

const apiMethods = {
  user: {
    login: credentials => 
      axios.post("http://localhost:8080/api/auth", { credentials })
        .then(res => res.data.user),
    confirmUserName: username => 
      axios.post("http://localhost:8080/api/auth/signinvalidation", { username })
        .then(res => res.data.user),
  },
  card: {
    submitCardData: (data) => {
      return axios.post('http://localhost:8080/api/cards/submitnow', {data})
        .then((response) => {
          return response.data;
        })
        .catch((error) => {
          return Promise.reject(error);
        });
    },
    submitOneCard: (data) => {
      return axios.post('http://localhost:8080/api/cards/cardadd', {data})
        .then((response) => {
          return response.data;
        })
        .catch((error) => {
          return Promise.reject(error);
        });
    }
  },
  manage: {
    eligibleUploadSubmit: (data) => {
      axios.post("http://localhost:8080/api/manage/upload", {data})
        .then(res => res.data.manage)
    }
  },
  students: {
    fetchAll: () => axios.get('http://localhost:8080/api/users/students').then(res => res.data.students),
    submitOneStudent: data => 
      axios.post("http://localhost:8080/api/users/add", { data })
        .then(res => res.data),
  }
};

export default apiMethods;