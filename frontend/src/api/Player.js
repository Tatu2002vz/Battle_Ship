import axios from '../axios'

export const apiGetRoom = () => axios({
    url: 'room',
    method: 'GET',
})