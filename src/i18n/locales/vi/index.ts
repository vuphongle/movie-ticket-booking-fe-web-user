import blog from "./blog";
import common from "./common";
import menu from "./menu";
import movie from "./movie";
import review from "./review";
import coupon from "./coupon";
    

const en = {
  ...common,
  ...menu,
  ...movie,
  ...blog   ,
  ...review,
  ...coupon
};

export default en;
