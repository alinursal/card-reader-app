import api from "../api";

export const submitCardData = (data) => () => api.card.submitCardData(data);

export const submitOneCard = (data) => () => api.card.submitOneCard(data);