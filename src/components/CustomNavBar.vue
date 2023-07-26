<script setup>
import CompanyLogo from "../components/CompanyLogo.vue";
import CustomInput from "../components/CustomInput.vue";
import CustomButton from "../components/CustomButton.vue";
import router from "../router";
import CustomNavigationDropDown from "../components/CustomNavigationDropDown.vue"
import { computed, ref } from "vue";

const indexOfActivePage = ref(1);
const disabledDashboard = ref(true);
const disabledUser = ref(true);

function redirectToAllIdeas() {
    indexOfActivePage.value = 1;
    router.push('/all');
}

function redirectToMyIdeas() {
    indexOfActivePage.value = 2;
    router.push('/my');
}

function redirectToDashboard() {
    indexOfActivePage.value = 3;
    router.push('/admin-dashboard');
}

function redirectToCreateIdea() {
    indexOfActivePage.value = 4;
    router.push('/create-idea');
}

function redirectToMyProfile() {
    router.push('/my-profile');
}

function isPageWithIndexActive(index) {
  return indexOfActivePage.value == index ? true : false;
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


const dashboardElements = [
    {
        name: "All users",
        route: "/admin-dashboard",
        icon: "src/assets/img/allusers_icon.png",
        width: '20%',
        height: '90%'
    },
    {
        name: "Statistics",
        route: "/statistics",
        icon: "src/assets/img/statistics_icon.png",
        width: '20%',
        height: '90%'
    }
]

const userDashboardElements = [
    {
        name: "Profile",
        route: "/my-profile",
        icon: "src/assets/img/avatar_icon.png",
        width: '10%',
        height: '90%'
    },
    {
        name: "Change Password",
        route: "/app",
        icon: "src/assets/img/settings_icon.png",
        width: '10%',
        height: '90%'
    },
    {
        name: "My ideas",
        route: "/my",
        icon: "src/assets/img/bulb_icon.png",
        width: '10%',
        height: '90%'
    },
    {
        name: "Dashboard",
        route: "/admin-dashboard",
        icon: "src/assets/img/dashboard_icon.png",
        width: '10%',
        height: '90%'
    },
    {
        name: "Log out",
        route: "/app",
        icon: "src/assets/img/logout_icon.png",
        width: '10%',
        height: '90%'
    }
]

</script>


<template>
    <nav id="navbar">
        <CompanyLogo
        />
        <div class="options">
            <div class="buttons">
                <CustomButton 
                    class = "nav-button" 
                    id="all-ideas"
                    @click="redirectToAllIdeas"
                    :is-active=isPageWithIndexActive(1)
                >
                    All ideas
                </CustomButton>
                <CustomButton 
                    class = "nav-button" 
                    id="my-ideas"
                    @click="redirectToMyIdeas"
                    :is-active=isPageWithIndexActive(2)
                >
                    My ideas
                </CustomButton>
                <div 
                class="dashboard-dropdown">
                    <CustomButton 
                        class = "nav-button" 
                        id = "dashboard"
                        :is-active=isPageWithIndexActive(3)
                        @mouseenter="onMouseEnterDashboard"
                        @mouseleave="onMouseLeaveDashboard"
                    >
                        Dashboard 
                    <i class="fa-solid fa-caret-down fa-xl"></i>
                    <div class="invisible-hover"></div>
                    </CustomButton>
                    <div class="dropdown-content">
                        <CustomNavigationDropDown
                        :element="dashboardElements"
                        :disabled="disabledDashboard">
                        </CustomNavigationDropDown>
                    </div>
                </div>
            </div>
            <div>
                <CustomButton 
                    class = "nav-button" 
                    id="create-idea"
                    @click="redirectToCreateIdea"
                    :is-active=isPageWithIndexActive(4)
                >
                    Create an Idea
                </CustomButton>
            </div>
            <div>
                <CustomInput id ="search-an-idea" placeholder="&#xF002; Search an Idea (Title)" style="font-family: Segoe UI, FontAwesome"/>
            </div>
        </div>
        <div class="user">
            <div class="user-details">
                <h3 style="font-size: 16px; font-weight: 550; height: 1vh;">Username</h3>
                <router-link to="/my-profile" style="text-decoration: none; color: black">User details</router-link>
            </div>
            <CustomButton 
                class = "nav-button" 
                id="user-details-button"
                @mouseenter="onMouseEnterUser"
                @mouseleave="onMouseLeaveUser"
            >
                <i class="fa-solid fa-user fa-2xl"></i>
                <i class="fa-solid fa-chevron-down fa-xl"></i>
                <div class="dropdown-content-user">
                    <CustomNavigationDropDown
                    :element="userDashboardElements"
                     :disabled="disabledUser">
                    </CustomNavigationDropDown>
                </div>
            </CustomButton>
        </div>
    </nav>    
</template>


<style scoped>

.dashboard-hovered {
  background-color: var(--selected-color);
}

nav {
    background-color: white;
    display: flex;
    gap: 5vw;
    width: 100vw;
    align-items: center;
    height: 9vh;
}

.buttons {
    display: flex;
    justify-content: space-between;
    align-content: center;
    width: 15vw;
    align-items: center;
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
}

.nav-button:hover {
    background-color: var(--selected-color);
}

#dashboard {
    text-align: center;
    width: 100%;
    height: 100%;
}


#user-details-button {
    position: relative; 
    display: flex;
    align-items: center;
    justify-content: center;
    right: 0;
    margin-right: 1vw;
    height: 7vh;
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
}
</style>