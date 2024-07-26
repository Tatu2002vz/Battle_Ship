import axios from '../axios'

export const apiGetRooms = () => axios({
    url: 'room',
    method: 'GET',
})