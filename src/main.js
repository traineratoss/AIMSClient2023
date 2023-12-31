import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'


const app = createApp(App);
app.use(router)

app.mount('#app')



// import { createApp } from "vue";
// import App from "./securityTest/App.vue";
// import router from "./securityTest/router";
// import store from "./securityTest/storeTEST"
// import "bootstrap";
// import "bootstrap/dist/css/bootstrap.min.css";

// createApp(App)
//   .use(router)
//   .use(store)
//   .mount("#app");
