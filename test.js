import moment from "moment";

console.log(moment(Date.now()).utcOffset("+05:30").format("lll"));
