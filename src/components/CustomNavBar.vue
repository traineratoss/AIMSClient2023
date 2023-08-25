<script setup>
import CustomInput from "../components/CustomInput.vue";
import CustomButton from "../components/CustomButton.vue";
import router from "../router";
import CustomNavigationDropDown from "../components/CustomNavigationDropDown.vue";
import { ref, watch, onMounted } from "vue";
import {
  getCurrentAvatarId,
  getCurrentFullName,
  getCurrentRole,
  getCurrentUsername,
} from "../services/user_service";
import searchValue from "../utils/search-title";
import {useRoute} from 'vue-router';

const route = useRoute();

const searchBarTitle = ref("");

const disabledDashboard = ref(true);
const disabledUser = ref(true);
const currentUsername = ref("");
const currentAvatarId = ref(-1);
const activePage = ref('my');

let userDashboardElements = [];

const isSearchInputFocused = ref(false);

const slideImages = [
  "src/assets/img/avatars/avatar1.svg",
  "src/assets/img/avatars/avatar2.svg",
  "src/assets/img/avatars/avatar3.svg",
  "src/assets/img/avatars/avatar4.svg",
  "src/assets/img/avatars/avatar5.svg",
  "src/assets/img/avatars/avatar6.svg",
  "src/assets/img/avatars/avatar7.svg",
];

function getShortText(text, numberOfRows, numberOfCharacters) {
  let shortText = "";
  let row = "";
  let countRows = 1;
  let splitVar = false;

  if (text.length <= numberOfCharacters * numberOfRows) return text;

  for (let i = 0; i < text.length; i++) {
    if (text[i] == " ") {
      splitVar = true;
    }
  }
  if (splitVar) {
    const wordsArray = text.split(" ");
    for (let word of wordsArray) {
      if (row.length + word.length <= numberOfCharacters - 1) row += " " + word;
      else {
        if (countRows === numberOfRows) {
          row += " ";
          for (let letter of word) {
            if (row.length <= numberOfCharacters - 4) row += letter;
          }
          row += "...";
          shortText += row;
          break;
        } else {
          row += "\n";
          shortText += row;
          countRows++;
          row = word;
        }
      }
    }

    return shortText;
  } else {
    const splitArray = [];
    let returnText = "";

    for (let i = 0; i < text.length; i += numberOfCharacters) {
      splitArray.push(text.slice(i, i + numberOfCharacters));
    }

    for (let i = 0; i < splitArray.length; i++) {
      returnText += splitArray[i] + "\n";
    }

    for (let word of returnText) {
      if (row.length + word.length <= numberOfCharacters - 1) row += "" + word;
      else {
        if (countRows === numberOfRows) {
          row += " ";
          for (let letter of word) {
            if (row.length <= numberOfCharacters - 4) row += letter;
          }
          row += "...";
          shortText += row;
          break;
        } else {
          row += "\n";
          shortText += row;
          countRows++;
          row = word;
        }
      }
    }
    return shortText;
  }
}

const dashboardElements = [
  {
    id: "all-users",
    name: "All users",
    route: "/admin-dashboard",
    icon: "group",
  },
  {
    id: "stats",
    name: "Statistics",
    route: "/all",
    icon: "bar_chart",
  },
];

const isSearchInputFocusedSetter = (focused) => {
  isSearchInputFocused.value = focused;
  console.log(focused)
}

// dont change this watch, it updates the search bar with the input title i give
watch(searchValue, (newValue) => {
  if (newValue.text !== undefined && newValue) {
    searchBarTitle.value = newValue.text;
  }
  if (newValue.key === "Enter" && newValue) {
    if(route.path !== "/all"  && isSearchInputFocused.value) {
      router.push({ path: '/all'});
    }
    searchBarTitle.value = newValue.text;
  }
});


router.beforeEach((to, from) => {
  activePage.value = to.name;
  
  if (
    from.name === "my-profile" ||
    from.name === "login" ||
    to.name === "default"
  ) {
    currentUsername.value = getCurrentUsername();
    currentAvatarId.value = getCurrentAvatarId();
  }

  userDashboardElements = [];

  userDashboardElements.push({
    id: "profile",
    name: "Profile",
    route: "/my-profile",
    icon: "person",
  });

  userDashboardElements.push({
    id: "change-password",
    name: "Change Password",
    route: "/change",
    icon: "settings",
  });

  userDashboardElements.push({
    id: "my-ideas",
    name: "My ideas",
    route: "/my",
    icon: "lightbulb",
  });

  if (getCurrentRole() === "ADMIN") {
    userDashboardElements.push({
      id: "dashboard",
      name: "Dashboard",
      route: "/admin-dashboard",
      icon: "dashboard",
    });
  }

  userDashboardElements.push({
    id: "logout",
    name: "Log out",
    route: "/login",
    icon: "logout",
  });
});

onMounted(() => {
  currentUsername.value = getCurrentUsername();
  currentAvatarId.value = getCurrentAvatarId();
});

function redirectToAllIdeas() {
  router.push("/all");
}

function redirectToMyIdeas() {
  router.push("/my");
}

