1. **技术栈**

- 前端：Vue3 + Vite + Pinia，Capacitor 打包移动端 App；代码拆分，业务全部抽入 components，App.vue 保持简洁
- 后端：Express
- 数据库：MySQL

###  前端目录
hand-note-app
├── index.html
├── vite.config.js
├── capacitor.config.ts
├── package.json
├── src
│   ├── App.vue          // 尽量少量代码，只放router‑view
│   ├── main.js
│   ├── router
│   │   └── index.js     // 路由：首页 /手账本列表 /手账查看页 /登录注册
│   ├── stores
│   │   ├── user.js      // pinia用户状态：登录token、username
│   │   ├── homeTempCanvas.js   //首页多个临时画布状态（仅首页使用）
│   │   └── notebookEditStore.js //独立手账编辑页面状态
│   ├── components
│   │   ├── CanvasGrid.vue          //通用网格画布组件（复用！首页、手账编辑页共用）
│   │   ├── CanvasItemCheckin.vue   //打卡元素组件
│   │   ├── CanvasItemMonthStat.vue   //月度打卡统计组件
│   │   ├── CanvasItemTextbox.vue  //文字框组件
│   │   ├── CanvasItemSticker.vue  //贴纸（支持用户上传图片贴纸）
│   │   ├── BottomEditToolbar.vue  //底部编辑工具栏（打卡/文字框/上传贴纸）
│   │   ├── TempCanvasSwitch.vue   //首页顶部临时画布切换栏
│   │   └── UserHeaderBar.vue      //顶部用户栏：用户名+退出登录按钮
│   ├── pages
│   │   ├── LoginRegisterPage.vue  //登录注册页
│   │   ├── HomePage.vue           //首页（独立临时画布，不受手账本打开影响）
│   │   ├── NotebookListPage.vue   //手账本列表页
│   │   └── NotebookViewPage.vue   //👉独立页面打开已保存手账；查看+编辑按钮
│   └── api
│       ├── userApi.js
│       └── notebookApi.js
│       └── checkinApi.js

###  后端目录
hand-note-server
├── package.json
├── app.js
├── .env
├── db
│   └── db.js          //mysql连接
├── routes
│   ├── userRoute.js
│   ├── notebookRoute.js
│   └── uploadRoute.js //贴纸图片上传接口
│   └── checkinRoute.js
├── public
│   └── upload         //上传贴纸图片存放目录
└── sql
    └── init.sql       //数据库建表脚本

