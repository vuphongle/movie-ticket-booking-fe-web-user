import blog from "./blog";
import common from "./common";
import menu from "./menu";
import movie from "./movie";
import review from "./review";
import coupon from "./coupon";
import profile from "./profile";
import movieDetail from "./movieDetail";
import booking from "./booking";

const en = {
  ...common,
  ...menu,
  ...movie,
  ...blog,
  ...review,
  ...coupon,
  ...profile,
  ...movieDetail,
  ...booking,
};

export default en;
