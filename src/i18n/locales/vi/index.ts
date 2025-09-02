import blog from "./blog";
import common from "./common";
import menu from "./menu";
import movie from "./movie";
import review from "./review";
import coupon from "./coupon";    
import profile from "./profile";
import movieDetail from "./movieDetail";


const vi = {
  ...common,
  ...menu,
  ...movie,
  ...blog,
  ...review,
  ...coupon,
  ...profile,
  ...movieDetail,
};

export default vi;
