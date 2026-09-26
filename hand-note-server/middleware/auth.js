const jwt = require('jsonwebtoken');

/**
 * 统一JWT鉴权中间件，全项目路由共用
 * 请求头： token: jwt字符串
 * 解析成功挂载 req.user = {userId,username}
 */
function authMid(req, res, next) {
  const token = req.headers.token;
  if (!token) {
    return res.json({ code: 401, msg: "未登录" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.json({ code: 401, msg: "登录已过期，请重新登录" });
  }
}

module.exports = { authMid };