function redirectToCreateIdea() {
  if(route.path === "/create-idea") {
    window.location.reload();
  } else {
    router.push("/create-idea");
  }
  
}

function onMouseEnterDashboard() {
  disabledDashboard.value = false;
}

function onMouseLeaveDashboard() {
  disabledDashboard.value = true;
}

function onMouseEnterUser() {
  disabledUser.value = false;
}

function onMouseLeaveUser() {
  disabledUser.value = true;
}
</script>


<template>
  <nav id="navbar">
    <img src="../assets/img/AIMS.svg" class="aims-logo" />
    <div class="options">
      <div class="buttons">
        <CustomButton
          class="nav-button"
          id="all-ideas"
          @click="redirectToAllIdeas"
          :is-active="activePage === 'all'"
        >
          All ideas
        </CustomButton>
        <CustomButton
          class="nav-button"
          id="my-ideas"
          @click="redirectToMyIdeas"
          :is-active="activePage === 'my'"
        >
          My ideas
        </CustomButton>
        <div class="dashboard-dropdown">
          <CustomButton
            class="nav-button"
            id="dashboard"
            :is-active="activePage === 'admin-dashboard'"
            @mouseenter="onMouseEnterDashboard"
            @mouseleave="onMouseLeaveDashboard"
            :style="{ display: !(getCurrentRole() === 'ADMIN') ? 'none' : '' }"
          >
            Dashboard
            <span class="material-symbols-outlined"> arrow_drop_down </span>
            <div class="invisible-hover"></div>
          </CustomButton>
          <div class="dropdown-content">
            <CustomNavigationDropDown
              :element="dashboardElements"
              :disabled="disabledDashboard"
            />
          </div>
        </div>
      </div>
      <div>
        <CustomButton
          class="nav-button"
          id="create-idea"
          @click="redirectToCreateIdea"
          :is-active="activePage === 'create-idea'"
        >
          Create idea
        </CustomButton>
      </div>
      <div>
        <CustomInput
          id="search-an-idea"
          class="search-bar"
          placeholder="&#xF002; Search an idea (Title)"
          :type="'text'"
          :can-modify-search-value="true"
          v-model="searchBarTitle"
          @input-focused="isSearchInputFocusedSetter"
        />
      </div>
    </div>
    <div class="user">
      <div class="user-details">
        <h3
          style="font-size: 16px; font-weight: 550; height: 1vh; margin: 1vh 0"
          v-if="currentUsername"
        >
          {{ getShortText(currentUsername, 1, 14) }}
        </h3>
        <router-link
          to="/my-profile"
          style="text-decoration: none; color: black; text-align: center;"
          v-if="getCurrentFullName()"
        >
          {{ getShortText(getCurrentFullName(), 1, 20) || 'User details' }}
        </router-link>
      </div>
      <CustomButton
        class="nav-button"
        id="user-details-button"
        @mouseenter="onMouseEnterUser"
        @mouseleave="onMouseLeaveUser"
        style="padding: 20px 5px"
      >
        <img
          :src="slideImages[currentAvatarId]"
          alt="avatar not found"
          style="height: auto; width: 2vw"
        />
        <span class="material-symbols-outlined"> keyboard_arrow_down </span>
        <div class="dropdown-content-user">
          <CustomNavigationDropDown
            :element="userDashboardElements"
            :disabled="disabledUser"
          />
        </div>
      </CustomButton>
    </div>
  </nav>
</template>


<style scoped>

#all-ideas {
  font-size: 15px;
  border-radius: 1px;
  border-width: 3px;
}

#my-ideas {
  font-size: 15px;
  border-radius: 1px;
  border-width: 3px;
}

#create-idea {
  font-size: large;
  border-radius: 2px;
  border-width: 5px;
}

#dashboard {
  font-size: 15px;
  border-radius: 1px;
}

nav {
  background-color: white;
  box-sizing: border-box;
  display: flex;
  gap: 1vw;
  width: 100vw;
  align-items: center;
  min-height: 6vh;
  border-bottom: 1px solid slategray;
}

.material-symbols-outlined {
  font-size: 2vw;
}

.disabled {
  display: none;
}

.buttons {
  display: flex;
  justify-content: space-between;
  align-content: center;
  align-items: center;
  gap: 1.5vw;
}

.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 80vw;
}

.nav-button {
  font-weight: bold;
  background-color: transparent;
  width: auto;
  height: auto;
  border-color: transparent;
}

.nav-button:hover {
  background-color: var(--selected-color);
}

#dashboard {
  text-align: center;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}

#user-details-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  right: 0;
  margin-right: 1vw;
}

.user {
  display: flex;
  gap: 1vw;
  align-items: center;
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: center;
}

#search-an-idea {
  padding: 2.5px;
  font-family: Segoe UI, FontAwesome;
  border-radius: 3px;
}

.dropdown-content {
  position: absolute;
  width: 100px;
}

.dropdown-content-user {
  position: absolute;
  right: 0;
  width: 200px;
  top: calc(100% + 1px);
  margin-right: -0.1vw;
  z-index: 100;
}

.aims-logo {
  padding-left: 20px;
}

.search-bar{
  border: solid 1px slategray;
}
</style>