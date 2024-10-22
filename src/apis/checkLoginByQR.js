import httpInstance from "../utils/http";

export function checkQRLogin(ptqrtoken, qrsig) {
  return httpInstance({
    url: `user/checkLoginQr/qq?ptqrtoken=${ptqrtoken}&qrsig=${qrsig}`,
  });
}
