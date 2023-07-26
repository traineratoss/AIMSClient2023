import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import CommentView from "../views/CommentView.vue";
import AllIdeasView from "../views/AllIdeasView.vue";
import UserLoginView from "../views/UserLoginView.vue";
import MyIdeasView from "../views/MyIdeasView.vue";
import PasswordRecoveryView from "../views/PasswordRecoveryView.vue";
import RegisterView from "../views/RegisterView.vue";
import RegistrationCompleteViewVue from "../views/RegistrationCompleteView.vue";
import ChangePasswordView from "../views/ChangePasswordView.vue";
import CosminPlayground from "../views/CosminPlayground.vue";
import TermsAndConditionsView from "../views/TermsAndConditionsView.vue";
import MyProfileView from "../views/MyProfileView.vue";
import AdminDashboardView from "../views/AdminDashboardView.vue";
import CreateIdeaView from "../views/CreateIdeaView.vue";
import NewPasswordChanged from "../views/NewPasswordChanged.vue";
import PageNotFound from "../views/PageNotFound.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/comment",
      name: "comment",
      component: CommentView,
    },
    {
      path: "/all",
      name: "all",
      component: AllIdeasView,
    },
    {
      path: "/my",
      name: "my",
      component: MyIdeasView,
    },
    {
      path: "/login",
      name: "login",
      component: UserLoginView,
    },
    {
      path: "/my-profile",
      name: "my-profile",
      component: MyProfileView,
    },
    {
      path: "/recovery",
      name: "recovery",
      component: PasswordRecoveryView,
    },
    {
      path: "/register/:accepted",
      name: "register",
      component: RegisterView,
    },
    {
      path: "/create-idea",
      name: "create-idea",
      component: CreateIdeaView,
    },
    {
      path: "/registration-complete",
      name: "registration-complete",
      component: RegistrationCompleteViewVue,
    },
    {
      path: "/change",
      name: "change",
      component: ChangePasswordView,
    },
    {
      path: "/terms",
      name: "terms",
      component: TermsAndConditionsView,
    },
    {
      path: "/my-profile",
      name: "my profile",
      component: MyProfileView,
    },
    {
      path: "/admin-dashboard",
      name: "admin-dashboard",
      component: AdminDashboardView,
    },
    {
      path: "/test",
      name: "test",
      component: CosminPlayground,
    },
    {
      path: "/password-changed",
      name: "password-changed",
      component: NewPasswordChanged,
    },
    {
      path: "/:pathMatch(.*)*",
      name: "page-not-found",
      component: PageNotFound,
    },
  ],
});

/*

FlorinCP : 

If you want to check Authorized status everytime a navigating action is trigger,
just add router.beforeEach() inside src/router.js like this:

*/

// router.beforeEach((to, from, next) => {
//   const publicPages = ['/login', '/register', '/home'];
//   const authRequired = !publicPages.includes(to.path);
//   const loggedIn = localStorage.getItem('user');

//   // trying to access a restricted page + not logged in
//   // redirect to login page
//   if (authRequired && !loggedIn) {
//     next('/login');
//   } else {
//     next();
//   }
// });

export default router;
