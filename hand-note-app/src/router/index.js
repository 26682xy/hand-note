import {createRouter,createWebHistory} from "vue-router";
import LoginRegisterPage from "@/pages/LoginRegisterPage.vue";
import HomePage from "@/pages/HomePage.vue";
import NotebookListPage from "@/pages/NotebookListPage.vue";
import NotebookViewPage from "@/pages/NotebookViewPage.vue";

const routes = [
  {path:"/",redirect:"/home"},
  {path:"/login",component:LoginRegisterPage},
  {path:"/home",component:HomePage},
  {path:"/notebook-list",component:NotebookListPage},
  {path:"/notebook-view/:id",component:NotebookViewPage}
]

const router = createRouter({
  history:createWebHistory(),
  routes
})

//简单登录守卫
router.beforeEach((to,from,next)=>{
  const token = localStorage.getItem("token");
  if(to.path !== '/login' && !token){
    next("/login");
  }else{
    next();
  }
})

export default router;
