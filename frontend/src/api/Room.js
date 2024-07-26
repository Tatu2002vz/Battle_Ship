import axios from '../axios'

export const apiGetRooms = () => axios({
    url: 'api/room',
    method: 'GET',
})

export const apiGetRoom = ({id}) => axios({
    url: 'api/room/' + id,
    method: 'GET',
})