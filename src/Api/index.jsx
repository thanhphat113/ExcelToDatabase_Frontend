import axios from "axios";

const Api = axios.create({
	baseURL: "http://localhost:5130",
	withCredentials: true
})

export default Api