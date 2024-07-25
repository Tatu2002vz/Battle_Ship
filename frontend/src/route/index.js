import LeaderBoard from "../component/LeaderBoard";
import DefaultLayout from "../layout";
import Home from "../page/Home";
import Playing from "../page/Playing";
import Room from "../page/Room";

const publicRoute = [
  { path: "/", component: Home, layout: DefaultLayout },
  { path: "/room/:id", component: Room, layout: DefaultLayout },
  { path: "/playing/:id", component: Playing, layout: DefaultLayout },
  { path: "test", component: LeaderBoard, layout: DefaultLayout}
];
export default publicRoute;
