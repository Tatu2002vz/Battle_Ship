import axios from '../axios'

export const apiGetRoom = () => axios({
    url: 'api/room',
    method: 'GET',
})