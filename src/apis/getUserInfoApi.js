import httpInstance from "../utils/http"

export function fetchUserInfo(QQ_id) {
  return httpInstance({
    url: `/user/detail?id=${QQ_id}`,
  })
}
