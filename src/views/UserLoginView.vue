<script setup>
import FormTitle from "../components/FormTitle.vue";
import CompanyLogo from "../components/CompanyLogo.vue";
import router from "../router";
import { ref } from "vue";
import { loginUser, isFirstLogin } from "../services/user_service.js";
import CustomInput from "../components/CustomInput.vue";
import InvalidInputMessage from "../components/InvalidInputMessage.vue";
import bcrypt from "bcryptjs";
import PasswordInput from "../components/PasswordInput.vue";
import CustomButton from "../components/CustomButton.vue";

const usernameOrEmailText = ref("");
const passwordText = ref("");
const showErrorMessage = ref(false);
const errorMessage = ref("");

function redirectToRegister() {
  router.push("/register");
}

async function login() {
  const hashPassword = await bcrypt.hash(
    passwordText.value,
    "$2a$10$QkRidA35ea0Fzm/ObrOEgO"
  );
  if (usernameOrEmailText.value && passwordText.value) {
    loginUser(usernameOrEmailText.value, hashPassword)
      .then((res) => {
        // isFirstLogin(usernameOrEmailText.value)
        //   .then(res => {
        //     if (res) {
        //       router.push("/change");
        //     } else {
        router.push("/my");
        //     }
        //   })
        // const firstLogin = localStorage.getItem("isFirstLogin");
        // if (firstLogin === "true") {

        // }
        console.log(localStorage.getItem("isFirstLogin"));
      })
      .catch((error) => {
        usernameOrEmailText.value = "";
        passwordText.value = "";
        showErrorMessage.value = true;
        errorMessage.value = error.message;
      });
  } else {
    showErrorMessage.value = true;
    errorMessage.value = "The fields must not be empty";
    passwordText.value = "";
  }
}

function handlePasswordTextChanged(password) {
  passwordText.value = password;
}
</script>

<template>
  <CompanyLogo />
  <div class="container">
    <FormTitle label="Log In" />

    <InvalidInputMessage
      :message="errorMessage"
      :class="{ 'error-message-visible': showErrorMessage }"
    />
    <div>
      <CustomInput
        type="text"
        id="username-email-input"
        placeholder="Username/E-mail"
        v-model:model-value="usernameOrEmailText"
        :widthInPx="9"
      />
    </div>
    <div id="password-input">
      <PasswordInput
        :label="'Password'"
        :value="passwordText"
        @password-changed="handlePasswordTextChanged"
        @enter-password="login"
      />
    </div>
    <div>
      <CustomButton id="sign-in" @click="login">Log in</CustomButton>
    </div>
    <div id="forgot-password">
      <router-link to="/recovery"> Forgot password? </router-link>
    </div>
    <button id="register" @click="redirectToRegister">Register</button>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  position: relative;
  margin-top: 10vh;
}

.material-symbols-outlined {
  font-size: 10vh;
}

.error-message-visible {
  opacity: 1;
}

input {
  padding: 5px;
  border: none;
}

button {
  padding: 5px;
  padding-right: 30px;
  padding-left: 30px;
  cursor: pointer;
}

#register {
  border: none;
  position: relative;
  bottom: -5vh;
}

#sign-in {
  font-size: 15px;
  font-weight: 500;
}

#forgot-password {
  text-decoration: underline;
}

#forgot-password:hover {
  cursor: pointer;
}

h1,
h1 span {
  font-size: 30px;
}

#company-logo {
  position: relative;
  top: 20px;
  left: 5vw;
}

#user-icon {
  font-size: 70px;
}

a {
  color: black;
}
</style>
